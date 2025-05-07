const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require("path")
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
const s3Client = require('../../../managers/utils/s3Delete')

// This would be your token blacklist storage
const tokenBlacklist = new Set();




module.exports = {

  // Get Category List
    getCategory : async (req, res) => {
        try {
            console.log("I am here")
            const categories = await models.ProductModel.Category.find({});
            const categoryCount = categories.length;
            const user = req.user;
        
            if (!user) {
                return res.redirect('/admin/auth/login?error = "User Not Found Please Login"');
            }
            res.render('admin/categories/category', { Title: "All Category",user, categories, categoryCount, error: "List of Category"});
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }        
    },

  // Add Category List
    addCategory : async (req, res) => {
      try {
        const user = req.user;
  
        res.render('admin/categories/add', { Title: "Add new Category",user, error: "Add New Category" });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

  // Add Category List
    postCategory : async (req, res) => {
      try {
        const user = req.user;
        const { name } = req.body;
        const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;

        if (!name || !imageFilename ) {
          throw new Error('Required fields are missing.');
        }
    
        const imgData = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}`
        const categoryData = {
          token: uuidv4(),
          name,
          image: imgData,
        };
    
        const newCategory = new models.ProductModel.Category(categoryData);
        await newCategory.save();
    
        console.log("Category Added successfully");
        res.redirect('/admin/category/all');
        res.render('admin/categories/add', { Title: "Add new Category", user, error: "Add New Category" });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

  // Update Status
    updateStatus : async (req, res) => {
      const categoryId = req.body.categoryId;
      console.log(categoryId)
      try {
        // Find the category in the database by ID
        const category = await models.ProductModel.Category.findById(categoryId);

        if (!category) {
          // Category not found in the database
          return res.status(404).send('Category not found');
        }

        // Toggle the status (true to false or false to true) and save the updated category
        category.status = !category.status;
        await category.save();
        
        console.log('Database value updated successfully');
        res.json({ status: category.status }); // Respond with the updated status
      } catch (err) {
        console.error('Error updating database value: ', err);
        res.status(500).send('Error updating database value');
      }
    },

  // Edit Category
    getEditCategory :  async (req, res) => {
      try {
        const categoryId = req.params.categoryId;
        const user = req.user;
    
        if (!user) {
          return res.redirect('/admin/auth/login?error = "User Not Found Please Login"');
        }
        console.log("Fetching category with ID:", categoryId);
    
        // Find the category in the database by ID
        const category = await models.ProductModel.Category.findById(categoryId);
    
        if (!category) {
          // Category not found in the database
          throw new Error('Category not found.');
        }
    
        // Send the category details to the client for updating
        res.render('admin/categories/update-category', { category, user, error: "Update Category"}); // Assuming you are using a template engine like EJS
      } catch (err) {
        console.log("There is an issue while fetching the category for updating.");
        console.log(err.message);
        res.status(404).send(err.message);
      }
    },

  // Update Category
    updateCategory :  async (req, res) => {
      try {
        const categoryId = req.params.categoryId;
        console.log("Updating category with ID:", categoryId);
    
        // Find the category in the database by ID
        const category = await models.ProductModel.Category.findById(categoryId);
    
        if (!category) {
          // Category not found in the database
          throw new Error('Category not found.');
        }
    
        // Update the fields if they are provided in the request
        if (req.body.name) {
          category.name = req.body.name;
        }
    
        // Check if 'image' field is found in the request
        if (req.files && req.files['image']) {
          if (category.image) {
            ImgServices.deleteImageFile(category.image);
          }
          category.image = `${req.body.maincategory}/${req.body.subcategory}/${req.files['image'][0].filename}`;
        }

    
        // Save the updated category to the database
        const updatedCategory = await category.save();
        console.log("Category updated successfully");
    
        res.redirect('/admin/category/all');
      } catch (err) {
        console.log("There is an issue while updating the category.");
        console.log(err.message);
        res.status(400).send(err.message);
      }
    },

  // Delete Category
    deleteCategory : async (req, res) => {
      try {
        const categoryId = req.params.categoryId;
        console.log("Deleting category with ID:", categoryId);
    
        // Find and delete the category from the database
        const deletedCategory = await models.ProductModel.Category.findOneAndDelete({ _id: categoryId });
    
        if (!deletedCategory) {
          // Category not found in the database
          throw new Error('Category not found.');
        }
    
        // Delete the image files associated with the category (if applicable)
        if (deletedCategory.image) {
          ImgServices.deleteImageFile(deletedCategory.image);
        }
    
        if (deletedCategory.banner_image) {
          ImgServices.deleteImageFile(deletedCategory.banner_image);
        }
    
        console.log("Category deleted successfully");
    
        res.status(200).json({ message: 'Category deleted successfully' });
      } catch (err) {
        console.log("There is an issue while deleting the category.");
        console.log(err.message);
        res.status(400).send(err.message);
      }
    }
}

