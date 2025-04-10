const mongoose = require('mongoose');

const couponScheme = new mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    coupon_code : {
        type : String,
        required : true
    },
    amount : {
        type : String,
        default : "0.00"
    },
    start_date : {
      type : Date,
      default : Date.now
    },
    end_date : {
      type : Date,
      default : Date.now
    },
    status : {
      type : Boolean,
      default : false
    },
    created_date : {
      type : Date,
      default : Date.now
    }
});

const Coupons = mongoose.model('Coupon', couponScheme);

module.exports = Coupons;