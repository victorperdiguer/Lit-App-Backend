const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const User = require('../models/User');

// @desc    Get user information
// @route   GET /user
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-hashedPassword -circlePermissions -__v');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// @desc    Update user information
// @route   PUT /user
// @access  Must be authenticated
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Only allow a user to modify their own profile
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    // Update all fields in the user model
    user.profile = req.body.profile;
    user.money = req.body.money;
    user.dailyQuestionsAnswered = req.body.dailyQuestionsAnswered;
    user.lastAnsweredDate = req.body.lastAnsweredDate;
    user.safeMode = req.body.safeMode;
    user.circlePermissions = req.body.circlePermissions;

    // Save the updated user object
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true });

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;