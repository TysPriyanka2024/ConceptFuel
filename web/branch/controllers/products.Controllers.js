const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
  
} = require('../../../managers/notify');
const path = require("path")
const secretKey = process.env.SECRET_KEY
const {
  ImgServices
} = require('../../../managers/services');
const { generateAccessToken} = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');

// This would be your token blacklist storage
const tokenBlacklist = new Set();




module.exports = {

  // Get Product List
    list: async (req, res) => {
      try {
        const user = req.user;

        const product = await models.BranchModel.BranchProduct.find({branch: user.userId});
        const productCount = product.length;
    
        if (!user) {
          return res.redirect('/branch/auth/login');
        }

        const error = "Products list"
        res.render('branch/products/list', { user, product, error, productCount });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },
  
  // Update Status
    updateStatus : async (req, res) => {
      try {
        const user = req.user;
        console.log("Current Branch", user._id);
    
        const productId = req.body.productId;
    
        const product = await models.BranchModel.BranchProduct.findOne({
          _id : productId,
          branch : user.userId
        })
    
        if (!product) {
          console.log('Product not found for the given branch ID');
          return res.redirect('back');
        }

        const currentStatus = product.is_selling;
        const newStatus = !currentStatus;
    
        console.log('New Status:', newStatus);
    
        // Update the status of branch_status
        product.is_selling = newStatus;
        
        await product.save();
        
        console.log("Product status updated:", newStatus);
    
        return res.redirect('back');
      } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).send('Error updating status');
      }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
      try {
        const productId = req.params.id;
        const product = await models.BranchModel.BranchProduct
        .findById(productId)
  
  
        const user = req.user;
  
        if (!user) {
          return res.redirect('/branch/auth/login');
        }
  
        const error = `Update ${product.name}`

        res.render('branch/products/update_product', {
            user,
            product,
            error
        });
    } catch (error) {
        console.error('Error fetching data for update:', error);
        res.redirect('/branch/product/lists'); // Redirect to a suitable page after error
    }
    },

  // Update Category
    postUpdate :  async (req, res) => {
      try {
        const productId = req.params.productId;
        console.log("hey i am updateing ")
        // Collect data from the form
        const { name, description, price, tax, tax_type, discount, discount_type, category, sub_category ,available_time_starts, available_time_ends, branch_price } = req.body;
    

         // Find the product by its ID
         const productToUpdate = await models.BranchModel.BranchProduct.findById(productId);
     
         if (!productToUpdate) {
           return res.status(404).send('Product not found');
         }
         if (req.body.image) {
          // Delete the previous image file before updating with the new one
          if (productToUpdate.image) {
            ImgServices.deleteImageFile(productToUpdate.image);
          }
          productToUpdate.image = path.basename(req.body.image);
          console.log("Image ", req.body.image)
        }

        // Update the product fields
        productToUpdate.name = name;
        productToUpdate.description = description;
        productToUpdate.price = price;
        productToUpdate.branch_price = branch_price;
        productToUpdate.tax = tax;
        productToUpdate.tax_type = tax_type;
        productToUpdate.discount = discount;
        productToUpdate.discount_type = discount_type;
        productToUpdate.category = category;
        productToUpdate.sub_category = sub_category;
        productToUpdate.available_time_starts = available_time_starts;
        productToUpdate.available_time_ends = available_time_ends;
    
        // Save the updated product to the database
        await productToUpdate.save();
    
        res.redirect('/branch/product/lists'); // Redirect to a suitable page after successful update
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
      }
    },

  // Delete Category
  delete : async (req, res) => {
    try {
      const productId = req.params.productId;
      console.log("Deleting product with ID:", productId);
  
      // Find and delete the product from the database
      const deletedProduct = await models.BranchModel.BranchProduct.findOneAndDelete({ _id: productId });
  
      if (!deletedProduct) {
        // product not found in the database
        throw new Error('product not found.');
      }
  
      if (deletedProduct.image) {
        ImgServices.deleteImageFile(deletedProduct.image);
      }

      console.log("product deleted successfully");
  
      res.status(200).json({ message: 'product deleted successfully' });
    } catch (err) {
      console.log("There is an issue while deleting the product.");
      console.log(err.message);
      res.status(400).send(err.message);
    }
  },
  getDetail : async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await models.BranchModel.BranchProduct.findById(productId).populate('category').populate('sub_category');

      const user = req.user;
      const addon = await models.BranchModel.BranchProduct.find({})
      if (!user) {
        return res.redirect('/branch/auth/login');
      }
      res.render('branch/products/detail', { user,addon, product, error:"Product Detail"});
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  }
}

