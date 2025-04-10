const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    default: 0.00,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const AddOn = mongoose.model('AddOn', addOnSchema);

module.exports = AddOn;
