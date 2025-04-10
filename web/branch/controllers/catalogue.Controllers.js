const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
  
} = require('../../../managers/notify');
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
    list : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }
        console.log("Current Branch",user.userId);
        const products = await models.ProductModel.Product.find({
          'branch_status.branch_id': user.userId,
        }).populate('category') 
        .populate('sub_category')
        .populate('branch_status.branch_id');
        
        console.log("Master Products Retrevied Successfully")
        const productCount = products.length;
  
        const error = "Main Products Catalogue";

        res.render('branch/catalogue/product/lists', { user,products, productCount, error });
            
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

    getSubcategories : async ( req, res ) =>{
        try {
            const categoryId = req.query.category_id;
            const subcategories = await models.ProductModel.SubCategory.find({ parent_id: categoryId });
            res.json(subcategories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

  // Add Category List
    getAdd : async (req, res) => {
        try {
            const categories = await models.ProductModel.Category.find({});
            const subcategories = await models.ProductModel.SubCategory.find({});
            const branch = await models.BranchModel.Branch.find({});
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
            error = `Add New Product`
            res.render('admin/products/add', { user, branch,categories, subcategories, error});
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

  // Update Status
    updateStatus : async (req, res) => {
      try {
        const user = req.user;
        console.log("Current Branch", user.userId);
    
        const productId = req.body.productId;
    
        const product = await models.ProductModel.Product.findOne({
          '_id': productId,
          'branch_status.branch_id': user.userId,
        }).populate('branch_status.branch_id')
          .populate('category', 'name')  // Populates the category field with name only
          .populate('sub_category', 'name');
    
        if (!product) {
          console.log('Product not found for the given branch ID');
          return res.redirect('back');
        }
    
        const branchStatusForCurrentBranch = product.branch_status.find(branchStatus => branchStatus.branch_id.equals(user.userId));
    
        if (!branchStatusForCurrentBranch) {
          console.log('No branch status found for the product with matching branch ID');
          return res.redirect('back');
        }
    
        const branchStatusId = branchStatusForCurrentBranch._id;
        const currentStatus = branchStatusForCurrentBranch.status;
        const newStatus = !currentStatus;
    
        console.log('Branch Status ID:', branchStatusId);
        console.log('New Status:', newStatus);
    
        // Update the status of branch_status
        branchStatusForCurrentBranch.status = newStatus;
        
        if (newStatus == true) {

          console.log("newStatus is ", newStatus)
          const existingBranchProduct = await models.BranchModel.BranchProduct.findOne({
            'branch': user.userId,
            'main': product.id,
          });
        
          console.log(user.userId)
          if (!existingBranchProduct) {
            console.log("It enter in Existing")
            const branchProduct = new models.BranchModel.BranchProduct({
              branch: user.userId, // This should now be correctly saved
              main: product._id,
              token: uuidv4(),
              name: product.name,
              hsn: product.hsn,
              description: product.description,
              price: product.price,
              image: product.image,
              tax: product.tax,
              tax_type: product.tax_type,
              discount: product.discount,
              discount_type: product.discount_type,
              category: product.category.name,
              sub_category: product.sub_category.name,
              available_time_starts: product.available_time_starts,
              available_time_ends: product.available_time_ends,
              is_selling: true
            });
        
            await branchProduct.save();
            console.log(branchProduct);
            console.log('New branch product replicated and status set to true');

          }
          
          product.status = newStatus;
          existingBranchProduct.is_selling = !existingBranchProduct.is_selling;

          await existingBranchProduct.save();
          await product.save();
          return res.redirect('back');
        }else{
          const existingBranchProduct = await models.BranchModel.BranchProduct.findOne({
            'branch': user.userId,
            'main': product.id,
          });
  
          console.log("Catalogue Product status updated:", newStatus);
  
          const currentBranchStatus = existingBranchProduct.is_selling;
          const newBranchStatus = !currentBranchStatus;
          existingBranchProduct.is_selling = !existingBranchProduct.is_selling;
  
          
          console.log("Product status updated:", existingBranchProduct.is_selling);
          await product.save();
          await existingBranchProduct.save();
          return res.redirect('back');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).send('Error updating status');
      }
    },
}

