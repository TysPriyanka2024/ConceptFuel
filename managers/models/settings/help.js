const mongoose = require('mongoose');

const CustomerCareSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  whatsapp: {
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

const CustomerCare = mongoose.model('CustomerCare', CustomerCareSchema);

module.exports = CustomerCare;
