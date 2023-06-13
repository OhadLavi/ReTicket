const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const { Event } = require('../models/event.model');
const pdfjsLib = require('pdfjs-dist');
const jsQR = require('jsqr');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getEventByNameDateLocation } = require('../services/event.service');
const { getSellingTickets, getBoughtTickets } = require('../services/ticket.service');
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
const { send, eventNames } = require('process');
const { 
  generateRandomTicket, 
  getRandomDate,
  processTicket
} = require('../services/ticket.service');

router.get("/seed", asyncHandler(async (req, res) => {
  const eventsCount = await Event.countDocuments();
  if (eventsCount > 0) {
      res.send("Seed data already exists");
      return;
  }
  await Event.create(sample_events);
  res.send("Seed data created");
}));

router.get("/", asyncHandler(async(req, res) => {
    const tickets = await Ticket.find();
    res.json(tickets);
}));

router.post('/upload', upload.single('file'), async (req, res) => {
    const { path: filePath, originalname } = req.file;
    fs.readFile(filePath, async (err, buffer) => {
        try {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error reading the file' });
            }
            const newFile = new File({
                data: buffer,
                contentType: 'application/pdf',
                name: originalname,
            });
            const savedFile = await newFile.save();
            const savedFileId = savedFile._id;

            const event = await getEventByNameDateLocation("Justin Bieber", "2023-09-12T19:00:00.000+00:00", "Wembley Stadium");
            const eventId = event._id;          
            const ticketResults = await processTicket(savedFile.data, event.date);
            console.log(ticketResults); 
            console.log(ticketResults.tickets[0].artists);
            console.log(ticketResults.tickets[0].eventDate);
            console.log(ticketResults.tickets[0].venue);
            const event2 = await getEventByNameDateLocation(ticketResults.tickets[0].artists, ticketResults.tickets[0].eventDate, ticketResults.tickets[0].venue);
            const eventId2 = event2._id;
            console.log(eventId2);

            fs.unlink(filePath, (err) => {
              if (err) {
                  console.error(err);
                  res.status(500).json({ error: 'Error: PDF processing failed, the file might be corrupted' });
                  return;
              }
          });          
          const tickets = await generateRandomTicket(savedFileId, eventId);
          return res.json({ ticketResults: ticketResults });
          //res.status(201).json({ message: 'File uploaded and saved' });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error: PDF processing failed, the file might be corrupted' });
      }
  });
});

router.post('/submit', async (req, res) => {
  try {
    const tickets = req.body.tickets;
    const sellerId = req.body.sellerId;
    if (!sellerId)
        return res.status(400).json({ error: 'Seller ID is required.' });
    const newTickets = await Promise.all(tickets.map(async ({ eventId, eventDate, location, price, fileIds, description }) => {
        const newTicket = await Ticket.create({
          eventId: eventId,
          eventDate,
          location,
          price,
          isSold: false,
          seller: sellerId,
          soldDate: null,
          fileIds,
          description
        });
        await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: 1 } });
        return newTicket;
    }));
    
    res.status(201).json(newTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/getUserTickets/:userId', asyncHandler(async(req, res) => {
  const userId = req.params.userId;
  const sellingTickets = await getSellingTickets(userId);
  const boughtTickets = await getBoughtTickets(userId);
  res.json({
      sellingTickets: sellingTickets,
      boughtTickets: boughtTickets
  });
}));


router.get('/getTicketFile/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: 'No file found.' });
    }
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename=${file.filename}`);
    res.send(file.data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

// const storage = new GridFsStorage({
//   url: process.env.MONGO_URI, // replace this with your MongoDB connection string
//   file: (req, file) => {
//     return {
//       bucketName: 'uploads/', // this is the bucket name in your MongoDB where the files will be stored
//       filename: `${Date.now()}-${file.originalname}` // this is the file name under which the file will be stored
//     };
//   }
// });
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

module.exports = router;