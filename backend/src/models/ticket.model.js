const mongoose = require('mongoose');
const User = require('./user.model');

const ticketSchema = new mongoose.Schema({
    eventDate: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    isSold: { type: Boolean, required: true },
    soldDate: { type: String, required: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: false },
    description: { type: String, required: false }
  }, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  });

  module.exports = mongoose.model('Ticket', ticketSchema);