const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Question = require('../models/Question');
const Circle = require('../models/Circle');
const User = require('../models/User');

// @desc    Retrieves question from DB
// @route   GET /question/:questionId
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
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

// @desc    Retrives random a random question from DB. The question must (A) be 'approved' and (B) either be 'isGlobal' or belong to a circle from the user.
// @route   GET /question/random
// @access  Must be authenticated
router.get('/random', isAuthenticated, async (req, res, next) => {
  try {
    const question = await Question.aggregate([
      { $match: { approved: true, $or: [{ isGlobal: true }, { circle: { $in: req.payload.circles } }] } },
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


// @desc    Gets 4 random users from same circle as question, with at least 2 different genders
// @route   GET /question/:questionId/answer-options
// @access  Must be authenticated
router.get('/answer-options/:questionId', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  try {
    const question = await Question.findById(questionId).populate('circle');
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    let users = [];
    if (question.general) {
      // If the question is general, select a random circle that the user is a part of
      const circles = await User.findById(req.payload.id).circles;
      if (circles.length === 0) {
        return res.status(404).json({ msg: 'No circles found for user' });
      }
      const randomCircle = circles[Math.floor(Math.random() * circles.length)];
      users = await User.aggregate([
        // Select 4 random users from the circle, with at least 2 different genders
        { $match: { _id: { $nin: [req.user._id] }, 'profile.gender': { $exists: true }, 'circlePermissions.userPermission': randomCircle._id } },
        { $sample: { size: 4 } },
        { $group: { _id: '$profile.gender' } },
        { $match: { $or: [{ _id: 'male' }, { _id: 'female' }] } },
        { $limit: 4 }
      ]);
    } else {
      // If the question belongs to a specific circle, select 4 random users from the same circle, with at least 2 different genders
      users = await UserModel.aggregate([
        { $match: { _id: { $nin: [req.user._id] }, 'profile.gender': { $exists: true }, 'circlePermissions.userPermission': question.circle._id } },
        { $sample: { size: 4 } },
        { $group: { _id: '$profile.gender' } },
        { $match: { $or: [{ _id: 'male' }, { _id: 'female' }] } },
        { $limit: 4 }
      ]);
    }

    res.status(200).json(users);
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

  try {
    //check question doesn't exist already
    const questionAlreadyExists = await Question.findOne({question: question, $or: [{ isGlobal: true }, { circle: { $in: req.payload.circles } }]})
    if (questionAlreadyExists) {
      res.status(403).json({msg: `Question already exists`});
      return;
    }
    else {
      //create question
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

// @desc    Modifies fields in a question. Currently only modifies the field 'approved'.
// @route   PUT /question/edit/:id
// @access  Must be authenticated and must have admin role
router.put('/:questionId/edit', isAuthenticated, isAdmin, async (req, res, next) => {
  const { questionId } = req.params;
  const { approved } = req.body;
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(questionId, { approved: approved });
    if (!updatedQuestion) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// @desc    Deletes a question. A question can only be deleted by an admin during the review process.
// @route   DELETE /question/delete/:id
// @access  Must be authenticated and must have admin role
router.delete('/:questionId/delete', isAuthenticated, isAdmin, async(req, res, next) => {
  const {questionId} = req.params;
  try {
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    res.status(201).json(deletedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
    
module.exports = router;