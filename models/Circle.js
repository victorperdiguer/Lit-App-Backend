const mongoose = require('mongoose');
const User = require('./User');
const Question = require('./Question');

const circleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  communityQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  removedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const CircleModel = mongoose.model('Circle', circleSchema);

module.exports = CircleModel;