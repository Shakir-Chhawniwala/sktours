const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// 1) MIDDLEWARES
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// handling not defined routes
app.all('*', (req, res, next) => {
  // res.send(400).json({ status: 'fail', message: "Can't find on this server" });
  next(new AppError(`Can't find ${req.originalUrl} on this server`), 404);
});

// error middleware
app.use(globalErrorHandler);

module.exports = app;
