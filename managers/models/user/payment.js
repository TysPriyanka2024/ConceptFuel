const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount : {
        type: Number,
        required: true,
        default: 0.00,
        set: function(value) {
            return parseFloat(value).toFixed(2);
        }
    },
    payment_id : {
        type: String,
        required: true,
    },
    payment_type : {
        type: String,
        required: true,
    },
    status : {
        type: String,
        default: true,
    },
    date : {
        type : String,
        required: true,
    },
    created_date:{
        type: Date,
        default: Date.now,
    },
    updated_date: {
        type:Date,
        default: Date.now
    }
})

const Payment = mongoose.model('payment', paymentSchema)
   

module.exports = Payment;
