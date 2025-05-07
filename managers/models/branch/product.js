const mongoose = require('mongoose');
const Branch = require('./profile.js')

const productSchema = new mongoose.Schema({
  branch:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
  },
  main :{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  image: {
    type: String,
    required: true,
  },
  token:{
    type: String,
    required:true
  },
  name:{
    type: String,
    required:true
  },
  description:{
    type: String,
    required:true
  },
  hsn:{
    type: String,
    default:"000"
  },
  price:{
    type: Number,
    required: true,
    default: 0.00,
    set: function(value) {
      return parseFloat(value).toFixed(2);
    }
  },
  tax:{
    type: Number,
    required: true,
    default: 0.00,
  },
  tax_type: {
    type: String,
    required: true,
    default: 'percent',
  },
  discount: {
    type: Number,
    required: true,
    default: 0.00,
  },
  discount_type: {
    type: String,
    required: true,
    default: 'percent',
  },  
  discounted_price: {
    type: Number, // Store the discounted price
  },
  category: {
    type: String,
    required: true,
  },
  sub_category: {
    type: String,
    required: true,
  },
  available_time_starts: {
    type: String,
    required:true
  },
  available_time_ends: {
    type: String,
    required:true
  },
  created_at: {
      type: Date,
      default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  attribute: {
    type: String,
  },
  is_selling: {
    type:Boolean,
    default:false
  },
  branch_price: {
    type: Number,
    required: false,
    set: function(value) {
      return parseFloat(value).toFixed(2);
    },
    default: "0.00"
  }
});


const Product = mongoose.model('BranchProduct', productSchema);

module.exports = Product;