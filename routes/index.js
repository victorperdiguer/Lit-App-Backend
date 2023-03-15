const router = require('express').Router();

// @desc    Index page for the API
// @route   GET /api/v1/
// @access  Public
router.get('/', async (req, res, next) => {;
  res.send('REST API')
});

module.exports = router;