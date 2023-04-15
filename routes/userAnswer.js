const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/jwt');
const UserAnswer = require('../models/UserAnswer');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all user answers that have the user as the answer
// @route   GET /answer/me
// @access  Must be authenticated
router.get('/me', isAuthenticated, async (req, res, next) => {
  try {
    const userAnswers = await UserAnswer.find({ userAnswered: req.payload._id });
    if (!userAnswers) {
      res.status(404).json({msg: 'No user answers found' });
      return;
    }
    res.status(200).json(userAnswers);
  } catch (err) {
    next(err);
  }
});

// @desc    Retrieves last answered question
// @route   GET /answer/last
// @access  Must be authenticated
router.get('/last', isAuthenticated, async (req, res, next) => {
  try {
    const lastUserAnswer = await UserAnswer.findOne({ userAsked: req.payload._id }).sort({createdAt: -1}).exec();
    if (!lastUserAnswer) {
      res.status(404).json({msg: 'No user answers found' });
      return;
    }
    console.log(lastUserAnswer);
    res.status(200).json(lastUserAnswer);
  } catch (err) {
    next(err);
  }
});

// @desc    Retrieves all questions answered by the user in the current day, returns the number and sets it in the user's document
// @route   GET /answer/today
// @access  Must be authenticated
router.get('/today', isAuthenticated, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todaysUserAnswers = await UserAnswer.find({
      userAsked: req.payload._id,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).exec();
    const dailyQuestionsAnswered = todaysUserAnswers.length;
    await User.findOneAndUpdate(
      { _id: req.payload._id },
      { 
        dailyQuestionsAnswered: dailyQuestionsAnswered,
      },
      { new: true },
    );
    res.status(200).json(dailyQuestionsAnswered);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving today\'s UserAnswers', error });
  }
});

// @desc    Registers user answer
// @route   POST /answer/create/:questionId
// @access  Must be authenticated
router.post('/create/:questionId', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  const { userAnswered, usersIgnored } = req.body;
  const userAsked = req.payload._id;
  try {
    const userAnswer = await UserAnswer.create({
      questionId,
      userAsked,
      userAnswered,
      usersIgnored
    });
    //update answer history of user
    const updatedUser = await User.findOneAndUpdate(
      { _id: userAsked },
      { 
        $inc: { dailyQuestionsAnswered: 1, money: 1 },
        lastAnsweredDate: Date.now() 
      },
      { new: true },
    );
    //post notification
    const newNotification = await Notification.create({
      action: userAnswer._id,
      sender: req.payload._id,
      recipient: userAnswered,
      type: 'answer'
    })

    res.status(200).json({answer: userAnswer, updatedUser: updatedUser});
  } catch (err) {
    next(err);
  }
});

// @desc    Allows user to skip question
// @route   POST /answer/skip
// @access  Must be authenticated
router.post('/skip', isAuthenticated, async (req, res, next) => {
  const userAsked = req.payload._id;
  try {
    //check if user has enough money
    const user = await User.findById(userAsked);
    console.log(user);
    console.log(user.money);
    if (user.money>=10) {
      //update answer history of user
      const updatedUser = await User.findOneAndUpdate(
        { _id: userAsked },
        { 
          $inc: { dailyQuestionsAnswered: 1, money: -10 },
        },
        { new: true },
      );
      res.status(200).json(updatedUser);
    }
    else {
      res.status(402).json({msg: "Insufficient money"});
    }
  } catch (err) {
    next(err);
  }
});

// @desc    Allows user to shuffle question and not answer it
// @route   POST /answer/shuffle
// @access  Must be authenticated
router.post('/shuffle', isAuthenticated, async (req, res, next) => {
  const userAsked = req.payload._id;
  try {
    //check if user has enough money
    const user = await User.findById(userAsked);
    console.log(user.money);
    if (user.money>=5) {
      //update answer history of user
      const updatedUser = await User.findOneAndUpdate(
        { _id: userAsked },
        { 
          $inc: { money: -5}
        },
        { new: true },
      );
      res.status(200).json(updatedUser);
    }
    else {
      res.status(402).json({msg: "Insufficient money"});
    }
  } catch (err) {
    next(err);
  }
});


module.exports = router;