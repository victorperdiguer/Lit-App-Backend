const mongoose = require('mongoose');
const Circle = require('./Circle');

const userSchema = new mongoose.Schema({
  //user model has a 'profile' object containing the user's actual personal data
  profile: {
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
    socialMedia: {
      instagram: {
        type: String
      },
      tiktok: {
        type: String
      },
      snapchat: {
        type: String
      },
      facebook: {
        type: String
      }
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
    }
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
  safeMode: {
    type: Boolean,
    default: false
  },
  //these properties identify what circle the user belongs to and his role in the circle
  circlePermissions: {
    userPermission: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Circle'
    },
    adminPermission: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Circle'
    }
  }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;