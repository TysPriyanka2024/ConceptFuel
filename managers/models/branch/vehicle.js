const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    branch_id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Branch',
    },
    imei_number : {
        type: String,
        default : "0",
        required: true,
    },
    vehicle_number:{
        type: String,
        required: true,
    },
    deliveryman_id :  { 
        type: String,
        required: true,
        maxLength: 200,
        default : "Sumit Singh",
    },
    email:  { 
        type: String,
        required: true,
        maxLength: 200,
        default : "test-vehical@gmail.com",
    },
    password:  { 
        type: String,
        required: false,
        maxLength: 200
    },
    phone:{
        type: String,
        default: "1234567890",
    },
    is_available:{
        type:Boolean,
        default:false
    },
    is_connected :{
        type : Boolean,
        default : false,
    },
    date_added:{
        type: Date,
        default: Date.now  
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})  

const Vehicle = mongoose.model('Vehicle', vehicleSchema)
module.exports = Vehicle;