const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/jwt');
const Category = require('../models/Category');

// @desc    Retrieves all categories from DB
// @route   GET /categories
// @access  Private
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create new category in DB
// @route   POST /categories
// @access  Private
router.post('/create', isAuthenticated, async (req, res, next) => {
  const { name } = req.body;
  console.log(name);
  try {
    const newCategory = await Category.create({ name: name });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;