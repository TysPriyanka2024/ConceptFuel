const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    address_type: {
        type: String,
        required: true,
    },
    address_1: {
        type: String,
        required: true,
    },
    address_2: {
        type: String,
    },
    area: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    primary : {
        type : Boolean,
        required : true,
        default: false
    },
    created_date:{
        type: Date,
        default: Date.now
    },
    updated_date:{
        type: Date,
        default: Date.now
    }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
