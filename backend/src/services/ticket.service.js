const fs = require('fs');
const fsPromises = require('fs').promises;
const { Event } = require('../models/event.model');
const pdfjsLib = require('pdfjs-dist');
const jsQR = require('jsqr');
const jimp = require('jimp');
const sample_events = require('../data/events');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const Notification = require('../models/notification.model');
const pdfParse = require('pdf-parse');
const path = require('path');
const { writeFile } = require('fs');
const { NotificationType } = require('../constants/notification_type');
const pdfPoppler = require('pdf-poppler');
const zxing = require('node-zxing')({ scale: 2 });
// const { PDFParser } = require('pdf2json');

async function processTicket(pdfBuffer, eventDate, savedFileId) {
  const pdfPath = path.join(__dirname, '..', 'uploads', 'pdf', 'temp.pdf');
  await fsPromises.writeFile(pdfPath, pdfBuffer);
  const imageDir = path.join(__dirname, '..', 'uploads', 'images');
  const imagePaths = await convertPdfToImage(pdfPath, imageDir);
  const results = [];
  let i = 0;
  for (const imagePath of imagePaths) {
    const qrCode = await detectAndReadQRCode(imagePath);
    const barcode = await detectAndReadBarcode(imagePath);
    const match = checkQRAndBarcodeMatch(qrCode, barcode);
    const dateIsValid = checkDateIsValid(eventDate);
    let errorMessage = '';
    if (qrCode && barcode && !match) {
      errorMessage = 'Error: QR Code and Barcode do not match';
    } else if (!qrCode || !barcode) {
      errorMessage = 'Error: A valid ticket should contain both a QR Code and a Barcode';
    }
    else if (!dateIsValid) {
      errorMessage = 'Error: Ticket date is not valid';
    }
    const ticket = await parseTicketDetails(pdfBuffer, ++i, savedFileId);
    ticket.valid = match && dateIsValid;
    ticket.errorMessage = errorMessage;
    results.push(ticket);
    await fsPromises.unlink(imagePath);
  }
  await fsPromises.unlink(pdfPath);
  return { validTickets: results.filter(ticket => ticket.valid).length, tickets: results };
}

async function parseTicketDetails(pdfBuffer, i, savedFileId) {
  const data = await pdfParse(pdfBuffer);
  const text = data.text;
  const lines = data.text.split('\n');

  const artistNameMatch = text.match(/Name:\s*(.*)/);
  const dateAndTimeMatch = text.match(/(\d{2}\/\d{2}\/\d{2} - \d{2}:\d{2})/);
  const gateMatch = text.match(/שער\s*(\d{1,2})/);

  const artistName = artistNameMatch ? artistNameMatch[1] : null;
  const dateAndTime = dateAndTimeMatch ? dateAndTimeMatch[1] : null;
  const gate = gateMatch ? "שער " + gateMatch[1] : null;

  let ticketPrice, block;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('₪')) {
      const priceMatch = lines[i-3].match(/(\d+\.\d{2})/);
      ticketPrice = priceMatch ? priceMatch[1] : null;
    } else if (lines[i].includes('Block:') && lines[i - 5]) {
      block = lines[i - 5].trim();
    }
  }
  const [date, time] = dateAndTime.split(' - ');
  const [month, day, year] = date.split('/');
  const eventDate = new Date(`20${year}-${month}-${day}T${time}:00`).toISOString();
  
  console.log("fileId: " + savedFileId);

  const ticket = {
    artists: artistName,
    price: ticketPrice,
    venue: "Park hayarkon",
    eventDate: eventDate,
    fileName: 'ticket.pdf',
    status: "On sale",
    description: `Block: ${block}, Gate: ${gate}`,
    fileIds: [savedFileId]
  };

  return ticket;
}

async function convertPdfToImage(pdfPath, outputPath) {
  let opts = {
      format: 'jpeg',
      out_dir: outputPath,
      out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
      page: null
  }
  try {
      let imagePaths = [];
      await fsPromises.mkdir(opts.out_dir, { recursive: true });
      await pdfPoppler.convert(pdfPath, opts);
      imagePaths = fs.readdirSync(opts.out_dir)
          .filter(filename => filename.startsWith(opts.out_prefix))
          .map(filename => path.join(opts.out_dir, filename));
      return imagePaths;
  } catch (error) {
      console.error('Error converting PDF to image: ', error);
      return null;
  }
}

async function detectAndReadQRCode(imagePath) {
  const image = await jimp.read(imagePath);
  const qrCode = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
  if (qrCode) {
      return qrCode.data;
  } else {
      return null;
  }
}

async function detectAndReadBarcode(imagePath) {
  return new Promise((resolve, reject) => {
    zxing.decode(imagePath, function(err, barcode){
      if(err) {
        reject(err);
      } else {
        resolve(barcode);
      }
    });
  });
}

function checkQRAndBarcodeMatch(qrCode, barcode) {
  return qrCode === barcode;
}

