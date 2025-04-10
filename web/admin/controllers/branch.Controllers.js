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
  // Get Product List
    list : async (req, res) => {
        try {
            const branch = await models.BranchModel.Branch.find({});
            const branchCount = branch.length;
            const user = req.user;
        
            if (!user && !user.usertype === "Admin") {
              res.redirect('/admin/auth/login');
            }

            const error = `Branch list`;
            res.render('admin/branch/lists', { Title: "All Branches",user, branch, branchCount, error});
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

    listBranchProducts : async (req, res) => {
      try {
          const branchProducts = await models.BranchModel.BranchProduct.find({}).populate('branch');
          const branchProductCount = branchProducts.length;
          const user = req.user;
      
          if (!user && !user.usertype === "Admin") {
            res.redirect('/admin/auth/login');
          }

          const error = `Branch Product list`;
          res.render('admin/branch/branch_price', { Title: "All Branches Products", user, branchProducts, branchProductCount, error});
        } catch (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
  },

  // Add Category List
    getAdd : async (req, res) => {
        try {
            const user = req.user;
            const states = await models.SettingModel.State.find({});

            if (!user && !user.usertype === "Admin") {
              res.redirect('/admin/auth/login');
            }
            const error = `Add new Branch`
            res.render('admin/branch/add', { Title: "Add new Branch", user,states,error});
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

  // Add Category List
    postAdd: async (req, res) => {
        const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;
        const imgData = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}`

        try {
            console.log("I am here")
            const { name, phone, email, password, password2, image, address1, address2, area, district, pincode, city, state, country,  account_holder_name ,bank_name, account_no, ifsc_code, branch_name, vehicle_number, deliveryman,gst_no, vehicle_phone_number , vehicle_email , vehicle_password} = req.body;
        
            // Check if passwords match
            if (password !== password2) {
                throw new Error('Passwords do not match.');
            }
        
            if (!name || !imageFilename) {
                throw new Error('Required fields are missing.');
            }
        
            const branchData = {
              token: uuidv4(),
              name,
              phone,
              email,
              password: await bcrypt.hash(password, 10),
              image: imgData,
              address1,
              address2,
              area,
              district,
              pincode,
              city, // Capitalized first letter
              state,
              country,
              gst_no
            };
            
            // Check if the phone number exists in the database
            // const existingBranchByPhone = await models.BranchModel.Branch.findOne({ phone: branchData.phone });
            // if (existingBranchByPhone) {
            // console.log('Phone number is already used');
            // return res.redirect('/admin/branch/add')
            // }
            // console.log('Phone number succeeded');
        
            // Check if the email already exists in the database
            // const existingUserByEmail = await models.BranchModel.Branch.findOne({ email: branchData.email });
            // if (existingUserByEmail) {
            // console.log('Email is already used');
            // return res.redirect('/admin/branch/add')
            // }
            // console.log('Email succeeded');
        
        
            // Create a new user if all checks pass
        
            console.log('All Check Passed');
            const newBranch = new models.BranchModel.Branch(branchData); 
            console.log(newBranch._id);
            
            const branchProducts = [{
                branch_id : newBranch._id,
                status : false,
            }];

            await models.ProductModel.Product.updateMany(
              {},
              {
                  $addToSet: {
                      branch_status: { $each: branchProducts },
                  },
              }
            );          

            console.log(branchProducts)
        
            await newBranch.save();

            const vehicleData = {
              branch_id : newBranch._id,
              vehicle_number,
              deliveryman_id : deliveryman,
              phone : vehicle_phone_number,
              email : vehicle_email,
              password : await bcrypt.hash(vehicle_password, 10)
            }

            const newVehicle = new models.BranchModel.Vehicle(vehicleData);
            await newVehicle.save();

            const bankData = {
              user_id : newBranch._id,
              account_holder_name,
              account_no,
              branch :branch_name,
              ifsc_code,
              bank_name,
            }

            const newBranchBank = new models.BranchModel.Bank(bankData); 

            await newBranchBank.save();
      
            console.log("Branch Added successfully");
            // Update branch status for all products

            res.redirect('/admin/branch/all');
        } catch (err) {
            // Delete the image file if an error occurs
            console.log("There is an issue please check once again");
            console.log(err.message);
            res.status(400).send(err.message);
        }
    },

  // Update Status
    updateStatus : async (req, res) => {
        try {
            const branchId = req.body.branchId;
            console.log(branchId)
            // Find the branch in the database by ID
            const branch = await models.BranchModel.Branch.findById(branchId);
        
            if (!branch) {
                // Branch not found in the database
                return res.status(404).send('Branch not found');
            }
        
            // Toggle the status (true to false or false to true) and save the updated branch
            branch.status = !branch.status;
            await branch.save();
            
            console.log('Database value updated successfully');
            res.json({ status: branch.status }); // Respond with the updated status
        } catch (err) {
          console.error('Error updating database value: ', err);
            res.status(500).send('Error updating database value');
        }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
        try {
            const branchId = req.params.branchId;
            const user = req.user;

            if (!user && !user.usertype === "Admin") {
              res.redirect('/admin/auth/login');
            }
            
            console.log("Fetching branch with ID:", branchId);
        
            // Find the branch in the database by ID
            const states = await models.SettingModel.State.find({});
            const branch = await models.BranchModel.Branch.findById(branchId);
            const bank = await models.BranchModel.Bank.findOne({user_id : branchId});

            if (!branch) {
              // branch not found in the database
              throw new Error('Branch not found.');
            }
        
            // Send the category details to the client for updating
            const error = " Update Branch";
            res.render('admin/branch/update', { branch, user, states ,error, bank }); // Assuming you are using a template engine like EJS
          } catch (err) {
            console.log("There is an issue while fetching the branch for updating.");
            console.log(err.message);
            res.status(404).send(err.message);
          }
    },

  // Update Category
    postUpdate :  async (req, res) => {
        try {
            const branchId = req.params.branchId;
            console.log("Updating branch with ID:", branchId);
        
            const { name, phone, email, address1 , address2, state ,pincode,area , city, district, country, account_holder_name ,bank_name, account_no, ifsc_code, branch_name, gst_no} = req.body;
        
            // Find the branch in the database by ID
            const branch = await models.BranchModel.Branch.findById(branchId);
            const bank = await models.BranchModel.Bank.findOne({user_id : branchId});

            if (!branch) {
              // branch not found in the database
              throw new Error('Branch not found.');
            }

            if (req.files && req.files['image']) {
              if (branch.image) {
                ImgServices.deleteImageFile(branch.image);
              }
              branch.image = `${req.body.maincategory}/${req.body.subcategory}/${req.files['image'][0].filename}`;
            }
        
    
        
            branch.name = name;
            branch.phone = phone;
            branch.email = email;
            branch.address1 = address1;
            branch.address2 = address2;
            branch.area = area;
            branch.city = city;
            branch.district = district;
            branch.pincode = pincode;
            branch.state = state;
            branch.country = country;
            branch.gst_no = gst_no;

            bank.account_holder_name = account_holder_name;
            bank.bank_name = bank_name;
            bank.ifsc_code = ifsc_code;
            bank.account_no = account_no;
            bank.branch =  branch_name;

            // Save the updated branch to the database
            await branch.save();
            console.log(branch)
            await bank.save();
            console.log("Branch updated successfully");
        
            res.redirect('/admin/branch/all?success="Branch Updated Successfully"');
          } catch (err) {
            console.log("There is an issue while updating the Branch.");
            console.log(err.message);
            res.status(400).send(err.message);
          }
    },

    // Delete Category
    delete : async (req, res) => {
      try {
        const branchId = req.params.branchId;
        console.log("Deleting branch with ID:", branchId);
      
        // Find and delete the product from the database
        const deletedBranch = await models.BranchModel.Branch.findOne({ _id: branchId });
    
        if (!deletedBranch) {
          // product not found in the database
          throw new Error('${} not found.');
        }
        
        deletedBranch.status = false;

        await deletedBranch.save();
    
        res.status(200).json({ message: `${deletedBranch.name} deleted successfully` });
      } catch (err) {
        console.log(`There is an issue while deleting the ${deletedBranch.name}.`);
        console.log(err.message);
        res.status(400).send(err.message);
      }
    },

    updateBranchProductStatus : async (req, res) => {
      try {
        const user = req.user;
    
        const productId = req.body.productId;
        const branchId = req.body.branchId;
    
        const product = await models.BranchModel.BranchProduct.findOne({
          _id : productId,
          branch : branchId
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

    updateBranchProductPrice : async (req, res) => {
      try {
          const productId = req.body.productId;
          const updated_price = req.body.updated_price;
          // Find the branch in the database by ID
          const product = await models.BranchModel.BranchProduct.findById(productId);
      
          if (!product) {
              // Branch not found in the database
              return res.status(404).send('User not found');
          }
      
          // Toggle the status (true to false or false to true) and save the updated branch
          product.branch_price = updated_price;
          await product.save();
          
          console.log(`Database value updated successfully`);
          res.json({ status: updated_price }); // Respond with the updated status
      } catch (err) {
        console.error('Error updating database value: ', err);
          res.status(500).send('Error updating database value');
      }
  },
}






// Import

