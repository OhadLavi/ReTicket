const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

const Food = mongoose.model('Food', foodSchema);

module.exports = { Food };
