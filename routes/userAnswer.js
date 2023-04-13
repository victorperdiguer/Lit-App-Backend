const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/jwt');
const UserAnswer = require('../models/UserAnswer');
const User = require('../models/User');

// @desc    Get all user answers that have the user as the answer
// @route   GET /answer/:userId
// @access  Must be authenticated
router.get('/me/:userId', isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  const { payloadUser } = req.payload._id;
  if (userId !== payloadUser) {
    res.status(403).json({msg: "Forbidden: user ID not matching request user ID"});
    return;
  }
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