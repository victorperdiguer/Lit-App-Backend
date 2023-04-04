const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const UserAnswer = require('../models/UserAnswer');

// @desc    Get all user answers that had 
// @route   GET /answer/:userId
// @access  Must be authenticated
router.get('/answer/me/:userId', isAuthenticated, async (req, res, next) => {
  try {
    const userAnswers = await UserAnswer.find({ userAsked: req.params.userId }).populate('questionId').populate('userAnswered').populate('usersIgnored');
    if (!userAnswers) {
      return res.status(404).json({ msg: 'No user actions found' });
    }
    res.status(200).json(userAnswers);
  } catch (err) {
    next(err);
  }
});

// @desc    Registers user answer
// @route   POST /user-answer/:questionId
// @access  Must be authenticated
router.post('/answer/create/:questionId', isAuthenticated, async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { userAnswered, usersIgnored } = req.body;
    const userAsked = req.user._id;

    const userAnswer = new UserAnswer.create({
      questionId,
      userAsked,
      userAnswered,
      usersIgnored
    });

    res.status(200).json(userAnswer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;