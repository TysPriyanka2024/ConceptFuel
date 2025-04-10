const mongoose = require('mongoose')

const vehicleStatsSchema = new mongoose.Schema({
    vehicle:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vehicle',
    },
    order_id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
    },
    fuel_capacity:{
        type: Number,
        required: true,
        default: 0.00,
        set: function(value) {
        return parseFloat(value).toFixed(2);
        }
    },
    fuel_dispensed:{
        type: Number,
        required: true,
        default: 0.00,
        set: function(value) {
        return parseFloat(value).toFixed(2);
        }
    },
    fuel_available:{
        type: Number,
        required: true,
        default: 0.00,
        set: function(value) {
        return parseFloat(value).toFixed(2);
        }
    },
    dispensed_datetime:{
        type: Date,
        default: Date.now  
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})  

const VehicleStats = mongoose.model('VehicleStats', vehicleStatsSchema)
module.exports = VehicleStats;