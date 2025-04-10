const mongoose = require('mongoose');

const whatsappSchema = new mongoose.Schema({
  phone_number: {
    type: String,
    required : true
  },
  token: {
    type: String,
    required : true
  },
  status : {
    type : Boolean,
    required : true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: { expires: 86400 } // 24 hours
  }
});

const WhatsappData = mongoose.model('WhatsappData', whatsappSchema);

module.exports = WhatsappData;
