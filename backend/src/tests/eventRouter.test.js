const request = require('supertest');
const express = require('express');
const router = require('../routers/event.router');
const app = express();
app.use(express.json());
app.use('/', router);
const { Event } = require('../models/event.model');
const Ticket = require('../models/ticket.model');

jest.mock('../models/event.model');
jest.mock('../models/ticket.model');


describe('Event Routes', () => {
  beforeEach(() => {
    Event.findById.mockClear(); // clear the mock before each test
  });

  describe('GET /id/:eventId', () => {
    it('should return a specific event', async () => {

      const mockEvents = [
        {
          _id: 'event1',
          name: 'Event 1',
          description: 'Description 1',
          date: new Date(),
          location: 'Location 1',
          venue: 'Venue 1',
          image: 'Image 1',
          price: 50,
          availableTickets: 10,
          soldTickets: 5,
          wantedTickets: 3,
          favorites: [],
          numberOfLikes: 20,
          waitingList: []
        },
        {
          _id: 'event2',
          name: 'Event 2',
          description: 'Description 2',
          date: new Date(),
          location: 'Location 2',
          venue: 'Venue 2',
          image: 'Image 2',
          price: 50,
          availableTickets: 20,
          soldTickets: 10,
          wantedTickets: 8,
          favorites: [],
          numberOfLikes: 30,
          waitingList: []
        },
      ];

      const eventId = 'event1';
      const mockEvent = mockEvents.find(e => e._id === eventId);

      Event.findById.mockResolvedValue(mockEvent);

      const response = await request(app)
        .get(`/id/${eventId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id).toEqual(mockEvent._id);

      expect(Event.findById).toHaveBeenCalledWith(eventId);
    });
  });

  describe('GET /cheapestTickets/:eventId/:quantity', () => {
    it('should return the cheapest tickets', async () => {
      const eventId = 'event1';
      const quantity = 3;
      const mockTickets = [
        {
          price: 50,
          eventId: eventId
        },
        {
          price: 60,
          eventId: eventId
        },
        {
          price: 70,
          eventId: eventId
        },
        {
          price: 80,
          eventId: eventId
        },
      ];

      Ticket.findCheapestTickets.mockResolvedValue(mockTickets.slice(0, quantity));

      const response = await request(app)
        .get(`/cheapestTickets/${eventId}/${quantity}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockTickets.slice(0, quantity));
      expect(Ticket.findCheapestTickets).toHaveBeenCalledWith(eventId, quantity.toString());
      Ticket.findCheapestTickets.mockClear();
    });

    it('should return 404 if no tickets available', async () => {
      const eventId = 'event1';
      const quantity = 1;

      Ticket.findCheapestTickets.mockResolvedValue([]);

      const mockEvent = {
        _id: eventId,
        name: 'Event 1'
      };

      Event.findById.mockResolvedValue(mockEvent);

      const response = await request(app)
        .get(`/cheapestTickets/${eventId}/${quantity}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual(`No available tickets for the event: ${mockEvent.name}.`);
      expect(Ticket.findCheapestTickets).toHaveBeenCalledWith(eventId, quantity.toString());
      Ticket.findCheapestTickets.mockClear();
    });

    it('should return 400 if not enough tickets available', async () => {
      const eventId = 'event1';
      const quantity = 3;
      const mockTickets = [
        {
          price: 50,
          eventId: eventId
        },
        {
          price: 60,
          eventId: eventId
        }
      ];

      Ticket.findCheapestTickets.mockResolvedValue(mockTickets);

      const response = await request(app)
        .get(`/cheapestTickets/${eventId}/${quantity}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(`Only ${mockTickets.length} ticket(s) available. Not enough to meet your request of ${quantity} tickets.`);

      expect(Ticket.findCheapestTickets).toHaveBeenCalledWith(eventId, quantity.toString());
    });
    
  });

});

