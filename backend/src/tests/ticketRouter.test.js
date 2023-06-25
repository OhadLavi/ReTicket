const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const router = require('../routers/ticket.router');
const Ticket = require('../models/ticket.model');
const {Event} = require('../models/event.model');
const User = require('../models/user.model');
const {File} = require('../models/file.model');
const Notification = require('../models/notification.model');
const app = express();
app.use(express.json());
app.use('/', router);

jest.mock('../models/event.model');
jest.mock('../models/ticket.model');
jest.mock('../models/user.model');
jest.mock('../models/notification.model');
jest.mock('../models/file.model');

describe('Ticket Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /submit', () => {
    it('should return 400 if no sellerId is provided', async () => {
      const response = await request(app)
        .post('/submit')
        .send({ tickets: [] });

      expect(response.statusCode).toBe(400);
    });

    it('should return 403 if no event found with the given id', async () => {
      const response = await request(app)
        .post('/submit')
        .send({ sellerId: 'sellerId1', tickets: [{ id: 'ticketId1', price: 100, eventId: 'eventId1' }] });

      Ticket.findByIdAndUpdate.mockResolvedValue(false);

      expect(response.statusCode).toBe(403);
    });

  });

  describe('GET /getTicketFile/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return a 404 status if no file was found', async () => {
      const fileId = new mongoose.Types.ObjectId();
      File.findById.mockResolvedValue(null);
  
      const response = await request(app).get(`/getTicketFile/${fileId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'No file found.' });
    });
  
    it('should return the file if one was found', async () => {
      const fileId = new mongoose.Types.ObjectId();
      const fileData = {
        data: Buffer.from('This is a test file.'),
        contentType: 'application/pdf',
        filename: 'testFile.pdf',
      };
      File.findById.mockResolvedValue(fileData);
  
      const response = await request(app).get(`/getTicketFile/${fileId}`);
  
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toEqual('application/pdf');
      expect(response.header['content-disposition']).toEqual(`attachment; filename=${fileData.filename}`);
      expect(response.body).toBeDefined();
    });
  });
});
