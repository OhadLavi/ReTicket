const { getEventByNameDateLocation, getEventByNameDate } = require('../services/event.service');
const {Event} = require('../models/event.model');

jest.mock('../models/event.model');

describe('Event Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventByNameDateLocation function', () => {
    it('should return an event when the event is found', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date('2023-07-21'),
        venue: 'Test Venue',
      };

      Event.findOne.mockResolvedValue(eventData);

      const event = await getEventByNameDateLocation(eventData.name, eventData.date, eventData.venue);

      expect(Event.findOne).toHaveBeenCalledWith({
        name: eventData.name,
        date: { $eq: eventData.date },
        venue: eventData.venue
      });
      expect(event).toEqual(eventData);
    });

    it('should return an error when the event is not found', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date('2023-07-21'),
        venue: 'Test Venue',
      };

      Event.findOne.mockResolvedValue(null);

      const event = await getEventByNameDateLocation(eventData.name, eventData.date, eventData.venue);

      expect(Event.findOne).toHaveBeenCalledWith({
        name: eventData.name,
        date: { $eq: eventData.date },
        venue: eventData.venue
      });
      expect(event).toEqual({ error: 'Error: Event not found1' });
    });
  });

  describe('getEventByNameDate function', () => {
    it('should return an event when the event is found', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date('2023-07-21')
      };

      Event.findOne.mockResolvedValue(eventData);

      const event = await getEventByNameDate(eventData.name, eventData.date);

      expect(Event.findOne).toHaveBeenCalledWith({
        name: eventData.name,
        date: { $eq: eventData.date }
      });
      expect(event).toEqual(eventData);
    });

    it('should return an error when the event is not found', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date('2023-07-21')
      };

      Event.findOne.mockResolvedValue(null);

      const event = await getEventByNameDate(eventData.name, eventData.date);

      expect(Event.findOne).toHaveBeenCalledWith({
        name: eventData.name,
        date: { $eq: eventData.date }
      });
      expect(event).toEqual({ error: 'Error: Event not found2' });
    });
  });
});
