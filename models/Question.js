const mongoose = require('mongoose');
const User = require('./User');
const Category = require('./Category');

const questionSchema = new mongoose.Schema({
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
  //a question must be approved by the circle admin before being accepted into the rotation
  approved: {
    type: Boolean,
    default: false
  },
  //a question can be safe or not safe to comply with user preferences
  safe: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  //if this property is true, the question is global and all circles have it
  general: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);