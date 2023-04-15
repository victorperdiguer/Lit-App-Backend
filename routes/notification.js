const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/jwt');
const mongoose = require('mongoose');
const UserAnswer = require('../models/UserAnswer');
const Notification = require('../models/Notification');

// @desc    Get all user notifications in the last 2 natural days
// @route   GET /notification
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
    }).exec();

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

// @desc    Mark notifications as read
// @route   PATCH /notifications/update
// @access  Must be authenticated
router.patch('/update', isAuthenticated, async (req, res, next) => {
  const { notifications } = req.body;
  const notificationsMongoId = notifications.map(id => mongoose.Types.ObjectId(id));
  try {
    const notificationsUpdated = await Notification.updateMany(
      { _id: { $in: notificationsMongoId } },
      { $set: { statusRead: true } }
    );
    res.status(200).json(notificationsUpdated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating notifications', error });
  }
})

module.exports = router;