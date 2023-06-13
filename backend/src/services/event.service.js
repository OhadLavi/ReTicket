const { Event } = require('../models/event.model');

async function getEventByNameDateLocation(name, date, location) {
    const eventDate = new Date(date);
    const events = await Event.find({}, { name: 1, date: 1, location: 1 });
    const event = await Event.findOne({
        name: name,
        date: { $eq: eventDate },
        location: location
    });
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }
  module.exports = {
    getEventByNameDateLocation
  };
  