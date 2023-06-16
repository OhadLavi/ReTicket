const express = require('express');
const router = express.Router();
const sample_events = require('../data/events');
const { Event } = require('../models/event.model');
const Ticket = require('../models/ticket.model');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const upload = multer();
const path = require('path');
const stringSimilarity = require('string-similarity');
const levenshtein = require('fast-levenshtein');
const natural = require('natural');
const fs = require('fs');
const mongoose = require('mongoose');

router.get("/", asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
}));

router.get("/search/:searchTerm?", asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    const allEvents = await Event.find();
    return res.json(allEvents);
  }

  let similarityScores = [];
  const searchTermWords = searchTerm.toLowerCase().replace(/[^\w\s]/gi, ' ').split(' ');
  const allEvents = await Event.find();
  const similarityThreshold = 0.8;
  const weights = { name: 0.6, location: 0.2, venue: 0.2 };
  let maxScoreEvent = { event: null, score: 0 };
  const similarEvents = allEvents.filter(event => {
    const { name, location, venue } = event;
    const valuesToSearch = { name, location, venue };
    let maxSimilarity = 0;
    Object.entries(valuesToSearch).forEach(([key, value]) => {
      const words = value.toLowerCase().replace(/[^\w\s]/gi, ' ').split(' ');
      words.forEach(word => {
        const checkSimilarity = (term) => {
          const distance = natural.LevenshteinDistance(term, word);
          let similarity = 1 - distance / Math.max(term.length, word.length);
          if (similarity > 0.75 && (key === 'location' || key === 'venue')) {
            maxSimilarity = Math.max(maxSimilarity, similarity);
          } else {
            similarity = weights[key] * similarity;
            maxSimilarity = Math.max(maxSimilarity, similarity);
          }
          const similarityScore = `Similarity between "${term}" and "${word}" in ${key}: ${similarity}`;
          similarityScores.push(similarityScore);
          return similarity;
        };
        searchTermWords.forEach(checkSimilarity);
        if (searchTermWords.length > 1) {
          checkSimilarity(searchTerm.toLowerCase().replace(/[^\w\s]/gi, ' '));
        }
      });
    });
    if (maxSimilarity > maxScoreEvent.score) {
      maxScoreEvent = { event, score: maxSimilarity };
    }
    return maxSimilarity >= similarityThreshold;
  });

  if (similarEvents.length === 0) {
    if (maxScoreEvent.event) {
      similarEvents.push(maxScoreEvent.event);
    } else {
      return res.status(500).json({ message: "No results" });
    }
  }
  
  res.json(similarEvents);
}));

router.get("/id/:eventId", asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  res.json(event);
}));

router.get("/checkInWaitingList/:eventId/:userId", asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({message: 'Event not found'});
  }
  const userId = req.params.userId;  
  const isInWaitingList = event.waitingList.some(user => user.userId.equals(userId));
  res.json(isInWaitingList);
}));


router.post("/id/:eventId/waitingList", asyncHandler(async (req, res) => {
  const userId = req.body.userId;
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

router.delete("/id/:eventId/waitingList/:userId", asyncHandler(async (req, res) => {
  const userId = req.params.userId;
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

router.post('/transcribeAudio', upload.single('audio'), async (req, res) => {
  const client = new speech.SpeechClient({
    projectId: process.env.PROJECT_ID,
    keyFilename: './keyfile.json'
  });
  const audio = {
    content: req.file.buffer.toString('base64'),
  };
  const config = {
    encoding: 'MP3',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
  res.send({ transcription });
});

// router.post("/transcribe", upload.single('audio'), async (req, res, next) => {
//   const fileName = req.file.path;

//   const audio = {
//     content: fs.readFileSync(fileName).toString('base64'),
//   };

//   const config = {
//     encoding: 'LINEAR16',
//     sampleRateHertz: 16000,
//     languageCode: 'en-US',
//   };

//   const request = {
//     audio: audio,
//     config: config,
//   };

//   const [response] = await client.recognize(request);
//   const transcription = response.results
//     .map(result => result.alternatives[0].transcript)
//     .join('\n');
  
//   res.send(transcription);
// });

router.get("/seed", asyncHandler(async (req, res) => {
  const eventsCount = await Event.countDocuments();
  if (eventsCount > 0) {
    res.send("Seed data already exists");
    return;
  }
  await Event.create(sample_events);
  res.send("Seed data created");
}));

module.exports = router;
