const mongoose = require('mongoose');

const notifyScheme = new mongoose.Schema({
    delivery_id : {
        type : String,
        required : true
    },
    order_id : {
        type : String,
        required : false
    },
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
    link : {
        type : String,
        default : "---"
    },
    status : {
        type : Boolean,
        default: false
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

const Notify = mongoose.model('Notify', notifyScheme);

module.exports = Notify;