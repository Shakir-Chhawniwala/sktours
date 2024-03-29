/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
// Inbuilt function
const { promisify } = require('util');
// liab for JSON web tokens
const jwt = require('jsonwebtoken');
// importing user from user schema
const User = require('../models/userModel');
// common function for.
const catchAsync = require('../utils/catchAsync');
// Custom Error class
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// token creation function
// takes id as input, secret key defined in .env and options obj.
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  // response with token and user
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
// user signup controller
exports.signup = catchAsync(async (req, res, next) => {
  // creating new user in the DB
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });
  createSendToken(newUser, 200, res);
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
  createSendToken(user, 201, res);
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
  // Verifying if token is valid.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Find the user with the given token.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist.', 401)
    );
  }
  // Check if user has changed passowrd after the token was issued.
  if (currentUser.passwordChangedAt(decoded.iat)) {
    return next(
      new AppError(
        'The user has changed password recently please log in again.',
        401
      )
    );
  }
  // Adding current user in the req so that it can available everywhere.
  req.user = currentUser;

  next();
});

// Restricting access to certain users
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user)) {
      return new AppError(
        'You do not have permission to perform this action',
        403
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find the user with the given email in the DB
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return new AppError('There is no user with email address', 404);
  }

  const resetToken = User.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forgot your password please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token  (valid for 10 min)',
      message
    });

    res.statusCode(200).json({
      status: 'success',
      message: 'Token sent successfully'
    });

    await user.save({ validateBeforeSave: false });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordChangedAt: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token has expired or invalid.'), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new Error('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res);
});
