const mongoose = require('mongoose');



// Define user schema
const WalletSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_credit : {
        type: Number,
        required: true,
        default: 100000.00,
        set: function(value) {
        return parseFloat(value).toFixed(2);
        }
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

const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;
