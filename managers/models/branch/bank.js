const mongoose = require('mongoose');
// bank data
// Define user schema
    const bankSchema = new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        account_holder_name:{
            type: String,
            required: true
        },
        account_no:{
            type: String,
            required: true
        },
        bank_name:{
            type: String,
            required: true
        },
        ifsc_code: {
            type:String,
            required: true
        },
        branch: {
            type:String,
            required: true
        },
        created_date: {
            type:Date,
            default: Date.now
        },
        updated_date: {
            type:Date,
            default: Date.now
        },
    }); 

const Bank = mongoose.model('Bank', bankSchema);
module.exports = Bank
