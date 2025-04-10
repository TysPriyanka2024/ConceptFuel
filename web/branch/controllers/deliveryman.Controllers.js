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
            const deliveryman = await models.UserModel.DeliveryMan.find({});
            const deliverymanCount = deliveryman.length;
            res.render('admin/deliveryman/list', { Title: "Delivery Man list", user, deliverymanCount, deliveryman , error: "DeliveryMan List" })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },


  // Add Category List
    getAdd : async (req, res) => {
        try{
            const user = req.user;
            const branch = await models.BranchModel.Branch.find({});
            const deliveryman = await models.UserModel.DeliveryMan.find({});
            if (!user) {
                return res.redirect('/branch/auth/login');
              }
    
            res.render("admin/deliveryman/add",{ Title: "Delivery Man Registeration",user, branch, deliveryman , error: "Register a Deliveryman" });
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

  // Add Category List
    postAdd: async (req, res) => {
        try {
            const { fname, lname, email, phone, branch, identity_type, identity_number, password } = req.body;
            const id_image = req.files['id_image'] ? req.files['id_image'][0].filename : null;
            const deliveryman_image = req.files['deliveryman_image'] ? req.files['deliveryman_image'][0].filename : null;

            if (!fname || !lname || !phone || !email || !password || !branch || !identity_type || !identity_number  || !id_image || !deliveryman_image) {
                throw new Error('Required fields are missing.');
            }

            const deliveryManData = {
                fname,
                lname,
                phone,
                email,
                password,
                id_image,
                branch,
                identity_type,
                identity_number,
                deliveryman_image
            };

            const deliveryMan = new models.UserModel.DeliveryMan(deliveryManData);
            await deliveryMan.save();
            console.log("Deliveryman Added successfully");
            res.redirect('/admin/deliveryman/list');
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },


  // Update Status
    updateStatus : async (req, res) => {
        try {
            const deliveryManId = req.body.deliveryManId;
            console.log(deliveryManId)
            // Find the branch in the database by ID
            const deliveryMan = await models.UserModel.DeliveryMan.findById(deliveryManId);
        
            if (!deliveryMan) {
                // Branch not found in the database
                return res.status(404).send('deliveryMan not found');
            }
        
            // Toggle the status (true to false or false to true) and save the updated branch
            deliveryMan.is_active = !deliveryMan.is_active;
            await deliveryMan.save();
            
            console.log('Database value updated successfully');
            res.json({ is_active: deliveryMan.is_active }); // Respond with the updated status
        } catch (err) {
          console.error('Error updating database value: ', err);
            res.status(500).send('Error updating database value');
        }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
        try {
            const deliverymanId = req.params.deliverymanId;
            const user = req.user;
            const branch = await models.BranchModel.Branch.find({});
        
            if (!user) {
              return res.redirect('/branch/auth/login');
            }
            console.log("Fetching Delivery Man with ID:", deliverymanId);
        
            // Find the deliveryman in the database by ID
            const deliveryman = await models.UserModel.DeliveryMan.findById(deliverymanId);
        
            if (!deliveryman) {
              // Delivery Man not found in the database
              throw new Error('Delivery Man not found.');
            }
        
            // Send the deliveryman details to the client for updating
            res.render('admin/deliveryman/update', { Title: "Delivery Man Update",user, branch, deliveryman , error:"Update the deliveryMan" }); // Assuming you are using a template engine like EJS
          } catch (err) {
            console.log("There is an issue while fetching the Delivery Man for updating.");
            console.log(err.message);
            res.status(404).send(err.message);
          }
    },

  // Update Category
    postUpdate :  async (req, res) => {
        try {
            const deliverymanId = req.params.deliveryManId;
            console.log("Updating Delivery Man with ID:", deliverymanId);
        
            const { fname, lname, email, phone, branch, identity_type, identity_number, password } = req.body;
        
            // Find the Delivery Man in the database by ID
            const deliveryman = await models.UserModel.DeliveryMan.findById(deliverymanId);
        
            if (!deliveryman) {
              // Delivery Man not found in the database
              throw new Error('Delivery Man not found.');
            }
        
            // Check if 'id_image' field is found in the request
            if (req.files && req.files['id_image']) {
              if (deliveryman.id_image) {
                ImgServices.deleteImageFile(deliveryman.id_image);
              }
              deliveryman.id_image = req.files['id_image'][0].filename;
            }
        
            // Check if 'banner_image' field is found in the request
            if (req.files && req.files['deliveryman_image']) {
              if (deliveryman.deliveryman_image) {
                ImgServices.deleteImageFile(deliveryman.deliveryman_image);
              }
              deliveryman.deliveryman_image = req.files['deliveryman_image'][0].filename;
            }
        
            deliveryman.fname = fname;
            deliveryman.lname = lname;
            deliveryman.phone = phone;
            deliveryman.email = email;
            deliveryman.branch = branch;
            deliveryman.identity_type= identity_type;
            deliveryman.identity_number= identity_number ;
            deliveryman.password = password;
            // deliveryman.id_image = id_image;
            // deliveryman.deliveryman_image= deliveryman_image ;
        
            // Save the updated Delivery Man to the database
            await deliveryman.save();
            console.log("Delivery Man updated successfully");
        
            res.redirect('/admin/deliveryman/list?success="Delivery Man Updated Successfully"');
          } catch (err) {
            console.log("There is an issue while updating the Delivery Man details.");
            console.log(err.message);
            res.status(400).send(err.message);
          }
    },

  // Delete Category
  delete : async (req, res) => {
    try {
      const deliveryManId = req.params.deliveryManId;
      console.log("Deleting branch with ID:", deliveryManId);
    
      // Find and delete the product from the database
      const deletedDeliveryMan = await models.UserModel.DeliveryMan.findOneAndDelete({ _id: deliveryManId });
  
      if (!deletedDeliveryMan) {
        // product not found in the database
        throw new Error(`${deletedDeliveryMan} not found.`);
      }
  
      if (deletedDeliveryMan.id_image) {
        ImgServices.deleteImageFile(deletedDeliveryMan.id_image);
        console.log("Deleted ID image of deliveryman File", deletedDeliveryMan.id_image );
      }
      
      if (deletedDeliveryMan.deliveryman_image) {
        ImgServices.deleteImageFile(deletedDeliveryMan.deliveryman_image);
        console.log("Deleted ID image of deliveryman File", deletedDeliveryMan.deliveryman_image );
      }

      console.log(`${deletedDeliveryMan.name} deleted successfully`);
  
      res.status(200).json({ message: `${deletedDeliveryMan.name} deleted successfully` });
    } catch (err) {
      console.log(`There is an issue while deleting`);
      console.log(err.message);
      res.status(400).send(err.message);
    }
  }
}





// Import

