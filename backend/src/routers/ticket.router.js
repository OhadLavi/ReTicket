const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const UserModel = require('../models/user.model');
const Notification = require('../models/notification.model');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const { Event } = require('../models/event.model');
const { NotificationType } = require('../constants/notification_type');
const pdfjsLib = require('pdfjs-dist');
const mongoose = require('mongoose');
const jsQR = require('jsqr');
const router = express.Router();
const { PDFDocument } = require('pdf-lib');
const asyncHandler = require('express-async-handler');
const { sendNotifcationEmail } = require('../services/email.service');
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
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const ticketResults = { tickets: [] };
    for (let i = 0; i < pages.length; i++) {
      const pdfDocSingle = await PDFDocument.create();
      const [copiedPage] = await pdfDocSingle.copyPages(pdfDoc, [i]);
      pdfDocSingle.addPage(copiedPage);
      const pdfBytes = await pdfDocSingle.save();
      const pdfBuffer = Buffer.from(pdfBytes);
      const ticketResult = await processTicket(pdfBuffer);
      if (ticketResult.error)
        return res.status(500).json({ error: ticketResult.error });      
      if (!ticketResult)
        return res.status(500).json({ error: 'Error: PDF processing failed, the file might be corrupted' });
      const event = await getEventByNameDateLocation(ticketResult.tickets[0].artists, ticketResult.tickets[0].eventDate, ticketResult.tickets[0].venue);
      if (!event || event.error)
        return res.status(500).json({ error: event.error });
      const eventId = event._id;
      ticketResult.tickets.forEach(ticket => {
        ticket.eventId = eventId.toString();
      });
      ticketResults.tickets.push(...ticketResult.tickets);
    }
    fs.unlinkSync(filePath);
    return res.status(200).json({ ticketResults: ticketResults });
  } catch (error) {
    console.error(error);
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });
    return res.status(500).json({ error: 'Error: PDF processing failed, the file might be corrupted' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const tickets = req.body.tickets;
    const sellerId = req.body.sellerId;
    let event = "";
    if (!sellerId)
        return res.status(400).json({ error: 'Seller ID is required.' });
    const newTickets = await Promise.all(tickets.map(async ({ eventId, eventDate, location, price, fileIds, description }) => {
        const newTicket = await Ticket.create({
          eventId: new mongoose.Types.ObjectId(eventId),
          eventDate,
          location,
          price,
          isSold: false,
          seller: sellerId,
          soldDate: null,
          fileIds,
          description
        });
        event = await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: 1 } });
        return newTicket;
    }));

    //const event = await Event.findById(eventId);
    if (event.availableTickets > 0 && event.waitingList.length > 0) {
      const userToNotify = event.waitingList.find(
        user => !user.notifiedAt || new Date().getTime() - user.notifiedAt.getTime() > 60*60*1000
      );
      if (userToNotify) {
        const index = event.waitingList.indexOf(userToNotify);
        event.waitingList.splice(index, 1);
        userToNotify.notifiedAt = new Date();
        await event.save();

        const user = await UserModel.findById(userToNotify.userId);
        const userWaitingForTicketsNotificationMessage = `A ticket for ${event.name} is now available!`;
        const subject = "New Notification";
        await sendNotifcationEmail(user.email, subject, userWaitingForTicketsNotificationMessage);

        const sellerNotification = new Notification({ userId: user._id, message: userWaitingForTicketsNotificationMessage, eventId: event._id, type: NotificationType.other });
        await sellerNotification.save();

        const timeout = setTimeout(async () => {
          const event = await Event.findById(event._id);
          if (event.availableTickets > 0 && event.waitingList.length > 0) {
            const nextUserToNotify = event.waitingList.find(
              user => !user.notifiedAt || new Date().getTime() - user.notifiedAt.getTime() > 60*60*1000
            );
            if (nextUserToNotify) {
              nextUserToNotify.notifiedAt = new Date();
              await event.save();

              const nextUser = await UserModel.findById(nextUserToNotify.userId);
              await sendNotifcationEmail(nextUser.email, subject, message);
            }
          } else {
            clearTimeout(timeout);
          }
        }, 60*60*1000);
      }
    }
    
    res.status(201).json(newTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:id', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).send('No ticket found');
    return;
  }
  if (String(ticket.seller) !== String(req.user._id) || ticket.isSold) {
    res.status(403).send('You are not allowed to delete this ticket');
    return;
  }
  await Ticket.findByIdAndRemove(req.params.id);
  res.status(200).send('Ticket deleted');
}));

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