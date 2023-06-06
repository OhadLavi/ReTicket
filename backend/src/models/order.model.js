const { model, Schema, Types } = require('mongoose');
const { OrderStatus } = require('../constants/order_status');
const mongoose = require('mongoose');
const { Event } = require('./event.model');

const OrderItemSchema = new mongoose.Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  paymentId: { type: String },
  totalPrice: { type: Number, required: true },
  items: { type: [OrderItemSchema], required: true },
  orderStatus: { type: String, default: OrderStatus.NEW },
  userId: { type: Schema.Types.ObjectId, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

  const OrderModel = mongoose.model('Order', orderSchema);

  module.exports = OrderModel;  
