const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');
const ics = require('ics');
const { Event } = require('../models/event.model');
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

const nodemailerTransporter = nodemailer.createTransport({
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
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  transporter.verify().then(console.log).catch(console.error);

  const itemsWithDetails = await Promise.all(
    order.items.map(async (item, index) => {
      const eventDetails = await findEventDetailsByEventId(item.event);
  
      const event = {
        start: [new Date(eventDetails.date).getFullYear(), new Date(eventDetails.date).getMonth()+1, new Date(eventDetails.date).getDate()],
        duration: { hours: 2 },
        title: eventDetails.name,
        description: `Location: ${eventDetails.location}\nPrice: ${order.items[index].price}`,
        location: eventDetails.location,
      };
  
      const { error, value } = ics.createEvent(event);
      
      if (error) {
        console.log("error creating ics: " + error);
        return;
      }
      
      return { ...item, eventDetails, icsEvent: value };
    })
  );

  const attachments = itemsWithDetails.map((item, index) => ({
    filename: `${item.eventDetails.name}.ics`,
    content: item.icsEvent,
    contentType: 'text/calendar',
  }));

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
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
            <p>See attached file to add this event to your calendar.</p>
          </div>
        `;
      }).join('')}
    `,
    attachments
  };
  
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

module.exports = {
  sendEmail
};
