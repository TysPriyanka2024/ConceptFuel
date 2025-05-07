const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "---",
  },
  price: {
    type: String,
    default: "0.00",
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

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
