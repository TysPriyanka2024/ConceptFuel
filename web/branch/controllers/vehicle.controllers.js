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
const { FamarkCloud } = require('../middlewares');
const models = require('../../../managers/models');

// This would be your token blacklist storage
const tokenBlacklist = new Set();
const options = { day: '2-digit', month: 'short', year: 'numeric' };
const options2 = { timeZone: 'UTC', };


// Functions

async function getSessionId(domainName, userName, password) {
  const credential = {
      DomainName: domainName,
      UserName: userName,
      Password: password,
  };

  return await FamarkCloud.postData(
      "/Credential/Connect",
      JSON.stringify(credential),
      null
  );
}




module.exports = {

  // Get Product List
    list : async (req, res) => {
        try {
            const user = req.user;
              if (!user) {
                  return res.redirect('/branch/auth/login');
              }

            const Vehicle = await models.BranchModel.Vehicle.find({branch_id : user.userId})
                .populate('deliveryman_id')
                .populate('branch_id')
        
            const VehicleCount = Vehicle.length; 
            res.render('branch/vehicle/list', { Title: "Vehicle list", user, Vehicle, VehicleCount , error: "DeliveryMan List" })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },


  // Add Category List
    getAdd : async (req, res) => {
        try{
            const user = req.user;
            const userId = user.userId;
            
            if (!user) {
                return res.redirect('/branch/auth/login');
            }

            // const branch = await models.BranchModel.Branch.find({});
    
            res.render("branch/vehicle/add",{ Title: "Vehicle Registeration",user , error: "Register a Vehicle" });
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

  // Add Category List
    postAdd: async (req, res) => {
        try {
            const user = req.user;
            const userId = user.userId;
            
            if (!user) {
                return res.redirect('/branch/auth/login');
            }
            
            const {vehicle_number, deliveryman_id, phone, email, password} = req.body;
        
            if (!vehicle_number || !deliveryman_id) {
                throw new Error('Required fields are missing.');
            }

            const vehicleData = {
                vehicle_number, 
                branch_id : userId, 
                deliveryman_id,
                email : email,
                password : await bcrypt.hash(password, 10),
                is_available : true,
                phone
            };

            const vehicle = new models.BranchModel.Vehicle(vehicleData);
            await vehicle.save();
            console.log("Vehicle Added successfully");
            res.redirect('/branch/vehicle/list');
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },


    // Delete Vehicle
    deleteVehicle : async (req,res) => {
      try {
            const vehicleId = req.params.vehicleId;
            const user = req.user;
            const userId = user.userId;

            if (!user) {
              return res.redirect('/branch/auth/login');
            } 
            console.log("Hitted", vehicleId);

            const vehicle = await models.BranchModel.Vehicle.findOneAndDelete({ _id: vehicleId });
  
            if (!vehicle) {
              // product not found in the database
              throw new Error(`${vehicle} not found.`);
            }
            
            console.log("Deleted");
            
      } catch (err) {
        console.log("There is an issue while fetching the Delivery Man for Deleting.");
        console.log(err.message);
        res.status(404).send(err.message);
      }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
        try {
            const vehicleId = req.params.vehicleId;
            const user = req.user;
            const userId = user.userId;
            
            if (!user) {
                return res.redirect('/branch/auth/login');
            }
          
            console.log("Fetching Vehicle with ID:", vehicleId);
        
            // Find the deliveryman in the database by ID
            const vehicle = await models.BranchModel.Vehicle.findById(vehicleId)
                .populate('branch_id');
        
            if (!vehicle) {
              // Vehicle not found in the database
              throw new Error('Vehicle not found.');
            }
        
            // Send the deliveryman details to the client for updating
            res.render('branch/Vehicle/update', { Title: "Vehicle Update",user ,vehicle , error:"Update the deliveryMan" }); // Assuming you are using a template engine like EJS
          } catch (err) {
            console.log("There is an issue while fetching the Delivery Man for updating.");
            console.log(err.message);
            res.status(404).send(err.message);
          }
    },

  // Update Category
    postUpdate :  async (req, res) => {
        try {
            const user = req.user;
            const userId = user.userId;
            
            if (!user) {
                return res.redirect('/branch/auth/login');
            }

            const vehicleId = req.params.vehicleId;
            console.log("Updating Vehicle with ID:", vehicleId);
            let deliveryman_id;
            const {vehicle_number, phone , email} = req.body;
            deliveryman_id = req.body.deliveryman_id;
            // Find the Delivery Man in the database by ID
            const vehicle = await models.BranchModel.Vehicle.findById(vehicleId);
        
            if (!vehicle) {
              // Delivery Man not found in the database
              throw new Error('Vehicle not found.');
            }
        
                vehicle.vehicle_number = vehicle_number;
                vehicle.branch_id = userId;
                vehicle.deliveryman_id = deliveryman_id;
                vehicle.phone = phone;
                console.log("deliveryman_id --- 2" , deliveryman_id);
            // Save the updated Delivery Man to the database
            await vehicle.save();
            console.log("Vehicle updated successfully");
        
            res.redirect('/branch/vehicle/list?success="Delivery Man Updated Successfully"');
          } catch (err) {
            console.log("There is an issue while updating the Delivery Man details.");
            console.log(err.message);
            res.status(400).send(err.message);
          }
    },

};

