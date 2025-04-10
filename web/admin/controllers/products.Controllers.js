const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
  
} = require('../../../managers/notify');
const path = require('path');
const secretKey = process.env.SECRET_KEY
const {
  ImgServices
} = require('../../../managers/services');
const { generateAccessToken} = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');
const { deleteMe } = require('../../../managers/utils/s3Delete')

// This would be your token blacklist storage
const tokenBlacklist = new Set();




module.exports = {

  // Get Product List
    list : async (req, res) => {
        try {
            const product = await models.ProductModel.Product.find({});
            const productCount = product.length;
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
            const error = `Product Data`
            res.render('admin/products/list', { user, product, productCount , error});
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

  // Add Category List
    postAdd: async (req, res) => {
      const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;
      
      const imgdata = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}`
      try {
        // Collect data from the form
        const { name, hsn,description, price, tax, tax_type, discount, discount_type, branches, category, sub_category, available_time_starts, available_time_ends, status } = req.body;

        if (!imageFilename || imageFilename.length === 0) {
          throw new Error("Image file is missing");
        }
        
        console.log('Image Filename:', imageFilename);
        console.log("branches --",branches);
        const selectedBranches = branches
        ? branches.map((branchId) => ({
            branch_id: branchId,
            status: false, // You can set the status as needed
          }))
        : [];
        console.log("parsed --", selectedBranches);

        // Create a new product instance
        newProduct = new models.ProductModel.Product({
          token: uuidv4(),
          name,
          hsn,
          description,
          price,
          tax,
          tax_type,
          discount,
          discount_type,
          image: imgdata,
          category,
          sub_category,
          available_time_starts,
          available_time_ends,
          status,
          branch_status: selectedBranches,
        });

        console.log("Data stored in Status --- ", newProduct.branch_status);
        // Save the new product to the database
        const savedProduct = await newProduct.save();

        console.log('Product stored successfully');
        res.redirect('/admin/product/lists'); // Redirect to a suitable page after successful submission
      } catch (error) {
        console.error('Error adding product:', error);

        // Delete the image file if an error occurs
        if (imgdata.image && imgdata.image.length > 0) {
          const imageFilenameToDelete = imgdata.image[0].filename;
          ImgServices.deleteImageFile(imageFilenameToDelete);
          console.log(`Deleted image file: ${imageFilenameToDelete}`);
        }

        res.redirect('/admin/product/add?error=Please Check the Values Again'); // Redirect on error
      }
    },


  // Update Status
    updateStatus : async (req, res) => {
      try {
        const productId = req.body.productId;
        console.log(productId)
        // Find the product in the database by ID
        const product = await models.ProductModel.Product.findById(productId);
    
        if (!product) {
          // product not found in the database
          return res.status(404).send('product not found');
        }
    
        // Toggle the status (true to false or false to true) and save the updated product
        product.status = !product.status;
        await product.save();
        
        console.log('Database value updated successfully');
        res.json({ status: product.status }); // Respond with the updated status
      } catch (err) {
        console.error('Error updating database value: ', err);
        res.status(500).send('Error updating database value');
      }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
      try {
        const productId = req.params.id;
        const product = await models.ProductModel.Product
        .findById(productId)
        .populate('category')
        .populate('sub_category')
        .populate('branch_status.branch_id');
  
  
        const user = req.user;
        const branch = await models.BranchModel.Branch.find({status : true});
        const categories = await models.ProductModel.Category.find();
        const subCategories = await models.ProductModel.SubCategory.find();
  
  
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
  
        const error = `Update ${product.name}`

        res.render('admin/products/update_product', {
            user,
            product,
            categories,
            subCategories,
            branch,
            error
        });
    } catch (error) {
        console.error('Error fetching data for update:', error);
        res.redirect('/admin/product/lists'); // Redirect to a suitable page after error
    }
    },

  // Update Category
  postUpdate: async (req, res) => {
    try {
      const productId = req.params.productId;
      console.log("hey i am updating ");
  
      // Collect data from the form
      const { name, hsn,description, price, tax, tax_type, discount, discount_type, category, branches, sub_category, available_time_starts, available_time_ends } = req.body;
  
      console.log("branches --", branches);
  
      // Check if branches is null, and handle it accordingly
      const selectedBranches = branches
        ? branches.map((branchId) => ({
            branch_id: branchId,
            status: false, // You can set the status as needed
          }))
        : [];
  
      console.log("parsed --", selectedBranches);
  
      // Find the product by its ID
      const productToUpdate = await models.ProductModel.Product.findById(productId);
  
      if (!productToUpdate) {
        return res.status(404).send('Product not found');
      }
  
      
      if (req.files && req.files['image']) {
        if (productToUpdate.image) {
          ImgServices.deleteImageFile(productToUpdate.image);
        }
        productToUpdate.image = `${req.body.maincategory}/${req.body.subcategory}/${req.files['image'][0].filename}`;
      }
  
      // Update the product fields
      productToUpdate.name = name;
      productToUpdate.hsn = hsn;
      productToUpdate.description = description;
      productToUpdate.price = price;
      productToUpdate.tax = tax;
      productToUpdate.tax_type = tax_type;
      productToUpdate.discount = discount;
      productToUpdate.discount_type = discount_type;
      productToUpdate.category = category;
      productToUpdate.sub_category = sub_category;
      productToUpdate.available_time_starts = available_time_starts;
      productToUpdate.available_time_ends = available_time_ends;
  
      // Update branch status
      selectedBranches.forEach((branchData) => {
        const branchStatus = productToUpdate.branch_status.find((bs) => bs.branch_id == branchData.branch_id);
  
        if (branchStatus) {
          // Update the status if the branch already exists in branch_status
          branchStatus.status = branchData.status;
        } else {
          // Create a new entry if the branch doesn't exist in branch_status
          productToUpdate.branch_status.push({
            branch_id: branchData.branch_id,
            status: branchData.status,
          });
        }
      });
  
      // Save the updated product to the database
      await productToUpdate.save();
  
      res.redirect('/admin/product/lists'); // Redirect to a suitable page after a successful update
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
      const deletedProduct = await models.ProductModel.Product.findOneAndDelete({ _id: productId });
      const deletedBranchProduct  = await models.BranchModel.BranchProduct.findOneAndDelete({ main : productId});
  

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
      const product = await models.ProductModel.Product.findById(productId).populate('category').populate('sub_category').populate('branch_status.branch_id');
      const user = req.user;
      const addon = await models.ProductModel.AddOn.find({})
      const model_sent =  models
      if (!user) {
        return res.redirect('/admin/auth/login');
      }
      res.render('admin/products/detail', { user,addon,product, model_sent,error:"Product Detail"});
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  },

  updateAvailablity : async (req, res) => {
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

  updateCatalogueStatus : async (req, res) => {
    try {
      const user = req.user;
      const productId = req.body.productId;
      const branch_id = req.body.branchId;
      
      console.log(req.body)
      const product = await models.ProductModel.Product.findOne({
        '_id': productId,
        'branch_status.branch_id': branch_id,
      }).populate('branch_status.branch_id')
        .populate('category', 'name')  // Populates the category field with name only
        .populate('sub_category', 'name');
  
      if (!product) {
        console.log('Product not found for the given branch ID');
        return res.redirect('back');
      }
  
      const branchStatusForCurrentBranch = product.branch_status.find(branchStatus => branchStatus.branch_id.equals(branch_id));
  
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
          'branch': branch_id,
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
        if (existingBranchProduct !== null && existingBranchProduct !== undefined) {
          existingBranchProduct.is_selling = !existingBranchProduct.is_selling;
        } else {
            // Create a new object with is_selling set to true
            existingBranchProduct = {
                is_selling: true
            };
        }
      
        await existingBranchProduct.save();
        await product.save();
        return res.redirect('back');
      }else{
        const existingBranchProduct = await models.BranchModel.BranchProduct.findOne({
          'branch': branch_id,
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

