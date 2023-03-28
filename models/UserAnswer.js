const mongoose = require('mongoose');
const User = require('./User');
const Question = require('./Question');

const userAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userAsked: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAnswered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usersIgnored: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserAnswer', userAnswerSchema);