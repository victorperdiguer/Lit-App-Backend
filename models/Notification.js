const mongoose = require('mongoose');
const User = require('./User');
const UserAnswer = require('./UserAnswer');

const notificationSchema = new mongoose.Schema({
  action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAnswer',
    required:true
  },
  statusRead: {
    type: Boolean,
    default: false,
    required: true
  },
  readDate: {
    type: Date,
  },
  sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  type: {
      type: String,
      enum: ['answer', 'questionApproval'],
      required: true
  },
  content: {
      type: String,
  },
  statusRevealed: {
      type: Boolean,
      required: true,
      default: false
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;