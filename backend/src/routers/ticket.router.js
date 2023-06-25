const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
const UserModel = require('../models/user.model');
const Notification = require('../models/notification.model');
const { Event } = require('../models/event.model');
const { NotificationType } = require('../constants/notification_type');
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
const { send, eventNames } = require('process');
const { processTicket} = require('../services/ticket.service');
const authMiddleware = require('../middlewares/auth.mid');

// this route fetches all tickets in the database.
router.get("/", asyncHandler(async(req, res) => {
    const tickets = await Ticket.find();
    res.json(tickets);
}));

// this route  uploads a file(the pdf ticket), reads the contents of the ticket, and adds the ticket to the database.
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { path: filePath, originalname } = req.file;
  let ticketDocs = [];
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
      const ticketResult = await processTicket(pdfBuffer, req.user.id);
      
      if (!ticketResult) {
        await Ticket.deleteMany({ _id: { $in: ticketDocs.map(t => t._id) } });
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: 'Error2: PDF processing failed, the file might be corrupted' });
      }

      if (ticketResult.error) {
        await Ticket.deleteMany({ _id: { $in: ticketDocs.map(t => t._id) } });
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: ticketResult.error });
      }

      const event = await getEventByNameDateLocation(ticketResult.tickets[0].artists, ticketResult.tickets[0].eventDate, ticketResult.tickets[0].venue);
      if (!event || event.error) {
        await Ticket.deleteMany({ _id: { $in: ticketDocs.map(t => t._id) } });
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: event.error ? event.error : "Error: No matching event found" });
      }
      const eventId = event._id;

      ticketDocs = ticketResult.tickets.map(ticket => {
        ticket.eventId = eventId.toString();
        return ticket;
      });
  
      for (const ticketData of ticketDocs) {
        const existingTicket = await Ticket.findOne({ barcode: ticketData.barcode, isSold: false });
        if (existingTicket) {
          await Ticket.deleteMany({ _id: { $in: ticketDocs.map(t => t._id) } });
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: `Error: A ticket with barcode ${ticketData.barcode} is already on sale.` });
        } else {
          const newTicket = new Ticket(ticketData);
          await newTicket.save();
          ticketData.id = newTicket._id;
        }
      }

      ticketResults.tickets.push(...ticketResult.tickets);
    }
    fs.unlinkSync(filePath);
    return res.status(200).json({ ticketResults: ticketResults });
  } catch (error) {
    console.log(error);
    await Ticket.deleteMany({ _id: { $in: ticketDocs.map(t => t._id) } });
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });
    return res.status(500).json({ error: 'Error: PDF processing failed, the file might be corrupted' });
  }
});

// this route submits tickets for sale.
// it updates the ticket prices and notifies the users in the event waiting list that ticket has become available.
router.post('/submit', async (req, res) => {
  try {
    const tickets = req.body.tickets;
    const sellerId = req.body.sellerId;
    let errorStatus = 0;
    let errorMessage = '';
    let lastEventId = null;

    if (!sellerId) {
      errorStatus = 400;
      errorMessage = 'Seller ID is required.';
    }

    // Process tickets
    const updatedTickets = await Promise.all(tickets.map(async ({ id, price, eventId }) => {
      if (errorStatus === 0) {
        const updatedTicket = await Ticket.findByIdAndUpdate(id, { price: price }, { new: true });
    
        if (!updatedTicket) {
          errorStatus = 402;
          errorMessage = `Error: No ticket found with id ${id}`;
        }

        const event = await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: 1 } }, { new: true });

        if (!event) {
          errorStatus = 403;
          errorMessage = `Error: No event found with id ${eventId}`;
        }

        lastEventId = eventId;
        return updatedTicket;
      }
    }));

    if (errorStatus !== 0) {
      return res.status(errorStatus).json({ error: errorMessage });
    }

    const event = await Event.findById(lastEventId);
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

    res.status(200).json(updatedTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// this route deletes a ticket from the database by his id.
router.delete('/delete/:id', authMiddleware, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).send({error: 'No ticket found'});
    return;
  }
  
  if (ticket.seller.toString() !== req.user.id.toString() || ticket.isSold) {
    res.status(403).send({error: 'You are not allowed to delete this ticket'});
    return;
  }
  await Ticket.findByIdAndRemove(req.params.id);
  res.status(200).send({message: 'Ticket deleted'});
}));

// this route fetches the tickets that the currently authenticated user is selling and tickets they have bought.
router.get('/getUserTickets', authMiddleware, asyncHandler(async(req, res) => {
  const userId = req.user.id;
  const sellingTickets = await getSellingTickets(userId);
  const boughtTickets = await getBoughtTickets(userId);
  res.json({
      sellingTickets: sellingTickets,
      boughtTickets: boughtTickets
  });
}));

// this route updates the price of a ticket with the given ticket id.
router.put('/updatePrice/:id', authMiddleware, asyncHandler(async(req, res) => {
  const ticketId = req.params.id;
  const newPrice = req.body.price;
  const ticket = await Ticket.findById(ticketId);
  if (ticket) {
    ticket.price = newPrice;
    await ticket.save();
    res.json({ message: 'Ticket price updated successfully.' });
  } else {
    res.status(404).json({ message: 'Ticket not found.' });
  }
}));

// this route returns the file assosiated with the particular ticket with the given id.
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

module.exports = router;