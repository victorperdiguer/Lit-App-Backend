const mongoose = require('mongoose');
const User = require('./User');
const Category = require('./Category');
const Circle = require('./Circle');

const questionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    default: "😳",
    required: true
  },
  question: {
    type: String,
    required: true
  },
  //a question can count in multiple categories, some of them positive, some of them negative
  categories: {
    positive: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category'
    },
    negative: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category'
    }
  },
  //a question's status has 3 options: pending approval, approved (so it becomes part of the rotation) and rejected. When questions are submitted, they are pending a status by default. Admins can either approve or reject them.
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  //a question can be safe or not safe to comply with user preferences
  isSafe: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  //if this property is true, the question is global and all circles have it
  isGlobal: {
    type: Boolean,
    default: false
  },
  //the question must be created for a given circle
  circle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circle',
    required: true
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;