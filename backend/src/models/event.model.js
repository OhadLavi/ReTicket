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
    required: [false, 'Event description is required'],
    trim: false,
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
    required: [false, 'Event price is required'],
    min: [0, 'Event price cannot be less than 0'],
    default: 50
  },
  availableTickets: {
    type: Number,
    required: [false, 'Event availableTickets is required'],
    min: [0, 'Event availableTickets cannot be less than 0'],
    default: 0
  },
  soldTickets: {
    type: Number,
    required: [false, 'Event soldTickets is required'],
    min: [0, 'Event soldTickets cannot be less than 0'],
    default: 0
  },
  wantedTickets: {
    type: Number,
    required: [false, 'Event wantedTickets is required'],
    min: [0, 'Event wantedTickets cannot be less than 0'],
    default: 0
  },
  waitingList: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      notifiedAt: {
        type: Date
      }
    }
  ]
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

eventSchema.statics.getNonExpiredEvents = function() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  return this.find({ date: { $gte: currentDate } });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event };