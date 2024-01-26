const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value} please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const values = Object.values(err).map(e => e.message);
  const message = `Missing fields: ${values.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
  new AppError('Invalid Token, please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.stausCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res
      .status(err.stausCode)
      .json({ status: err.status, message: err.message });
  } else {
    console.error('Error', err);
    res.staus(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    // Already data present in DB error
    if (error.code === 11000) error = handleDuplicateFieldsDB(err);
    // DB Validation error
    if (error.name === 'handleValidationError')
      error = handleValidationErrorDB(err);
    // Wrong token error
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    // Token expired error
    if (error.name === 'Token expired error') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
