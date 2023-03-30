const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Question = require('../models/Question');
const Circle = require('../models/Circle');
const User = require('../models/User');

// @desc    Retrives random a random question from DB. The question must (A) be 'approved' and (B) either be 'isGlobal' or belong to a circle from the user.
// @route   GET /question
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const question = await Question.aggregate([
      { $match: { approved: true, $or: [{ isGlobal: true }, { circle: { $in: req.user.circlePermissions.userPermission } }] } },
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
// @route   GET /question/:questionId/users
// @access  Must be authenticated
router.get('/:questionId/users', isAuthenticated, async (req, res, next) => {
  const { questionId } = req.params;
  try {
    const question = await Question.findById(questionId).populate('circle');
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    let users = [];
    if (question.general) {
      // If the question is general, select a random circle that the user is a part of
      const circles = await Circle.find({ members: req.user._id });
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
  const { emoji, question, categories, author, safe, circle } = req.body;
  //check fields
  const errorList = [];
  emoji !== null ? null : error.push('emoji');
  question !== null ? null : error.push('question');
  categories.positive.length + categories.negative.length !== 0 ? null : error.push('categories');
  author !== null ? null : error.push('author');
  circle !== null ? null : error.push('circle');
  if (errorList.length != 0) {
    res.status(400).json({msg: `Invalid format/data in the following fields: ${errorList}`});
  }
  try {
    //create question
    const newQuestion = Question.create({
      question,
      categories,
      safe,
      author,
      circle
    });
    await newQuestion.save();
    res.status(201).json(newQuestion);
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
  const questionId = req.params;
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