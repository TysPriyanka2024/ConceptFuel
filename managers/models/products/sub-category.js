const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
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

const Sub_Category = mongoose.model('Sub_Category', subcategorySchema);

module.exports = Sub_Category;