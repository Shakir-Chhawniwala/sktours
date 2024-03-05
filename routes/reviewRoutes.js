const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setUserTourIds,
    reviewController.createTour
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteRoute);

module.exports = router;
