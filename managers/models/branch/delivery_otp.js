const mongoose = require('mongoose');

const deliveryOtpSchema =  mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    },
    otp : {
        type: String,
        required: true,
    },
    created_date:{
        type: Date,
        default: Date.now,
    },
})

const DeliveryOtp = mongoose.model('Delivery-Otp', deliveryOtpSchema)
   

module.exports = DeliveryOtp;
