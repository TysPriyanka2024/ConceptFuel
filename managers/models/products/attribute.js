const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  token: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
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

const Attribute = mongoose.model('Attribute', attributeSchema);

module.exports = Attribute;
