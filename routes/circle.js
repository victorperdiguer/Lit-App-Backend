const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Circle = require('../models/Circle');
const User = require('../models/User');

// @desc    Gets all circles a user belongs to
// @route   GET /circles
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('circlePermissions.userPermission').exec();
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const circles = user.circlePermissions.userPermission;
    res.status(200).json(circles);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new circle
// @route   POST /circle
// @access  Must be authenticated
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { name } = req.body;
    const circle = await Circle.create({
      name,
      admins: [req.user.id]
    });
    res.status(200).json(circle);
  } catch (err) {
    next(err);
  }
});

module.exports = router;