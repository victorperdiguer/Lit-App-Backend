const router = require('express').Router();
const mongoose = require('mongoose');
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Question = require('../models/Question');
const Circle = require('../models/Circle');
const User = require('../models/User');


// @desc    Retrieves random a random question from DB. The question status must (A) be 'approved' and (B) either be 'isGlobal' or belong to a circle from the user.
// @route   GET /question/random
// @access  Must be authenticated
router.get('/single/random', isAuthenticated, async (req, res, next) => {
  //We need to convert the array of circle ID's in the payload (an array of strings) to an array of ObjectID's for the query to work
  const circleObjectIds = req.payload.circles.map(id => mongoose.Types.ObjectId(id));
  try {
    const question = await Question.aggregate([
      { $match: { status: 'approved', $or: [{ isGlobal: true }, { circle: { $in: circleObjectIds } }] } },
      { $sample: { size: 1 } }
    ]);
    if (!question) {
      return res.status(404).json({ msg: 'No questions found' });
    }
    res.status(200).json(question);
    } catch (err) {
      next(err);
  }
});

// @desc    Retrieves question from DB
// @route   GET /question/:questionId
// @access  Must be authenticated
router.get('/single/:questionId', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ msg: 'Question does not exist' });
    }
    res.status(200).json(question);
    } catch (err) {
      next(err);
  }
});

// @desc    Posts new question to DB
// @route   POST /question/create
// @access  Must be authenticated
router.post('/create', isAuthenticated, async (req, res, next) => {
  const { emoji, question, categories, isSafe, isGlobal, circle } = req.body;
  const author = req.payload._id;
  //check fields
  const error = [];
  const emojiRegex = /\p{Extended_Pictographic}/ug;
  if (!emoji || !emojiRegex.test(emoji)) {
    error.push('emoji');
  }
  if (typeof question !== 'string' || question.trim() === '') {
    error.push('question');
  }
  if (typeof isSafe !== 'boolean') {
    error.push('isSafe');
  }
  if (typeof isGlobal !== 'boolean') {
    error.push('isGlobal');
  }
  if (isGlobal === false && !circle) {
    error.push('circle');
  }
  if (error.length != 0) {
    res.status(400).json({msg: `Invalid format or invalid data in the following fields: ${error}`});
    return;
  }
  //create question
  try {
    //check question doesn't exist already
    const questionAlreadyExists = await Question.findOne({question: question, $or: [{ isGlobal: true }, { circle: { $in: req.payload.circles } }]})
    if (questionAlreadyExists) {
      res.status(403).json({msg: `Question already exists`});
      return;
    }
    else {
      const newQuestion = await Question.create({
        question,
        categories,
        isSafe,
        author,
        isGlobal,
        circle
      });
      res.status(201).json(newQuestion);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// @desc    Allows circle admin to approve or reject question.
// @route   PUT /question/validate/:id
// @access  Must be authenticated and must be circle admin
router.patch('/validate/:questionId', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  const { newStatus } = req.body;
  if (newStatus !== 'approved' && newStatus !== 'rejected') {
    res.status(400).json({msg: 'Question status must be either approved or rejected'});
    return;
  }
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({msg: 'Question not found'});
      return;
    }
    console.log(question.circle);
    const circle = await Circle.findById(question.circle);
    console.log(circle);
    if (!circle) {
      res.status(404).json({msg: 'Question does not belong to an existing circle'});
      return;
    }
    if (!circle.admins.includes(req.payload._id)) {
      res.status(403).json({msg: "Forbidden: user is not admin of this question's circle"});
      return;
    }
    const updatedQuestion = await Question.findByIdAndUpdate(questionId, { status: newStatus }, {new: true});
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// @desc    Gets 4 random users from same circle as question, with at least 2 different genders
// @route   GET /question/answer-options/:questionId
// @access  Must be authenticated
router.get('/answer-options/:questionId', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  //See route /question/single/random to understand this part
  const circleObjectIds = req.payload.circles.map(id => mongoose.Types.ObjectId(id));
  //this will be the array we will return in the response
  let users = [];
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ msg: 'Question not found' });
      return;
    }
    let selectedCircle = question.circle;
    // If the question is general, select a random circle that the user is a member of
    if (question.general) {
      const userCircles = await User.findById(req.payload._id).circles;
      if (userCircles.length === 0) {
        res.status(404).json({ msg: 'No circles found for user' });
        return;
      }
      selectedCircle = userCircles[Math.floor(Math.random() * userCircles.length)];
    }
    // We start by dividing the circles' users into 2 lists based on gender.
    const allCircleUsers = await User.find({selectedCircle: { $in: {circleObjectIds}}});
    const maleUsers = allCircleUsers.filter((user) => user.gender === 'male');
    const femaleUsers = allCircleUsers.filter((user) => user.gender === 'female');
    //We select 1 male and 1 female if possible, then fill out the rest without repeating those already selected.
    maleUsers.length !== 0 ? users.push(maleUsers[Math.floor(Math.random() * maleUsers.length)]) : null;
    femaleUsers.length !== 0 ? users.push(femaleUsers[Math.floor(Math.random() * femaleUsers.length)]) : null;
    while (users.length < Math.min(4, allCircleUsers.length)) {
      //We filter the allCircleUsers array to contain only users that haven't been chosen yet
      const remainingCircleUsers = allCircleUsers.filter((potentialUser) => !users.some((alreadyChosenUser) => potentialUser._id === alreadyChosenUser._id));
      users.push(remainingCircleUsers[Math.foor(Math.random() * remainingCircleUsers.length)]);
    }
    res.status(200).json({users: users});
  } catch (err) {
    next(err);
  }
});
    
module.exports = router;