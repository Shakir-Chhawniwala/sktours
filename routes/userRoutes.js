const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// sigup route
router.post('/signup', authController.signup);
// login route
router.post('/login', authController.login);

// route to get all users and create a new user and middle ware route to authenticate users
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);
// route to create, delete, read and update user .
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
