const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    default: "---",
  },
  district_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
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

const City = mongoose.model('City', citySchema);

module.exports = City;