function checkDateIsValid(date) {
  const currentDate = new Date();
  return date >= currentDate;
}

async function updateEventAvailableTickets(eventId, quantity) { 
  return await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: -quantity, soldTickets: quantity } }, { new: true }); 
}

async function updateTicketStatus(eventId, buyerId) {
  try {
    const soldDate = new Date().toISOString();
    const ticket = await Ticket.findOne({ eventId: eventId, isSold: false });
    if(!ticket) {
      throw new Error('No available tickets found for this event');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.error('Event not found');
    }
    else {
      const sellerNotificationMessage = `You have sold a ticket for ${event.name}'s concert`;
      const sellerNotification = new Notification({ userId: ticket.seller, message: sellerNotificationMessage, eventId: eventId, type: NotificationType.purchase });
      await sellerNotification.save();
    }
    return await Ticket.findByIdAndUpdate(ticket._id, { isSold: true, buyer: buyerId, soldDate }, { new: true });
  } catch(err) {
    console.error(err);
    throw new Error('Failed to update ticket status');
  }
}

async function getSellingTickets(userId) {
  const tickets = await Ticket.find({ seller: userId }).populate('eventId').populate('fileIds');
  const formattedTickets = formatTicketDetails(tickets);
  return formattedTickets;
}

async function getBoughtTickets(userId) {
  const tickets = await Ticket.find({ buyer: userId }).populate('eventId').populate('fileIds');
  const formattedTickets = formatTicketDetails(tickets);
  return formattedTickets;
}

async function formatTicketDetails(tickets) {
  return Promise.all(tickets.map(async ticket => {
      const ticketObject = ticket.toObject();
      const { eventId, fileIds, ...ticketDetails } = ticketObject;
      const { _id, name, description, date, location, image, ...eventDetails } = eventId;
      
      const files = await Promise.all(fileIds.map(async id => {
        const file = await File.findById(id);
        return Buffer.from(file.data).toString('base64');
      }));

      const formattedTicketDetails = {
        eventDate: ticketDetails.eventDate,
        location: ticketDetails.location,
        price: ticketDetails.price,
        isSold: ticketDetails.isSold,
        soldDate: ticketDetails.soldDate,
        seller: ticketDetails.seller,
        buyer: ticketDetails.buyer,
        description: ticketDetails.description
      };

      return {
          event: {
              id: _id,
              name: name,
              description: description,
              date: date,
              location: location,
              image: image
          },
          ticketDetails: formattedTicketDetails,
          files: files
      };
  }));
}

async function loadPdf(pdfPath) {
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument(data).promise;
  return pdf;
}

// async function extractQRCodeFromPDF(pdfPath) {
//   const pdfParser = new PDFParser();
//   pdfParser.on('pdfParser_dataError', (err) => console.error(err.parserError));
//   pdfParser.on('pdfParser_dataReady', (pdfData) => {
//     const image = pdfData.formImage.Pages[0].Texts.find((text) => {
//       return text.R[0].T === 'QRCode';
//     });
//     if (image) {
//       const imageData = Buffer.from(image.R[0].T, 'base64');
//       decodeQRCodeFromBuffer(imageData);
//     } else {
//       console.error('No QR code found in PDF');
//     }
//   });
//   pdfParser.loadPDF(pdfPath);
// }

// async function processTicket(pdfPath, outputDir, pdfName) {
//   console.log('Processing ticket...');
//   extractQRCodeFromPDF(pdfPath);
//   return "text";
// }

function generateRandomTicket() {
  const locations = ['Madison Square Garden', 'Wembley Stadium', 'Camp Nou', 'Old Trafford', 'Maracanã'];
  const statuses = ['On sale', 'Sold out', 'Cancelled'];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomPrice = (Math.random() * 100).toFixed(2);
  const currentDate = new Date();
  const randomDate = getRandomDate(currentDate);
  let numTickets;
  const randomNum = Math.random();
  if (randomNum <= 0.55) {
    numTickets = 1;
  } else {
    numTickets = Math.floor(Math.random() * 5) + 2; // Random number between 2 and 6
  }
  const tickets = [];
  for (let i = 0; i < numTickets; i++) {
    const ticket = {
      price: randomPrice,
      location: randomLocation,
      eventDate: randomDate.toISOString().split('T')[0],
      fileName: 'ticket.pdf',
      status: randomStatus
    };
    tickets.push(ticket);
  }
  return tickets;
}

function getRandomDate(currentDate) {
  const maxDaysAfter = 7; // Maximum number of days after the current date
  const randomDays = Math.floor(Math.random() * (maxDaysAfter + 1)); // Generate a random number of days (0-maxDaysAfter)
  const randomDate = new Date(currentDate);
  randomDate.setDate(currentDate.getDate() + randomDays); // Add the random number of days to the current date
  return randomDate;
}

module.exports = {
  getSellingTickets,
  getBoughtTickets,
  updateEventAvailableTickets,
  updateTicketStatus,
  processTicket,
  generateRandomTicket
};