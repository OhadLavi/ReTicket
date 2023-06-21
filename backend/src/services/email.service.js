const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');
const ics = require('ics');
const { Event } = require('../models/event.model');
const Ticket = require('../models/ticket.model');
const { File } = require('../models/file.model');
require('dotenv').config();

const credentials = {
    "web": {
        "client_id": process.env.CLIENT_ID,
        "project_id": process.env.PROJECT_ID,
        "auth_uri": process.env.AUTH_URI,
        "token_uri": process.env.TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
        "client_secret": process.env.CLIENT_SECRET,
        "redirect_uris": [process.env.REDIRECT_URIS]
    }
};
const token = {
    "access_token": process.env.ACCESS_TOKEN,
    "refresh_token": process.env.REFRESH_TOKEN,
    "scope": process.env.SCOPE,
    "token_type": process.env.TOKEN_TYPE,
    "expiry_date": process.env.EXPIRY_DATE
};  
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(token);
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

async function sendEmail(mailOptions) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  transporter.verify().then(console.log).catch(console.error);
  transporter.sendMail(mailOptions);
}

async function sendTicketsEmail(order, email) {
  const itemsGroupedByEvent = order.items.reduce((groupedItems, item) => {
      (groupedItems[item.event] = groupedItems[item.event] || []).push(item);
      return groupedItems;
  }, {});
  const itemsWithDetails = await Promise.all(Object.entries(itemsGroupedByEvent).map(async ([eventId, items]) => {
      const eventDetails = await findEventDetailsByEventId(eventId);
      const tickets = await Ticket.find({ eventId, buyer: order.userId, orderId: order._id });

      const event = {
          start: [new Date(eventDetails.date).getFullYear(), new Date(eventDetails.date).getMonth() + 1, new Date(eventDetails.date).getDate()],
          duration: { hours: 2 },
          title: eventDetails.name,
          description: `Location: ${eventDetails.location}\nPrice: ${items[0].price}`,
          location: eventDetails.location,
      };
      const { error, value } = ics.createEvent(event);
      if (error) {
          return;
      }
      
      const ticketsDetails = await Promise.all(tickets.map(async (ticket) => {
          const file = await File.findById(ticket.fileIds[0].toString());
          const fileData = Buffer.from(file.data).toString('base64');
          return { data: fileData, contentType: file.contentType, name: file.name };
      }));
      
      // Return the details of this group of tickets
      return { ...items[0], eventDetails, icsEvent: value, ticketFiles: ticketsDetails };
  }));

  const itemsWithDetailsFlattened = itemsWithDetails.flat();

  const attachments = itemsWithDetailsFlattened.map((item, index) => ([
    {
      filename: `${item.eventDetails.name}.ics`,
      content: item.icsEvent,
      contentType: 'text/calendar',
    },
    ...item.ticketFiles.map(ticketFile => ({
      filename: ticketFile.name,
      content: ticketFile.data,
      contentType: ticketFile.contentType,
      encoding: 'base64'
    }))
  ])).flat();

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: `Your Tickets for ${order.items.length} events`,
    html: `
      <h1>Your Tickets Details</h1>
      ${itemsWithDetailsFlattened.map((item, index) => {
        return `
          <div style="margin: 1em; padding: 1em; border: 1px solid #ddd; dir: ltr;">
            <h2>${item.eventDetails.name}</h2>
            <p><strong>Event Date:</strong> ${new Date(item.eventDetails.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${item.eventDetails.location}</p>
            <p><strong>Price:</strong> </p>
            <p>See attached files to add this event to your calendar and view your ticket.</p>
          </div>
        `;
      }).join('')}
    `,
    attachments: attachments
  };
  sendEmail(mailOptions);
}

async function findEventDetailsByEventId(eventId) {
  try {
    const event = await Event.findById(eventId);
    if (event) {
      return event;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error finding event:', error);
  }
}

async function sendNotifcationEmail(email, subject, message) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: message,
  };

  sendEmail(mailOptions);
}

module.exports = {
  sendTicketsEmail,
  sendNotifcationEmail,
};
