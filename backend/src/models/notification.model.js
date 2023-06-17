const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
  type: { type: String, enum: ['PURCHASE', 'OTHER'], default: 'OTHER' }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
