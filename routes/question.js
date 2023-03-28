const router = require('express').Router();
const isAuthenticated = require('../middlewares/jwt');

// @desc    Gets random question from DB
// @route   GET /question
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
            const question = await QuestionModel.aggregate([{ $sample: { size: 1 } }]);
            if (!question) {
                return res.status(404).json({ msg: 'No questions found' });
            }
            res.json(question);
        }   catch (err) {
                next(err);
    }
});

// @desc    Posts new question to DB
// @route   POST /question
// @access  Must be authenticated
router.post('/', isAuthenticated, async (req, res, next) => {
    res.send('This is the REST API home. Add an endpoint to see data.')
});
    
module.exports = router;