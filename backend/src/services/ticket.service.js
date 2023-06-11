const fs = require('fs');
const { Event } = require('../models/event.model');
const pdfjsLib = require('pdfjs-dist');
const jsQR = require('jsqr');
const { PDFParser } = require('pdf2json');
const jimp = require('jimp');
const sample_events = require('../data/events');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');

async function updateEventAvailableTickets(eventId, quantity) { 
  return await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: -quantity, soldTickets: quantity } }, { new: true }); 
}

async function updateTicketStatus(eventId, buyerId) {
  console.log(eventId, buyerId);
  try {
    const soldDate = new Date().toISOString();
    const ticket = await Ticket.findOne({ eventId: eventId, isSold: false });
    if(!ticket) {
      throw new Error('No available tickets found for this event');
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

async function extractQRCodeFromPDF(pdfPath) {
  const pdfParser = new PDFParser();
  pdfParser.on('pdfParser_dataError', (err) => console.error(err.parserError));
  pdfParser.on('pdfParser_dataReady', (pdfData) => {
    const image = pdfData.formImage.Pages[0].Texts.find((text) => {
      return text.R[0].T === 'QRCode';
    });
    if (image) {
      const imageData = Buffer.from(image.R[0].T, 'base64');
      decodeQRCodeFromBuffer(imageData);
    } else {
      console.error('No QR code found in PDF');
    }
  });
  pdfParser.loadPDF(pdfPath);
}

async function processTicket(pdfPath, outputDir, pdfName) {
  console.log('Processing ticket...');
  extractQRCodeFromPDF(pdfPath);
  return "text";
}

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
  updateTicketStatus
};