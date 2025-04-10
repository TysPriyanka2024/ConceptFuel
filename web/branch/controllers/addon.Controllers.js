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

  // Get Addon List
    getList : async (req, res) => {
      try {
        const addon = await models.ProductModel.AddOn.find({});
        const addonLength = addon.length;
        const user = req.user;
    
        if (!user) {
          return res.redirect("/admin/auth/login?error = 'User Not Found Please Login'");
        }
    
        res.render('admin/add_on/list', {
          error : "AddOn Lists ",
          Title: "All Add-On",
          user,
          addon: addon,
          addonCount: addonLength,
        });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

  // Add Addon List
    getAdd : async (req, res) => {
      try {
        const addon = await models.ProductModel.AddOn.find({});
        const user = req.user;
    
        if (!user) {
          return res.redirect('/admin/auth/login?error = "User Not Found Please Login"');
        }
        const error = "Add New Add-On"
        res.render('admin/add_on/add', { Title: "Add new AddOn",user, addon , error });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

  // Add Category List
    postAdd : async (req, res) => {
      try {
        console.log("I am here")
        console.log(req.body.name)
        const { name, price } = req.body;
    
        if (!name || !price ) {
          throw new Error('Required fields are missing.');
        }
    
        const addonData = {
          token: uuidv4(),
          name,
          price,
        };
    
        const newAddOn = new models.ProductModel.AddOn(addonData);
        await newAddOn.save();
        console.log("Sub addon Added successfully");
        res.redirect('/admin/addon/lists?success="New Add-Ons Added Successfully"');
      } catch (err) {
        console.log("There is an issue please check once again");
        console.log(err.message);
        res.status(400).send(err.message);
      }
    },

  // Update Status
    getUpdate : async (req, res) => {
      try {
        const addonId = req.params.addonId;
        const user = req.user;
    
        if (!user) {
          return res.redirect('/admin/auth/login?error = "User Not Found Please Login"');
        }
        console.log("Fetching addOn with ID:", addonId);
    
        // Find the addOn in the database by ID
        const addOn = await models.ProductModel.AddOn.findById(addonId);
    
        if (!addOn) {
          // addOn not found in the database
          throw new Error('addOn not found.');
        }
        // Send the addOn details to the client for updating
        const error =  "Update Addon";
        res.render('admin/add_on/update', { user, error, a }); // Assuming you are using a template engine like EJS
      } catch (err) {
        console.log("There is an issue while fetching the addOn for updating.");
        console.log(err.message);
        res.status(404).send(err.message);
      }
    },

  // Update Category
    postUpdate :  async (req, res) => {
      try {
        const addonId = req.params.addonId;
        console.log("Updating addon with ID:", addonId);
    
        // Find the attribute in the database by ID
        const addon = await models.ProductModel.AddOn.findById(addonId);
    
        if (!addon) {
          // addon not found in the database
          throw new Error('addon not found.');
        }
    
        // Update the fields if they are provided in the request
        if (req.body.name || req.body.price) {
          addon.name = req.body.name;
          addon.price = req.body.price;
        }
    
        // Save the updated addon to the database
        const updatedaddon = await addon.save();
        console.log("Addon updated successfully");
    
        res.redirect('/admin/addon/lists');
      } catch (err) {
        console.log("There is an issue while updating the attribute.");
        console.log(err.message);
        res.status(400).send(err.message);
      }
    },

  // Delete Category
    delete : async (req, res) => {
      try {
        const addonId = req.params.addonId;
    
        // Find and delete the -attribute in the database by ID
        const deletedAddon = await models.ProductModel.AddOn.findByIdAndDelete(addonId);
    
        if (!deletedAddon) {
          throw new Error('Addon not found.');
        }
    
        console.log("Addon Deleted successfully");
        res.status(200).send("Addon Deleted successfully");
      } catch (err) {
        console.log("There is an issue while deleting the Addon.");
        console.log(err.message);
        res.status(400).send(err.message);
      }
    }
}

