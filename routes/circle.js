const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../middlewares/jwt');
const Circle = require('../models/Circle');
const User = require('../models/User');

// @desc    Gets all circles
// @route   GET /circle/all
// @access  Must be authenticated
router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const circles = await Circle.find()
    res.status(200).json(circles);
  } catch (err) {
    next(err);
  }
});

// @desc    Gets all circles a user belongs to
// @route   GET /circle/me
// @access  Must be authenticated
router.get('/me', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id).populate('circles');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const circles = user.circles;
    res.status(200).json(circles);
  } catch (err) {
    next(err);
  }
});

// @desc    Gets all circles a user is the admin of
// @route   GET /circle/me/admin
// @access  Must be authenticated
router.get('/me/admin', isAuthenticated, async (req, res, next) => {
  try {
    // Find all circles where the user is an admin
    const circles = await Circle.find({ admins: req.payload._id }).populate('admins');
    
    if (!circles) {
      return res.status(404).json({ msg: 'No circles found where the user is an admin' });
    }

    res.status(200).json(circles);
  } catch (err) {
    next(err);
  }
});

// @desc    Gets all admins from a circle
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
// @route   DELETE /circle/exit/:circleId
// @access  Must be authenticated
router.delete('/exit/:circleId', isAuthenticated, async (req, res, next) => {
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
    console.log(user);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (user.circles.includes(circleId)) {
      res.status(409).json({success: false, message: 'User already belongs to circle'});
      return;
    }
    const circleExists = await Circle.findById(circleId);
    if (!circleExists) {
      res.status(404).json({success: false, message: 'Circle not found' });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(req.payload._id, {
      $push: { 'circles': circleId }
    }, { new: true });
    res.status(201).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;