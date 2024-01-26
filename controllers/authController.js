/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
// Inbuilt function
const { promisify } = require('utils');
// liab for JSON web tokens
const jwt = require('jsonwebtoken');
// importing user from user schema
const User = require('../models/userModel');
// common function for.
const catchAsync = require('../utils/catchAsync');
// Custom Error class
const AppError = require('../utils/appError');
// token creation function
// takes id as input, secret key defined in .env and options obj.

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// user signup controller
exports.signup = catchAsync(async (req, res, next) => {
  // creating new user in the DB
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  // the id passed in sign token function is automatically created by mongo.
  const token = signToken(newUser._id);
  // response with token and user
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
// login controller
exports.login = catchAsync(async (req, res, next) => {
  // destructuring email and password
  const { email, password } = req.body;
  // if either of them not provided throw error.
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // find the user with the provided email and password
  // since password field is disabled we have to specipcally seletect it from the DB.
  const user = await User.findOne({ email: email }).select('+password');

  if (!email || !user.correctPassword(password, user.password)) {
    return next(new AppError('email or password is wrong', 401));
  }
  // sending token back to user
  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token
  });
});
// middleware controller to get auth token
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // checking for token sent in the headers obj
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // if token not present send error
  if (!token) {
    return next(
      new AppError('You are not logged in, please login first.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  next();
});
