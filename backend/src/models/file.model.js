const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  name: String,
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

const File = mongoose.model('File', fileSchema);

module.exports = { File };
