const express = require('express');
const router = express.Router();
const sample_events = require('../data/events'); // Assuming you have an events data file
const { Event } = require('../models/event.model'); // Assuming you have an event model
const asyncHandler = require('express-async-handler');

router.get("/", asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
}));

router.get("/search/:searchTerm", asyncHandler(async (req, res) => {
  const searchRegex = new RegExp(req.params.searchTerm, 'i');
  const events = await Event.find({ 
    $or: [
      { name: { $regex: searchRegex } },
      { location: { $regex: searchRegex } },
      { venue: { $regex: searchRegex } },
      { city: { $regex: searchRegex } }
    ]
  });
  res.json(events);
}));


router.get("/id/:eventId", asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  res.json(event);
}));

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
