// const router = require('express').Router();
// const {isAuthenticated} = require('../middlewares/jwt');
// const User = require('../models/User');

// // @desc    Returns true if the user has enough money, false if he doesn't
// // @route   POST /payment
// // @access  Must be authenticated
// router.get('/', isAuthenticated, async (req, res, next) => {
//   const { cost } = req.body;
//   try {
//     const userInDB = await User.findById(req.payload._id);
//     if (!userInDB) {
//       res.status(404).json({msg: 'User not found'});
//       return;
//     } else {
//       if (cost>userInDB.money) {
//         res.status(200).
//       }
//     }
//   }
// })