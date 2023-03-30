require('dotenv').config();
require('./db');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

// Routers require
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const questionRouter = require('./routes/question');
const circleRouter = require('./routes/circle');
const leaderboardRouter = require('./routes/leaderboard');
const notificationRouter = require('./routes/notification');
const paymentRouter = require('./routes/payment');
const userRouter = require('./routes/user');
const userAnswerRouter = require('./routes/userAnswer');

const app = express();

// cookies and loggers
app.use(cors({
  origin: process.env.ORIGIN
}));
app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/', indexRouter);            // routes for the homepage
app.use('/auth', authRouter);         // routes for authentication
app.use('/question', questionRouter); // routes for questions
app.use('/circle', circleRouter);     // routes for circles
app.use('/leaderboard', leaderboardRouter); // routes for leaderboard
app.use('/notification', notificationRouter); // routes for notifications
app.use('/payment', paymentRouter);   // routes for payments
app.use('/user', userRouter);   // routes for user profiles
app.use('/userAnswer', userAnswerRouter); // routes for user answers

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err.status === 404) {
    res.status(err.status || 404);
  } else {
    res.status(err.status || 500);
  }
});

module.exports = app;
