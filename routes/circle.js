const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Circle = require('../models/Circle');
const User = require('../models/User');

// @desc    Gets all circles a user belongs to
// @route   GET /circle
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const circles = user.circles;
    res.status(200).json(circles);
  } catch (err) {
    next(err);
  }
});

// @desc    Gets all circle admins
// @route   GET /circle/admins/:circleId
// @access  Must be authenticated
router.get('/admins/:circleId', isAuthenticated, async (req, res, next) => {
  const { circleId } = req.params;
  try {
    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ msg: 'Circle not found' });
    }
    const admins = circle.admins;
    res.status(200).json(admins);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new circle
// @route   POST /circle
// @access  Must be authenticated
router.post('/create', isAuthenticated, async (req, res, next) => {
  const { name } = req.body;
  try {
    const circleInDB = await Circle.findOne({name: name});
    if (circleInDB) {
      res.status(400).json({ success: false, message: `A circle with name ${name} already exists` })
      return;
    }
    else {
      //we create the new circle
      const circle = await Circle.create({
        name,
        admins: [req.payload._id]
      });
      //we add the circle to the user's property 'circles' as well
      const updatedUser = await User.findByIdAndUpdate(req.payload._id, {
        $addToSet: {
          'circles': circle._id
        }
      })
      res.status(200).json({circle, updatedUser});
    }
  } catch (err) {
    next(err);
  }
});

// @desc    Allows a user to exit a circle
// @route   PATCH /circle/exit/:circleId
// @access  Must be authenticated
router.patch('/exit/:circleId', isAuthenticated, async (req, res, next) => {
  const { circleId } = req.params;
  try { 
    const user = await User.findById(req.payload._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (!user.circles.includes(circleId)) {
      res.status(404).json({success: false, message: 'User does not belong to the circle'});
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(req.payload._id, {
      $pull: { 'circles': circleId }
    }, { new: true });
    res.status(201).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// @desc    User joins circle as regular user
// @route   PUT /circle/join/:circleId
// @access  Must be authenticated
router.put('/join/:circleId', isAuthenticated, async (req, res, next) => {
  const { circleId } = req.params;
  try { 
    const user = await User.findById(req.payload._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (user.circles.includes(circleId)) {
      res.status(404).json({success: false, message: 'User already belongs to circle'});
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(req.payload._id, {
      $set: { 'circles': circleId }
    }, { new: true });
    res.status(201).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;