const mongoose = require('mongoose');
const { Schema } = mongoose;

const tourSchema = new Schema({
  name: {
    type: String,
    required: ['true', 'Name is a required field'],
    unique: true,
  },
  price: {
    type: Number,
    required: ['true', 'A tour pack must have price'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour