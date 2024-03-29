const fs = require('fs');
const fsPromises = require('fs').promises;
const { Event } = require('../models/event.model');
const jsQR = require('jsqr');
const jimp = require('jimp');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const Notification = require('../models/notification.model');
const pdfParse = require('pdf-parse');
const path = require('path');
const { NotificationType } = require('../constants/notification_type');
const pdfPoppler = require('pdf-poppler');
const zxing = require('node-zxing')({ scale: 2 });
const { getEventByNameDate } = require('../services/event.service');

// process the ticket - read barcode and and other details, check validity, and match to an existing event.
// gets pdf file buffer and a userID
// returns an object containing the count of valid tickets, an array of all parsed tickets, and in error message if any errors occured during the process.
async function processTicket(pdfBuffer, userId) {
  const pdfPath = path.join(__dirname, '..', 'uploads', 'pdf', 'temp.pdf');
  await fsPromises.writeFile(pdfPath, pdfBuffer);
  const imageDir = path.join(__dirname, '..', 'uploads', 'images');
  const imagePaths = await convertPdfToImage(pdfPath, imageDir);
  const results = [];
  let error = null;
  // loop through all images created from the pdf file
  for (const imagePath of imagePaths) {
    const qrCode = await detectAndReadQRCode(imagePath);
    const barcode = await detectAndReadBarcode(imagePath);
    const match = checkQRAndBarcodeMatch(qrCode, barcode);
    if (qrCode && barcode && !match) {
      error = 'Error: QR Code and Barcode do not match';
      break;
    } else if (!qrCode || !barcode) {
      error = 'Error: A valid ticket should contain both a QR Code and a Barcode';
      break;
    }
    const ticket = await parseTicketDetails(pdfBuffer, barcode, userId);
    if (checkDateIsValid(ticket.eventDate)) {
      error = 'Error: Ticket date is not valid';
      break;
    }
    if (ticket.error) {
      error = ticket.error;
      break;
    }
    const event = await getEventByNameDate(ticket.artists, ticket.eventDate); 
    ticket.location = event.location;
    console.log(event);
    ticket.venue = event.venue;
    ticket.valid = match;
    results.push(ticket);
    await fsPromises.unlink(imagePath);
  }
  await fsPromises.unlink(pdfPath);
  return { validTickets: results.filter(ticket => ticket.valid).length, tickets: results, error: error };
}

// parse details of a ticket and create new ticket document in the DB.
// get a pdf buffer, barcode and user id.
// returns a ticket object
async function parseTicketDetails(pdfBuffer, barcode, userId) {
  let data, text, lines;
  try {
    data = await pdfParse(pdfBuffer);
    text = data.text;
    lines = data.text.split('\n');
  } catch (err) {
    return { error: 'Failed to parse PDF document. The file might be corrupted or not a valid PDF document.' };
  }
  
  const artistNameMatch = text.match(/Name:\s*(.*)/);
  const dateAndTimeMatch = text.match(/(\d{2}\/\d{2}\/\d{2} - \d{2}:\d{2})/);
  const gateMatch = text.match(/שער\s*(\d{1,2})/);

  const artistName = artistNameMatch ? artistNameMatch[1] : null;
  const dateAndTime = dateAndTimeMatch ? dateAndTimeMatch[1] : null;
  const gate = gateMatch ? "שער " + gateMatch[1] : null;

  let ticketPrice, block;

  // get ticket price and description
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('₪')) {
      const priceMatch = lines[i-3].match(/(\d+\.\d{2})/);
      ticketPrice = priceMatch ? priceMatch[1] : null;
    } else if (lines[i].includes('Block:') && lines[i]) {
      block = lines[i-4].trim();
      block += "\n" + lines[i-3].trim();
      block += "\n" + lines[i-2].trim();
      block += "\n" + lines[i-1].trim();
    }
  }
  const [date, time] = dateAndTime.split(' - ');
  const [day, month, year] = date.split('/');
  const eventDate = new Date(Date.UTC(`20${year}`, month - 1, day, time.split(':')[0], time.split(':')[1]));
  const localISOTime = eventDate.toISOString();

  const newFile = new File({
    data: pdfBuffer,
    contentType: 'application/pdf',
    name: `Ticket For ${artistName}`,
  });
  const savedFile = await newFile.save();

  const ticket = {
    artists: artistName,
    price: ticketPrice,
    originalPrice: ticketPrice,
    eventDate: localISOTime,
    status: "On sale",
    description: `Gate: ${gate}, Block: ${block}`,
    fileName: savedFile.name,
    fileIds: [savedFile._id],
    barcode: barcode.trim(),
    seller: userId,
    isSold: false
  };

  return ticket;
}

