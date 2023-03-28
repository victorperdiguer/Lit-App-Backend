const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Question = require('../models/Question');

// @desc    Gets random question from DB
// @route   GET /question
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const question = await QuestionModel.aggregate([{ $sample: { size: 1 } }]);
    if (!question) {
      return res.status(404).json({ msg: 'No questions found' });
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
router.put('/edit/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  const id = req.params;
  const { approved } = req.body;
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(id, { approved: approved });
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
router.delete('/delete/:id', isAuthenticated, isAdmin, async(req, res, next) => {
  const id = req.params;
  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);
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