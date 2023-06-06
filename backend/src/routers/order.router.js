const asyncHandler = require('express-async-handler');
const express = require('express');
const auth = require('../middlewares/auth.mid');
const OrderModel = require('../models/order.model');
const { OrderStatus } = require('../constants/order_status');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Event } = require('../models/event.model');

router.use(auth);
router.post('/create', asyncHandler(async (req, res) => {
    console.log("create");
    const requestOrder = req.body;
    if (requestOrder.items.length <= 0)
      return res.status(400).send('Cart Is Empty!');
    const newOrder = new OrderModel({ ...requestOrder, user: req.userId });
    await newOrder.save();
    res.send(newOrder);
  }),
);

router.get('/newOrder', asyncHandler(async (req, res) => {
  const order = await getNewOrder(req);
  if (order) 
    res.send(order);
  else 
    res.status(400).send();
}));

router.post('/pay', asyncHandler(async (req, res) => {
  console.log("pay - test");
  const { paymentId } = req.body;
  const order = await getNewOrder(req);
  if (!order) {
    return res.status(400).send('Order Not Found!');
  }
  order.paymentId = paymentId;
  order.orderStatus = OrderStatus.PAYED;
  await order.save();
  console.log(order);
  await sendEmail(order, order.email);
  res.send(order._id);
}));

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  ignoreTLS: true
});

async function sendEmail(order, email) {
  console.log("sendEmail");
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'reticket.manager@gmail.com',
      pass: 'nzozrxngjgqbybaw'
    }
  });

  transporter.verify().then(console.log).catch(console.error);
  //console.log(order.items);
  // Retrieve event details for each item in the order
  const itemsWithDetails = await Promise.all(
    order.items.map(async item => {
      const eventDetails = await findEventDetailsByEventId(item.event);
      return { ...item, eventDetails };
    })
  );

  // Prepare the email message
  const mailOptions = {
    from: 'reticket.manager@gmail.com',
    to: email,
    subject: `Your Tickets for ${order.items.length} events`,
    html: `
      <h1>Your Tickets Details</h1>
      ${itemsWithDetails.map((item, index) => {  
        return `
          <div style="margin: 1em; padding: 1em; border: 1px solid #ddd; dir: ltr;">
            <h2>${item.eventDetails.name}</h2>
            <p><strong>Event Date:</strong> ${new Date(item.eventDetails.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${item.eventDetails.location}</p>
            <p><strong>Price:</strong> ${order.items[index].price}</p>
          </div>
        `;
      }).join('')}
    `,
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

async function findEventDetailsByEventId(eventId) {
  try {
    const event = await Event.findById(eventId);
    if (event) {
      return event;
    } else {
      console.log(`Event with id: ${eventId} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error finding event:', error);
  }
}

// send tickets to user in mail
// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// oauth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN
// });
// const accessToken = oauth2Client.getAccessToken();

// router.post('/sendTickets', asyncHandler(async (req, res) => {
//   const { orderId } = req.body;

router.get('/track/:id', asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  res.send(order);
}));

async function getNewOrder(req) {
  return await OrderModel.findOne({ user: req.userId, orderStatus: OrderStatus.NEW });
}

module.exports = router;