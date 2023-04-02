const mongoose = require('mongoose');
const Circle = require('./Circle');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'superadmin'],
    default: 'user',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  hashedPassword: {
    type: String,
    required: true
  },
  instagram: {
    type: String
  },
  tiktok: {
    type: String
  },
  snapchat: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  picture: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
   safeMode: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  //these are properties used to handle the user's daily activites
  money: {
    type: Number,
    default: 0
  },
  dailyQuestionsAnswered: {
    type: Number,
    default: 0
  },
  lastAnsweredDate: {
    type: Date
  },
  lastProfileEdit: {
    type: Date
  },
  //these properties identify what circle the user belongs to
  circles: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Circle'
  }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;