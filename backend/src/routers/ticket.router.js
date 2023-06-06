const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const { Event } = require('../models/event.model');
const pdfjsLib = require('pdfjs-dist');
const jsQR = require('jsqr');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {cb(null, 'uploads/');},
  filename: function (req, file, cb) {cb(null, file.originalname);}
}); 
const upload = multer({ storage: storage });
const nodemailer = require('nodemailer');
const qrCode = require('qrcode-reader');
const { PDFParser } = require('pdf2json');
const jimp = require('jimp');
const sample_events = require('../data/events');
const { send } = require('process');
// const { PDFDocument, PNGStream } = require("pdfjs-dist");
// const { fromPath } = require ('pdf2pic');
// const pdfImgConvert = require('pdf-img-convert');
// const pdf = require('pdf-parse');
// const parse = require('pdf-parse');
// const ocr = require('../src/ocr/ocr');
// const bwipjs = require('bwip-js');
// const { v4: uuidv4 } = require('uuid');
// const jsQR = require('jsqr');
// const { PDFDocument } = require('pdf-lib');
// const jsBarcode = require('jsbarcode');

router.get("/seed", asyncHandler(async (req, res) => {
  const eventsCount = await Event.countDocuments();
  if (eventsCount > 0) {
      //res.status(400).json({ message: "Seed data already exists" });
      res.send("Seed data already exists");
      return;
  }
  await Event.create(sample_events);
  //res.status(201).json({ message: "Seed data created" });
  res.send("Seed data created");
}));

router.get("/", asyncHandler(async(req, res) => {
    const tickets = await Ticket.find();
    res.json(tickets);
}));

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

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const tickets = generateRandomTicket();

    const jsonResponse = {
      tickets: tickets
    };

    res.json(jsonResponse);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const tickets = req.body.tickets;
    const sellerId = req.body.sellerId;

    if (!sellerId) {
        return res.status(400).json({ error: 'Seller ID is required.' });
    }

    const newTickets = await Promise.all(tickets.map(async ({ eventDate, location, price, fileName, description }) => {
        const newTicket = await Ticket.create({
          eventDate,
          location,
          price,
          isSold: false,
          seller: sellerId,
          soldDate: null,
          fileName,
          description
        });
        return newTicket;
    }));
    res.status(201).json(newTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

module.exports = router;