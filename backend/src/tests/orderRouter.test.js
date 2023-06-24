const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const OrderRouter = require('../routers/order.router');
const OrderModel = require('../models/order.model');
const { OrderStatus } = require('../constants/order_status');

const app = express();
app.use(express.json());
app.use('/', OrderRouter);


jest.mock('../models/order.model');

afterEach(() => {
  jest.clearAllMocks();
});

describe('Order Router', () => {

  describe('GET /newOrder', () => {
    it('should return a new order for a specific user', async () => {
      const orderData = {
        user: new mongoose.Types.ObjectId(),
        orderStatus: OrderStatus.NEW,
      };
    
      OrderModel.findOne.mockResolvedValue(orderData);

      const response = await request(app)
        .get('/newOrder')
        .set('userId', orderData.user.toString());

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ ...orderData, user: orderData.user.toString() });
    });

    it('should return 400 status code when a new order for a specific user is not found', async () => {
      const userId = new mongoose.Types.ObjectId();

      OrderModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/newOrder')
        .set('userId', userId.toString());

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /track/:id', () => {
    it('should return an order when the order is found', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
  
      const orderData = {
        _id: orderId,
        orderStatus: 'NEW',
        user: userId,
      };
  
      OrderModel.findById.mockResolvedValue(orderData);
  
      const response = await request(app).get(`/track/${orderId.toString()}`);
  
      expect(OrderModel.findById.mock.calls[0][0].toString()).toBe(orderId.toString());
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        _id: orderId.toString(),
        orderStatus: 'NEW',
        user: userId.toString(),
      });
    });

    it('should return 404 status code when an order is not found', async () => {
      const orderId = new mongoose.Types.ObjectId();

      OrderModel.findById.mockResolvedValue(null);
  
      const response = await request(app).get(`/track/${orderId.toString()}`);
  
      expect(OrderModel.findById.mock.calls[0][0].toString()).toBe(orderId.toString());
      expect(response.statusCode).toBe(404);
    });
  });

});
