/* eslint-disable import/no-extraneous-dependencies */
// lib for custom validation
const validator = require('validator');
// MongoDB framework
const mongoose = require('mongoose');
// lib for hasing, comparing, verifying passowrd
const bcrypt = require('bcryptjs');

// Destructing schema from moongose obj.
const { Schema } = mongoose;
// User Schema.
const userSchema = new Schema({
  name: {
    type: String,
    // DB inbuilt validations.
    require: [true, 'Please provide your name']
  },
  email: {
    type: String,
    unique: true,
    lowecase: true,
    require: [true, 'Please provide your email'],
    // Third party liabrary used for email validation
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    min: 8,
    // this will prevent password from being sent in response
    select: false
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please provide a password'],
    // This is a custom validation function for DB
    validate: {
      validator: function(e) {
        return e === this.password;
      }
    }
  },
  passwordChangedAt: Date
});

// Middleware defined before creating user in DB for hasing password.
userSchema.pre('save', async function(next) {
  // Note:- Since this function is defined with "function" keyword we have access to "this"
  // This line will validate for if the user password is not changed
  if (!this.isModified('password')) return next();
  // Hasing password with "bcrypt" liabrary before saving to DB
  this.password = await bcrypt.hash(this.password, 14);
  // since password confirm field is just for confirming password we hare setting password confirm field to undefined in order to avoid duplicancy.
  this.passwordConfirm = undefined;
});
// This is a custom method on user schema to compare password
// and will be available with user schema obj
userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};
// Custom method for tracking user password date expired
userSchema.method.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const convertToTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp > convertToTimestamp;
  }
  return false;
};
// Creating model with moongose liabrary
const User = mongoose.model('User', userSchema);
// Exporting User model
module.exports = User;
