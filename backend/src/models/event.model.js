const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [50, 'Event name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [500, 'Event description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [50, 'Event location cannot exceed 50 characters']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [50, 'Event venue cannot exceed 50 characters']
  },
  image: {
    type: String,
    required: [true, 'Event image is required'],
    trim: true,
    maxlength: [1000, 'Event image cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Event price is required'],
    min: [0, 'Event price cannot be less than 0']
  },
  availableTickets: {
    type: Number,
    required: [true, 'Event availableTickets is required'],
    min: [0, 'Event availableTickets cannot be less than 0']
  },
  soldTickets: {
    type: Number,
    required: [true, 'Event soldTickets is required'],
    min: [0, 'Event soldTickets cannot be less than 0']
  },
  wantedTickets: {
    type: Number,
    required: [false, 'Event wantedTickets is required'],
    min: [0, 'Event wantedTickets cannot be less than 0'],
    default: 0
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  registeredUsersCount: {
    type: Number,
    required: [true, 'Event registeredUsersCount is required'],
    min: [0, 'Event registeredUsersCount cannot be less than 0']
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event };