//converts a PDF to an image in jpeg format and saves is it the output path.
//gets a pdf path and output path.
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
      return null;
  }
}

// detects and reads QR code in image.
// gets image path.
// returns QR code, or null if no QR was found.
async function detectAndReadQRCode(imagePath) {
  const image = await jimp.read(imagePath);
  const qrCode = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
  if (qrCode) {
      return qrCode.data;
  } else {
      return null;
  }
}

// detects and reads barcode in image.
// gets image path.
// returns a promise that resolves with the decoded barcode or rejects with an error.
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


// checks QR and barcode match
function checkQRAndBarcodeMatch(qrCode, barcode) {
  return qrCode === barcode;
}

// checks if the parsed date has passed.
function checkDateIsValid(date) {
  const currentDate = new Date();
  return date >= currentDate;
}

// update the available tickets propery in the event table in the DB.
async function updateEventAvailableTickets(eventId, quantity) { 
  return await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: -quantity, soldTickets: quantity } }, { new: true }); 
}

// update the status property of a ticket to "sold", and setting the buyerID,soldDate and orderId in the DB in the tickets table, and sending notification to the seller.
async function updateTicketStatus(eventId, buyerId, orderId, quantity) {
  try {
    const soldDate = new Date().toISOString();
    const tickets = await Ticket.find({ eventId: eventId, isSold: false }).limit(quantity);
    if(tickets.length < quantity) {
      console.error('Not enough available tickets for this event');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.error('Event not found');
    }
    else {
      const sellerNotificationMessage = `You have sold ${quantity} ticket(s) for ${event.name}'s concert`;
      const sellerNotification = new Notification({ userId: tickets[0].seller, message: sellerNotificationMessage, eventId: eventId, type: NotificationType.purchase });
      await sellerNotification.save();
    }

    const updatedTickets = await Promise.all(tickets.map((ticket) => {
      return Ticket.findByIdAndUpdate(ticket._id, 
        { 
          $set: {
            isSold: true, 
            buyer: buyerId, 
            soldDate: soldDate,
            orderId: orderId
          } 
        }, 
        { new: true }
      );      
    }));

    return updatedTickets;
  } catch(err) {
    console.error(err);
    throw new Error('Failed to update ticket status');
  }
}

// returns all the tickets the user is currently selling.
async function getSellingTickets(userId) {
  const tickets = await Ticket.find({ seller: userId }).populate('eventId').populate('fileIds');
  const formattedTickets = formatTicketDetails(tickets);
  return formattedTickets;
}

// returns all  the tickets the user bought.
async function getBoughtTickets(userId) {
  const tickets = await Ticket.find({ buyer: userId }).populate('eventId').populate('fileIds');
  const formattedTickets = formatTicketDetails(tickets);
  return formattedTickets;
}

// gets an array of tickets and formats them.
// returns an array of the formated tickets according to the model.
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
        id: ticketDetails._id,
        eventDate: ticketDetails.eventDate,
        location: ticketDetails.location,
        price: ticketDetails.price,
        originalPrice: ticketDetails.originalPrice,
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

module.exports = {
  getSellingTickets,
  getBoughtTickets,
  updateEventAvailableTickets,
  updateTicketStatus,
  processTicket
};