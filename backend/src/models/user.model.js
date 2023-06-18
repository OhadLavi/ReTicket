const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageURL: { type: String },
    balance: { type: Number, default: 0 } 
  }, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  });

  userSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
}

  module.exports = mongoose.model('users', userSchema);