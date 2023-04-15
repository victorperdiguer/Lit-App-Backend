const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/jwt');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserAnswer = require('../models/UserAnswer');
const Notification = require('../models/Notification');

// @desc    Get all user notifications in the last 2 natural days
// @route   GET /notification/all
// @access  Must be authenticated
router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDayBeforeYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const last2DaysNotifications = await Notification.find({
      createdAt: {
        $gte: startOfDayBeforeYesterday,
      },
      recipient: req.payload._id
    })
    .populate('action')
    .populate('sender')
    .exec();

    res.status(200).json(last2DaysNotifications);
  } catch (error) {
    res.status(500).json({msg: 'Something bad happened', error})
  }
});

// @desc    Returns true if there's un unread notification in the last 2 days
// @route   GET /notification/new
// @access  Must be authenticated
router.get('/new', isAuthenticated, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDayBeforeYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const unreadLast2DaysNotifications = await Notification.find({
      createdAt: {
        $gte: startOfDayBeforeYesterday,
      },
      recipient: req.payload._id,
      statusRead: false
    }).exec();

    res.status(200).json(unreadLast2DaysNotifications);
  } catch (error) {
    res.status(500).json({msg: 'Something bad happened', error})
  }
});

// @desc    Mark notification as read
// @route   PATCH /notification/read/:notificationId
// @access  Must be authenticated
router.patch('/read/:notificationId', isAuthenticated, async (req, res, next) => {
  const { notificationId } = req.params;
  try {
    const notificationUpdated = await Notification.findByIdAndUpdate(
      notificationId,
      { statusRead: true },
      { new: true }
    );
    if (!notificationUpdated) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(200).json(notificationUpdated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating notification', error });
  }
});

// @desc    Mark notification as revealed for 25 gems
// @route   PATCH /notification/reveal/:notificationId
// @access  Must be authenticated
router.patch('/reveal/:notificationId', isAuthenticated, async (req, res, next) => {
  const { notificationId } = req.params;
  try {
    const user = await User.findById(req.payload._id);
    if (user.money>=25) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.payload._id },
        { 
          $inc: { money: -25}
        },
        { new: true },
      );
      const notificationUpdated = await Notification.findByIdAndUpdate(
        notificationId,
        { statusRevealed: true },
        { new: true }
      );
      res.status(200).json(notificationUpdated);
    }
    else {
      res.status(402).json({msg: "Insufficient money"});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error updating notification', error });
  }
})

module.exports = router;