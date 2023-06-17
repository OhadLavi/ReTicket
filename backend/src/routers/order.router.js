const asyncHandler = require('express-async-handler');
const express = require('express');
const auth = require('../middlewares/auth.mid');
const OrderModel = require('../models/order.model');
const { OrderStatus } = require('../constants/order_status');
const router = express.Router();
const { sendTicketsEmail } = require('../services/email.service');
const { updateEventAvailableTickets, updateTicketStatus } = require('../services/ticket.service');
const Ticket = require('../models/ticket.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { File } = require('../models/file.model');

router.use(auth);

router.post('/create', asyncHandler(async (req, res) => {
  const requestOrder = req.body;
  if (requestOrder.items.length <= 0)
    return res.status(400).send('Cart Is Empty!');
  const newOrder = new OrderModel({ ...requestOrder, user: req.userId });
  await newOrder.save();
  res.send(newOrder);
}));


router.get('/newOrder', asyncHandler(async (req, res) => {
  const order = await getNewOrder(req);
  if (order)
    res.send(order);
  else
    res.status(400).send();
}));

router.post('/pay', asyncHandler(async (req, res) => {
  const { paymentId } = req.body;
  const order = await getNewOrder(req);
  if (!order)
    return res.status(400).send('Order Not Found!');
  try {
    await Promise.all(order.items.map(async item => {
      console.log(item.event);
      await updateEventAvailableTickets(item.eventM, item.quantity);
      await updateTicketStatus(item.event, order.userId);
      const ticket = await Ticket.findOne({ eventId: item.event }).exec();
      await User.findByIdAndUpdate(ticket.seller, { $inc: { balance: item.price * item.quantity } }).exec();
    }));
    order.paymentId = paymentId;
    order.orderStatus = OrderStatus.PAYED;
    await order.save();
    //await sendTicketsEmail(order, order.email);
    const tickets = await Promise.all(order.items.map(async item => {
      return await Ticket.findOne({ eventId: item.event, buyer: order.userId });
    }));
    const ticket = tickets[0];
    const pdfFile = await File.findById(ticket.fileIds[0]);
    res.send({orderId: order._id, fileData: Buffer.from(pdfFile.data).toString('base64'), fileName: 'YourTicket.pdf'});
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to update tickets and event details.');
  }
}));

router.get('/track/:id', asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  res.send(order);
}));

async function getNewOrder(req) {
  return await OrderModel.findOne({ user: req.userId, orderStatus: OrderStatus.NEW });
}

module.exports = router;
