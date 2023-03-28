const router = require('express').Router();
const isAuthenticated = require('../middlewares/jwt');

// @desc    Gets question from DB
// @route   GET /question
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
    res.send('This is the REST API home. Add an endpoint to see data.')
});

// @desc    Posts new question to DB
// @route   POST /question
// @access  Must be authenticated
router.post('/', isAuthenticated, async (req, res, next) => {
    res.send('This is the REST API home. Add an endpoint to see data.')
});
    
module.exports = router;