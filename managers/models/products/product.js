const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  token: {
    type: String,
    required:true
  },
  name: {
    type: String,
    required:true
  },
  image:{
    type: String,
    required:true
  },
  description: {
    type: String,
    required:true
  },
  hsn: {
    type: String,
    default:"000"
  },
  price: {
    type: Number,
    required: true,
    default: 0.00,
    set: function(value) {
      return parseFloat(value).toFixed(2);
    }
  },
  branch_price: {
    type: Number,
    required: true,
    default: 0.00,
    set: function(value) {
      return parseFloat(value).toFixed(2);
    }
  },
  tax: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  sub_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sub_Category',
    required: true,
  },
  addons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AddOn', // Reference the Addon model
  }],
  available_time_starts: {
    type: String,
    required:true
  },
  available_time_ends: {
    type: String,
    required:true
  },
  status: {
    type: Boolean,
    default: true,
  },
    branch_status : [
      {
        branch_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Branch', 
          required: false,
        },
        status: {
          type: Boolean,
          default: false,
        },
      },
    ],
  created_at: {
      type: Date,
      default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
});


// Define a virtual property for discounted_price
productSchema.virtual('discounted_price_virtual').get(function () {
  return calculateDiscountedPrice(this.price, this.discount, this.discount_type);
});

// Calculate the discounted price
function calculateDiscountedPrice(originalPrice, discount, discountType) {
  if (discountType === 'percentage') {
    const discountAmount = (discount / 100) * originalPrice;
    return originalPrice - discountAmount;
  } else if (discountType === 'amount') {
    return originalPrice - discount;
  } else {
    throw new Error('Invalid discount type');
  }
}

// Use pre('save') middleware to calculate and store the discounted_price before saving
productSchema.pre('save', function (next) {
  this.discounted_price = calculateDiscountedPrice(this.price, this.discount, this.discount_type);
  next();
});

const Product = mongoose.model('MasterProduct', productSchema);

module.exports = Product;