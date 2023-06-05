const asyncHandler = require('express-async-handler');
const express = require('express');
const auth = require('../src/middlewares/auth.mid');
const OrderModel = require('../src/models/order.model');
const { OrderStatus } = require('../src/constants/order_status');
const router = express.Router();

router.use(auth);
router.post('/create', asyncHandler(async (req, res) => {
    console.log("create");
    const requestOrder = req.body;

    if (requestOrder.items.length <= 0) {
      res.status(400).send('Cart Is Empty!');
      return;
    }

    OrderModel.collection.dropIndex('items.food.price_1', (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    });
    

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    const newOrder = new OrderModel({ ...requestOrder, user: req.user.id });
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
  return await OrderModel.findOne({ user: req.user.id, orderStatus: OrderStatus.NEW });
}

module.exports = router;