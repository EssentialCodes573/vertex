const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['payment', 'user'], required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);