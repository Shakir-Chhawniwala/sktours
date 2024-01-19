/* eslint-disable import/no-extraneous-dependencies */
const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    validate: {
      validator: function(e) {
        return e === this.password;
      }
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined;
});
const User = mongoose.model('User', userSchema);

module.exports = User;
