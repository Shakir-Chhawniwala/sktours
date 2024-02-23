const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createTour
  );

module.exports = router;
