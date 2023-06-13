const { Event } = require('../models/event.model');

async function getEventByNameDateLocation(name, date, venue) {
    const eventDate = new Date(date);
    const events = await Event.find({}, { name: 1, date: 1, venue: 1 });
    console.log(name + " " + date + " " + venue);
    const event = await Event.findOne({
        name: name,
        date: { $eq: date },
        venue: venue
    });
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  async function saveEvent(eventDetails) {
    const eventDate = new Date(eventDetails.timeDate);
    // Check if the event already exists in the database
    const existingEvent = await Event.findOne({
      name: eventDetails.name,
      date: { $eq: eventDate },
      location: eventDetails.location,
    });
  
    // If the event does not exist, create a new one
    if (!existingEvent) {
      const event = new Event({
        name: eventDetails.name,
        description: '',
        date: eventDate,
        location: eventDetails.location,
        venue: eventDetails.venue,
        image: eventDetails.img
      });
  
      try {
        await event.save();
        console.log(`Event saved: ${event.name}`);
      } catch (error) {
        console.error(`An error occurred while saving the event: ${error}`);
      }
    }
  }
  
  module.exports = {
    getEventByNameDateLocation,
    saveEvent
  };
  