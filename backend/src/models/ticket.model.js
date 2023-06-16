const mongoose = require('mongoose');
const User = require('./user.model');

const ticketSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventDate: { type: String, required: true },
    location: { type: String, required: false },
    venue: { type: String, required: false },
    price: { type: Number, required: true },
    isSold: { type: Boolean, required: true },
    soldDate: { type: String, required: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    fileIds: [{ type: String, required: true }],
    description: { type: String, required: false }
  }, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  });
  
  ticketSchema.statics.findCheapestTickets = function (eventId, quantity) {
    return this.find({ eventId: eventId, isSold: false })
        .sort({ price: 1 })
        .limit(Number(quantity));
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;