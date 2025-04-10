const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required : true
  },
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
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

const District = mongoose.model('District', districtSchema);

module.exports = District;
