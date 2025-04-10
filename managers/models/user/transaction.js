const mongoose = require('mongoose');



// Define user schema
const transactionSchema = new mongoose.Schema({
    transaction_id:{
        type: String,
        required: true
    },
    wallet_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order_id:{
        type : String,
        required: false
    },
    credited : {
        type: Number,
        required: false,
        default: 0.0,
        set: function(value) {
            return parseFloat(value).toFixed(2);
        }
    },
    debited : {
        type: Number,
        required: true,
        default: 0.0,
        set: function(value) {
            return parseFloat(value).toFixed(2);
        }
    },
    available : {
        type: Number,
        required: true,
        default : 0.0,
        set: function(value) {
            return parseFloat(value).toFixed(2);
        }
    },
    status : {
        type : Boolean,
        default : true
    },
    created_date: {
        type:Date,
        default: Date.now
    },
    updated_date: {
        type:Date,
        default: Date.now
    }
  });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
