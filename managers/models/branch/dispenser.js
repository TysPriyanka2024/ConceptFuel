const mongoose = require('mongoose')

const dispensedSchema = new mongoose.Schema({
    vehicle_id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vehicle',
    },    
    liters : {
        type: String,
        required: true,
    },
    price : {
        type: String,
        required: true,
    },
    amount : {
        type: String,
        required: true,
    },
    datetime : {
        type: String,
        required: true,
    },
    created_date:{
        type: Date,
        default: Date.now  
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
})  

const Dispensed = mongoose.model('Dispensed', dispensedSchema)
module.exports = Dispensed;