const mongoose = require('mongoose');

const flashNotifyScheme = new mongoose.Schema({
    image : {
        type : String,
        default : "/defaults/truck.png"
    },
    title : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    },
    created_date : {
      type : Date,
      default : Date.now
    },
    updated_date : {
      type : Date,
      default : Date.now
    }
});

const FlashNotify = mongoose.model('FlashNotify', flashNotifyScheme);

module.exports = FlashNotify;