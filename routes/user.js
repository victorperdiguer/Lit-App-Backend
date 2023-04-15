const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require('../middlewares/jwt');
const saltRounds = 10;

// @desc    Get user information
// @route   GET /user
// @access  Must be authenticated
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// @desc    Update user information
// @route   PATCH /user/edit
// @access  Private
router.patch('/edit', isAuthenticated, async (req, res, next) => {
  const { name, surname, email, password, phone, gender, instagram, tiktok, snapchat, dateOfBirth, safeMode } = req.body;
  console.log(req.body);
  // Check if name is a string
  if (name && typeof name !== "string") {
    res.status(400).json({ message: "Name must be a string" });
    return;
  }

  // Check if surname is a string
  if (surname && typeof surname !== "string") {
    res.status(400).json({ message: "Surname must be a string" });
    return;
  }

  // Check if email is valid
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }

  // Check if password is at least 6 characters long and has at least one lowercase letter, one uppercase letter and one number
  if (password && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(password)) {
    res.status(400).json({ message: "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter and one number" });
    return;
  }

  // Check if phone is valid
  if (phone && !/^\+[0-9]+$/.test(phone)) {
    res.status(400).json({ message: "Phone must be a string that only contains numbers and is preceeded by a + sign" });
    return;
  }

  // Check if gender is valid
  if (gender && !["male", "female", "other"].includes(gender)) {
    res.status(400).json({ message: "Gender must be either 'male', 'female', or 'other'" });
    return;
  }

  // Check if instagram is a string
  if (instagram && typeof instagram !== "string") {
    res.status(400).json({ message: "Instagram must be a string" });
    return;
  }

  // Check if tiktok is a string
  if (tiktok && typeof tiktok !== "string") {
    res.status(400).json({ message: "Tiktok must be a string" });
    return;
  }

  // Check if snapchat is a string
  if (snapchat && typeof snapchat !== "string") {
    res.status(400).json({ message: "Snapchat must be a string" });
    return;
  }

  // Check if dateOfBirth is a valid date
  if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
    res.status(400).json({ message: "Invalid date of birth" });
    return;
  }

  // Check if safeMode is a boolean
  if (safeMode && typeof safeMode !== "boolean") {
    res.status(400).json({ message: "Safe mode must be a boolean" });
    return;
  }

  try {
    //check email is unique
    console.log("check");
    if (email) {
      const userInDB = await User.findOne({ email: email });
      console.log("check2");
      console.log(userInDB);
      if (userInDB) {
        res.status(400).json({ message: "Email is already being used by another user" });
        return;
      }
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    let hashedPassword = "";
    password ? hashedPassword = bcrypt.hashSync(password, salt) : null;
    // First, update the user's information in the database
    const updatedUser = await User.findByIdAndUpdate(
        req.payload._id,
        {name, surname, email, hashedPassword, phone, gender, instagram, tiktok, snapchat, dateOfBirth, safeMode},
        { new: true }
      );
    // Update the user's information in the token payload
    const updatedPayload = {
      ...req.payload,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      gender: updatedUser.gender,
      safeMode: updatedUser.safeMode
    };
    try {
      const authToken = jwt.sign(
        updatedPayload,
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256'}
      );
      res.status(200).json({ updatedUser, authToken });
    } catch (error) {
      console.error(error);
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;