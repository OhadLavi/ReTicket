const mongoose = require("mongoose");
const User = require("../models/userScheme.js");

const TicketScheme = new mongoose.Schema({
    ticketID: {
    type: String,
    required: true,
  },
  bandName: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
    default: Date.now
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  seat: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Ticket = mongoose.model("Tickets", TicketScheme);

module.exports = Ticket;