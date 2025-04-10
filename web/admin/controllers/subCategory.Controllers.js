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

  // Get Category List
    getList : async (req, res) => {
        try {
            const subCategories = await models.ProductModel.SubCategory.find().exec();
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
        
            const populatedSubCategories = await Promise.all(subCategories.map(async (subCategory) => {
              const categoryId = subCategory.parent_id;
              try {
                const category = await models.ProductModel.Category.findById(categoryId).exec();
        
                if (!category) {
                  console.log('Parent category not found for subcategory:', subCategory.name);
                  return null;
                }
        
                return {
                  subCategory,
                  categoryName: category.name,
                };
              } catch (error) {
                console.error('Error fetching parent category:', error);
                return null;
              }
            }));
        
            const validPopulatedSubCategories = populatedSubCategories.filter(item => item !== null);
        
            res.render('admin/subCategory/list', {
              Title: "All Category",
              user,
              subCategories: validPopulatedSubCategories,
              subCategoryCount: validPopulatedSubCategories.length,
              
              error : "Sub-Category Fetched Successfully"
            });
          } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
          }     
    },

  // Add Category List
    addSub : async (req, res) => {
        try {
            const category = await models.ProductModel.Category.find({});
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
            res.render('admin/subCategory/add', { Title: "Add new Sub-Category", user, category, error : "Add new Sub-Category" });
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

  // Add Category List
    postSubCategory : async (req, res) => {
        try {
            console.log("I am here")
            console.log(req.body.name)
            const { name, parent_id } = req.body;
        
            if (!name || !parent_id) {
              throw new Error('Required fields are missing.');
            }
        
            // Check if the parent_id exists in the database
            const parentCategory = await models.ProductModel.Category.findById(parent_id);
            if (!parentCategory) {
              throw new Error('Parent category not found.');
            }
        
            const subData = {
              token: uuidv4(),
              name,
              parent_id,
            };
        
            const newSubCategory = new models.ProductModel.SubCategory(subData);
            await newSubCategory.save();
            console.log("Sub Category Added successfully");
            res.redirect('/admin/category/sub-category');
          } catch (err) {
            console.log("There is an issue please check once again");
            console.log(err.message);
            
            // If the parent_id doesn't exist, delete the newly added subcategory
            if (err.message === 'Parent category not found.') {
              await newSubCategory.remove();
            }
        
            res.status(400).send(err.message);
          }
    },

  // Update Status
    updateStatus : async (req, res) => {
      const categoryId = req.body.categoryId;
      console.log(categoryId)
      try {
        // Find the category in the database by ID
        const category = await models.ProductModel.SubCategory.findById(categoryId);

        if (!category) {
          // Category not found in the database
          return res.status(404).send('SubCategory not found');
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
              return res.redirect('/admin/auth/login');
            }
            console.log("Fetching Subcategory with ID:", categoryId);
        
            // Find the category in the database by ID
            const subcategory = await models.ProductModel.SubCategory.findById(categoryId);
        
            if (!subcategory) {
              // Category not found in the database
              res.redirect('admin/category/sub-category?error=Sub-Category Not Found.')
            }
        
            // Send the category details to the client for updating
            const error = `Update ---- ${subcategory.name}`
            res.render('admin/subCategory/update', { subcategory, user, error }); // Assuming you are using a template engine like EJS
          } catch (err) {
            console.log("There is an issue while fetching the category for updating.");
            console.log(err.message);
            res.status(404).send(err.message);
          }
    },

  // Update Category
    updateSubCategory :  async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            console.log("Updating category with ID:", categoryId);
        
            // Find the category in the database by ID
            const category = await models.ProductModel.SubCategory.findById(categoryId);
        
            if (!category) {
              // Category not found in the database
              throw new Error('Category not found.');
            }
        
            // Update the fields if they are provided in the request
            if (req.body.name) {
              category.name = req.body.name;
            }
        
            // Save the updated category to the database
            const updatedCategory = await category.save();
            console.log("Category updated successfully");
        
            res.redirect('/admin/category/sub-category');
          } catch (err) {
            console.log("There is an issue while updating the category.");
            console.log(err.message);
            res.status(400).send(err.message);
          }
    },

  // Delete Category
    deleteCategory : async (req, res) => {
        try {
            const subCategoryId = req.params.subCategoryId;
        
            // Find and delete the sub-category in the database by ID
            const deletedSubCategory = await models.ProductModel.SubCategory.findByIdAndDelete(subCategoryId);

            if (!deletedSubCategory) {
              throw new Error('Sub-category not found.');
            }
        
            console.log("Sub Category Deleted successfully");
            res.status(200).send("Sub Category Deleted successfully");
        } catch (err) {
            console.log("There is an issue while deleting the sub-category.");
            console.log(err.message);
            res.status(400).send(err.message);
        }
    }
}

