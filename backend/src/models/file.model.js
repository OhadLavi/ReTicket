const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Buffer, required: true }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

const File = mongoose.model('File', fileSchema);

module.exports = { File };
