const asyncHandler = require('express-async-handler');
const express = require('express');
const auth = require('../middlewares/auth.mid');
const OrderModel = require('../models/order.model');
const { OrderStatus } = require('../constants/order_status');
const router = express.Router();

router.use(auth);
router.post('/create', asyncHandler(async (req, res) => {
    console.log("create");
    const requestOrder = req.body;

    if (requestOrder.items.length <= 0) {
      res.status(400).send('Cart Is Empty!');
      return;
    }

    console.log(requestOrder);

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
    res.status(400).send('Order Not Found!');
    return;
  }
  order.paymentId = paymentId;
  order.status = OrderStatus.PAYED;
  await order.save();
  res.send(order._id);
}));

router.get('/track/:id', asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  res.send(order);
}));

async function getNewOrder(req) {
  return await OrderModel.findOne({ user: req.userId, orderStatus: OrderStatus.NEW });
}

module.exports = router;