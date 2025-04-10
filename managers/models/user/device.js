const mongoose = require('mongoose');



// Define user schema
const deviceSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fcm_token:{
        type: String,
        required: true
    },
    name : {
        type : String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    version : {
        type :String,
        required: true
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

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
