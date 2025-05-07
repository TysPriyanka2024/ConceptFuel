const mongoose = require('mongoose');

// Current Date
const createdDate = new Date();
const ist = createdDate.toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata',
});

const branchSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        maxlength: 255
    },
    usertype :{
        type: String,
        default:"Branch",
    },
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    phone: {
        type: String,
        required: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        maxlength: 255
    },
    password: {
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        default: "true"
    },
    image: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true,
    },
    address2: {
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
    district: {
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
    gst_no: {
        type: String,
        required: true,
        default : "29AAAAA1234B5C6",
    },
    code: {
        type: String,
        required: true,
        default : "00",
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
}, {
    timestamps: true
});



// Define the comparePassword method for the branchSchema
branchSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
};


const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
