const mongoose = require('mongoose');

const tokenSchema =  mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token : {
        type: String,
        required: true,
    },
    created_date:{
        type: Date,
        default: Date.now,
        index : {expires : 604800}
    },
}, {timeStamp: true}
)

const RevokedTokens = mongoose.model('Tokens', tokenSchema)
   

module.exports = RevokedTokens;
