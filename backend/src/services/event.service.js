const { Event } = require('../models/event.model');

// queries the DB for an event using the name, date, and venue of the event.
// returns the event or an error if the event wasn't found.
async function getEventByNameDateLocation(name, date, venue) {
  const event = await Event.findOne({
    name: name,
    date: { $eq: date },
    venue: venue
  });
  if (!event) {
    return { error: 'Error: Event not found1' };
  }
  return event;
}

// queries the DB for an event using the name and date of the event.
// returns the event or an error if the event wasn't found.
async function getEventByNameDate(name, date) {
  const event = await Event.findOne({
    name: name,
    date: { $eq: date }
  });
  if (!event) {
    return { error: 'Error: Event not found2' };
  }
  return event;
}

// save an event to the database.
async function saveEvent(eventDetails) {
  const eventDate = new Date(eventDetails.timeDate);
  
  // Check if the event already exists in the database
  const existingEvent = await Event.findOne({
    name: eventDetails.name,
    date: { $eq: eventDate },
    $or: [
      { 
        location: eventDetails.location, 
        venue: eventDetails.venue 
      },
      { 
        location: eventDetails.venue, 
        venue: eventDetails.location 
      }
    ]
  });

  // If the event does not exist, create a new one
  if (!existingEvent) {
    const event = new Event({
      name: eventDetails.name,
      description: eventDetails.description,
      date: eventDate,
      location: eventDetails.location,
      venue: eventDetails.venue,
      image: eventDetails.img
    });

    try {
      await event.save();
    } catch (error) {
      console.error(`An error occurred while saving the event: ${error}`);
    }
  }
}

  module.exports = {
    getEventByNameDateLocation,
    getEventByNameDate,
    saveEvent
  };
  