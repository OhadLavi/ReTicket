const express = require('express');
const router = express.Router();
const { Event } = require('../models/event.model');
const Ticket = require('../models/ticket.model');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const upload = multer();
const natural = require('natural'); 
const authMiddleware = require('../middlewares/auth.mid');

// this route fetches all non-expired events.
router.get("/", asyncHandler(async (req, res) => {
  const events = await Event.getNonExpiredEvents();
  res.json(events);
}));

// this route searches for events using the search term provided by the user.
// the term is normalized before being split into individual words.
// then each word in the search term is compared with the name, venue and location of each event.
// the similarity of the search term and the values of these fields is calculated and weighted.
// an event is included in the search results if its similarity score is greater than or equal to a specific threshold.
router.get("/search/:searchTerm?", asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;
  let allEvents = await Event.getNonExpiredEvents();
  if (!searchTerm) return res.json(allEvents);
  const searchTermWords = searchTerm.normalize('NFC').toLowerCase().replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/gi, ' ').split(' ');
  const similarityThreshold = 0.8;
  const weights = { name: 0.6, location: 0.2, venue: 0.2 };
  let maxScoreEvent = { event: null, score: 0 };
  const similarEvents = allEvents.filter(event => {
    const { name, location, venue } = event;
    const valuesToSearch = { name, location, venue };
    let maxSimilarity = 0;
    Object.entries(valuesToSearch).forEach(([key, value]) => {
      const words = value.normalize('NFC').toLowerCase().replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/gi, ' ').split(' ');
      words.forEach(word => {
        searchTermWords.forEach(term => {
          let similarity;
          if (term === word) {
            similarity = 1; // exact match
          } else if (word.startsWith(term)) {
            similarity = 0.9; // high score for prefix match
          } else {
            const distance = natural.LevenshteinDistance(term, word);
            similarity = 1 - distance / Math.max(term.length, word.length);
            if (similarity > 0.75 && (key === 'location' || key === 'venue')) {
              similarity = Math.max(maxSimilarity, similarity);
            } else {
              similarity = weights[key] * similarity;
            }
          }
          maxSimilarity = Math.max(maxSimilarity, similarity);
        });
      });
    });
    if (maxSimilarity > maxScoreEvent.score) {
      maxScoreEvent = { event, score: maxSimilarity };
    }
    return maxSimilarity >= similarityThreshold;
  });

  if (similarEvents.length === 0) {
    if (maxScoreEvent.score >= similarityThreshold) {
      similarEvents.push(maxScoreEvent.event);
    } else {
      return res.status(500).json({ message: "No results" });
    }
  }
  res.json(similarEvents);
}));

// this route fetches a specific event by its id.
router.get("/id/:eventId", asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  res.json(event);
}));

// this route checks if the authenticated user is in the waiting list for a specific event.
router.get("/checkInWaitingList/:eventId", authMiddleware, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  const userId = req.user.id;  
  const isInWaitingList = event.waitingList.some(user => user.userId.equals(userId));
  res.json(isInWaitingList);
}));

// this route adds the authenticated user to the waiting list of a specific event.
router.post("/id/:eventId/waitingList", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  const isAlreadyInList = event.waitingList.some(waitingUser => waitingUser.userId.equals(userId));
  if (!isAlreadyInList) {
    event.waitingList.push({userId});
    await event.save();
    return res.json(event);
  } else {
    return res.status(400).json({message: 'You are already in the waiting list'});
  }
}));

// this route removes the authenticated user from the waiting list of a specific event.
router.delete("/id/:eventId/waitingList", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  try {
    event.waitingList = event.waitingList.filter(waitingUser => waitingUser.userId.toString() !== userId);
    await event.save();
  }
  catch (err) {
    return res.status(400).json({message: 'You are not in the waiting list'});
  }
  return res.json(event);
}));

// this route finds the cheapest tickets for a specific event, up to a given quantity.
// returns 404 status if there are no available tickets.
// returns 400 status if there are not enough available tickets.
router.get("/cheapestTickets/:eventId/:quantity", asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;
  const quantity = req.params.quantity;
  const tickets = await Ticket.findCheapestTickets(eventId, quantity);
  if (tickets.length === 0) {
    const event = await Event.findById(eventId);
    return res.status(404).json({
      message: `No available tickets for the event: ${event.name}.`
    });
  } else if (tickets.length < quantity) {
    return res.status(400).json({
      tickets: tickets,
      message: `Only ${tickets.length} ticket(s) available. Not enough to meet your request of ${quantity} tickets.`
    });
  }
  res.json(tickets);
}));

// this route transcribes audio data sent by the user into text.
// first it tries english, and if the confidence level is below a certain threshold it retries for hebrew.
router.post('/transcribeAudio', upload.single('audio'), async (req, res) => {
  try {
    const client = new speech.SpeechClient({
      projectId: process.env.PROJECT_ID,
      keyFilename: './keyfile.json'
    });

    const audio = {
      content: req.file.buffer.toString('base64'),
    };

    const configEn = {
      encoding: 'MP3',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };

    const configHe = {
      encoding: 'MP3',
      sampleRateHertz: 48000,
      languageCode: 'he-IL',
    };

    const requestEn = {
      audio: audio,
      config: configEn,
    };

    const [responseEn] = await client.recognize(requestEn);

    const transcriptionEn = responseEn.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    const confidenceEn = responseEn.results
        .map(result => result.alternatives[0].confidence)
        .reduce((a, b) => a + b, 0) / responseEn.results.length;
    let transcription = transcriptionEn;

    if (confidenceEn < 0.6) {
      const requestHe = {
        audio: audio,
        config: configHe,
      };

      const [responseHe] = await client.recognize(requestHe);

      const transcriptionHe = responseHe.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      transcription = transcriptionHe;
    }
    
    res.status(200).send({ transcription });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'An error occurred while transcribing the audio.' });
  }
});

// this route fetches events that the authenticated user marked as favorites.
router.get('/getFavoritesEvents', authMiddleware, asyncHandler(async (req, res) => {
  const events = await Event.find({ favorites: req.user.id });
  if (!events) {
    return res.status(404).json({ message: 'Events not found' });
  }
  res.status(200).json(events);
}));

// this route checks if a specific event has been marked as a favorite by the authenticated user.
router.get('/getFavorite/id/:eventId', authMiddleware, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const isFavorite = event.favorites.includes(req.user.id);
  res.status(200).json({ isFavorite: isFavorite });
}));

// this route marks a specific event as favorite for the authenticated user.
router.post('/setFavorite/id/:eventId', authMiddleware, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  if (!event.favorites.includes(req.user.id)) {
    event.favorites.push(req.user.id);
    if (!event.numberOfLikes) {
      event.numberOfLikes = 0;
    }
    event.numberOfLikes += 1;
    await event.save();
  }
  res.status(200).json(event);
}));

// this route unmarks a specific event as favorite for the authenticated user.
router.delete('/unfavorite/id/:eventId', authMiddleware, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  const index = event.favorites.indexOf(req.user.id);
  if (index > -1) {
    event.favorites.splice(index, 1);
    if (!event.numberOfLikes) {
      event.numberOfLikes = 0;
    }
    else {
      event.numberOfLikes -= 1;
    }
    await event.save();
  }
  res.status(200).json(event);
}));

module.exports = router;