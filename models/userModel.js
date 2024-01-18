const validator = require('validator');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    require: [true, 'Please provide your name']
  },
  email: {
    type: String,
    unique: true,
    lowecase: true,
    require: [true, 'Please provide your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    min: 8
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please provide a password'],
    min: 8
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
