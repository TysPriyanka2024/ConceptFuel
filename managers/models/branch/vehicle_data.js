const mongoose = require('mongoose')

const vehicleLocationSchema = new mongoose.Schema({
    vehicle_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
    },
    longitude :  { 
        type: String,
        required: true,
        default : "73.817696"
    },
    latitude :  { 
        type: String,
        required: true,
        default : "15.5382004"
    },
    maps_link : {
        type: String,
        required: true,
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

const VehicleLocation = mongoose.model('VehicleLocation', vehicleLocationSchema)
module.exports = VehicleLocation;