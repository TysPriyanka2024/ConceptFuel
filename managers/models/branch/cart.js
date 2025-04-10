const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    branch_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    discount : {
      type: Number,
      required: true,
      default: 0.00,
      set: function(value) {
        return parseFloat(value).toFixed(2);
      }
    },
    product_items : [{ 
      product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BranchProduct',
      },
      quantity : {
          type: Number,
          required: true,
          default: 0.00,
          set: function(value) {
            return parseFloat(value).toFixed(2);
        }
      },
      price : {
          type: Number,
          required: true,
          default: 0.00,
          set: function(value) {
            return parseFloat(value).toFixed(2);
          }
      }
    }],
    created_date : {
      type : Date,
      default : Date.now
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;