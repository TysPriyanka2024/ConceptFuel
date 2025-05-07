const jwt = require('jsonwebtoken');
const fs = require('fs'); // Import the 'fs' module for file operations
const bcrypt = require('bcrypt');
const { promisify } = require('util');  
const axios = require('axios'); // Import the axios library
const { v4: uuidv4 } = require('uuid');
const path = require("path"); 
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
  
} = require('../constants');
const { AuthMiddleware } = require('../middlewares');
const { Validator } = require('../../../managers/utils');
const { AuthHelper, OtpHelper } = require('../../../managers/helpers');
const secretKey = process.env.SECRET_KEY
const {
  JwtService,
  UserService,
} = require('../../../managers/services');
const { generateAccessToken, initializeRevokedTokens } = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');
const { PushNotification } = require('../../../managers/notifications')
// This would be your token blacklist storage
const tokenBlacklist = new Set();
const { Mailer } = require('../../../mailer')


module.exports = {
// User Login API
  login : async (req, res) => {
    const loginData = {
      email: req.body.email,
      password: req.body.password,
    };
  
    console.log(req.body);
  
    const validationResult = Validator.validate(loginData, {
      email: {
        presence: { allowEmpty: false },
      },
      password: {
        presence: { allowEmpty: false },
      },
    });
  
    if (validationResult) {
      return res.status(StatusCodesConstants.BAD_REQUEST).json({
        status: false,
        status_code: StatusCodesConstants.BAD_REQUEST,
        message: validationResult
      });
    }
  
    try {
      // Check if the user with the provided email exists in the database
      const vehicle = await models.BranchModel.Vehicle.findOne({ email: loginData.email });
  
      if (!vehicle) {
        return res.status(StatusCodesConstants.NOT_FOUND).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: 'User Not Found',
          data: {},
        });
      }
  
      console.log(vehicle.password)
      console.log(loginData.password)

      // Verify the password
      const passwordMatch = await bcrypt.compare(loginData.password, vehicle.password);

      if (!passwordMatch) {
        return res.status(StatusCodesConstants.UNAUTHORIZED).json({
          status: false,
          status_code: StatusCodesConstants.UNAUTHORIZED,
          message: 'Invalid Password',
          data: {},
        });
      }

      let nameParts = vehicle.deliveryman_id.split(" ");

      // Extract first and last name
      let firstName = nameParts[0];
      let lastName = nameParts[1];

      const user = {
        _id: vehicle.id, // Replace with the actual user ID property
        deliveryman_image: vehicle.deliveryman_id.deliveryman_image,
        fname: firstName,
        lname: lastName,
        email: vehicle.email,
        phone: vehicle.phone,
      };
      
      // If email and password are correct, generate a JSON Web Token (JWT)
      const token = AuthMiddleware.generateAccessToken(user);


      const responseData = {
        userId: vehicle.id, // Replace with the actual user ID property
        vehicle_number : vehicle.vehicle_number,
        deliveryman_image: vehicle.deliveryman_id.deliveryman_image,
        fname: firstName,
        lname: lastName,
        email: vehicle.email,
        phone: vehicle.phone,
      };

      console.log("Token ---- ",token)
  
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Login Successful',
        data: { responseData ,token },
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data: {},
      });
    }
  },

// Get User Data
  getUser : async (req, res) => {
    try {
      const session = req.user;
      console.log(session)
      user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      // Fetch the full data of user
      const user = await models.BranchModel.Vehicle.findOne({ _id : user_id });
      if (!user) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'User Not Found',
        });
      }

      const devices = await models.UserModel.Device.find({ user_id: user_id });


      // Combine the fetched data into a single response
      const data = {
        user,
        devices
      };

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'User data fetched successfully',
        data : data,
      });

    }
    catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
  },

  getProfile : async (req, res) => {
    try {
      const session = req.user;
      user_id = session.email;
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      // Fetch the full data of user
      const vehicle = await models.BranchModel.Vehicle.findOne({ email: user_id });
  
      if (!vehicle) {
        return res.status(StatusCodesConstants.NOT_FOUND).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: 'User Not Found',
          data: {},
        });
      }

      let nameParts = vehicle.deliveryman_id.split(" ");

      // Extract first and last name
      let firstName = nameParts[0];
      let lastName = nameParts[1];


      const responseData = {
        userId: vehicle.id, // Replace with the actual user ID property
        vehicle_number : vehicle.vehicle_number,
        fname: firstName,
        lname: lastName,
        email: vehicle.email,
        phone: vehicle.phone,
      };

      const message = "Hello User"

      // PushNotification.sendPushNotification(user_id, message)

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'User data fetched successfully',
        data : responseData,
      });
    }
    catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
  },

  logout:(req, res) => {
    const session = req.user;
    const user_id = session.userId;
    const user_token = req.token ;
  
    if (user_token) {
      // Add the token to the revokedTokens set to invalidate it
      initializeRevokedTokens(user_id, user_token);

      console.log(initializeRevokedTokens)
  
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        message: MessageConstants.USER_LOGGED_OUT,
      });
    } else {
      return res.status(StatusCodesConstants.ACCESS_DENIED).json({
        status: false,
        message: MessageConstants.ACCESS_DENIED_ERROR,
      });
    }
  },

  addLocation : async (req, res) => {
    try {
      const session = req.user;
      const user_id = session.userId;

      console.log("add location in deliveryman app",user_id);
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }
        const maps = `https://www.google.com/maps/search/?api=1&query=${req.body.latitude},${req.body.longitude}`
        const addLocation = {
          vehicle_id : user_id,
          latitude : req.body.latitude,
          longitude : req.body.longitude,
          maps_link : maps
        }

        const validationResult = Validator.validate(addLocation, {
          latitude: {
            presence: { allowEmpty: false },
          },
          longitude: {
            presence: { allowEmpty: false },
          }
        })

        if (validationResult) {
          return res.status(StatusCodesConstants.NOT_FOUND).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: validationResult, // Include the validation result in the response if needed
          });
        }

        const existingLocation = await models.BranchModel.VehicleLocation.findOne({ vehicle_id: addLocation.vehicle_id });

        if(existingLocation) {
          
          existingLocation.maps_link = addLocation.maps_link;
          existingLocation.longitude = addLocation.longitude;
          existingLocation.latitude = addLocation.latitude;

          existingLocation.save();
          return res.status(StatusCodesConstants.SUCCESS).json({
            status_code: StatusCodesConstants.SUCCESS,
            status: true,
            message: 'Location Updated successfully',
            data: { location: existingLocation },
          });
        }else{
          const newLocation = new models.BranchModel.VehicleLocation(addLocation);
          const savedLocation = await newLocation.save();
          console.log("Saved Location  --", savedLocation)
                
          console.log("Location Added SuccessFully")
          return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: 'Location added successfully',
              data: { location: savedLocation },
          });
        }

    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
  }},

  // Add Device Data
  addDevice : async (req, res) => {
    try {
      const user = req.user;
      const user_id = user.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        });
      }

      const addDevice = {
        user_id: user_id,
        fcm_token: req.body.fcm_token,
        name: req.body.name,
        type: req.body.type,
        version: req.body.version 
      };

      const validationResult = Validator.validate(addDevice, {
        // ... existing validation rules
      });

      if (validationResult) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: validationResult,
        });
      }

      // Look for an existing device for the user
      const existingDevice = await models.UserModel.Device.findOneAndUpdate(
        { user_id: user_id }, // search query
        { $set: addDevice },  // update data
        { new: true }         // options: return updated doc
      );

      if (existingDevice) {
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'Device updated successfully',
          data: { device: existingDevice },
        });
      } else {
        const newDevice = new models.UserModel.Device(addDevice);
        const savedDevice = await newDevice.save();
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'Device added successfully',
          data: { device: savedDevice },
        });
      }
    }
    catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
    },

  getlocation : async ( req, res ) => {
    try{
      const session = req.user;
      const user_id = session.userId;

      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      const location = await models.BranchModel.VehicleLocation.findOne({ vehicle_id : user_id });

      if(!location){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Location Not Found',
        })
      }

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Location fetched successfully',
        data : location,
      })


    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
  },

  getNotification : async ( req, res ) => {
    try{
      const session = req.user;
      const user_id = session.userId;

      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      const notification = await models.NotifyModel.Notify.find({ delivery_id : user_id }).sort({ created_date : -1 });

      if(!notification){
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'No notifications found.', // Updated message for clarity
        });        
      }

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Notifications fetched successfully',
        data : notification,
      })

    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data : error
      });
    }
  },

  markRead : async ( req, res ) => {
    try{
      const session = req.user;
      const user_id = session.userId;

      console.log("hitted")
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      const notification_id = req.params.notification_id;

      if(!notification_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Notification Id Not Found',
        })
      }

      const notification = await models.NotifyModel.Notify.findOne({ _id : notification_id });

      if(!notification){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Notification Not Found',
        })
      }

      notification.status = true;
      await notification.save();

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Notification status updated successfully',
        data : notification,
      })

    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data : error
      });
    }
  },
  
  markUnread : async ( req, res ) => {
    try{
      const session = req.user;
      const user_id = session.userId;

      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      const notification_id = req.params.notification_id;

      if(!notification_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Notification Id Not Found',
        })
      }

      const notification = await models.NotifyModel.Notify.findOne({ _id : notification_id });

      if(!notification){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Notification Not Found',
        })
      }

      notification.status = false;
      await notification.save();

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Notification Marked as Unread',
        data : notification,
      })
    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data : error
      });
    }
  },

  getUnreadCount : async ( req, res ) => {
    try{
      const session = req.user;
      const user_id = session.userId;

      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      const notifications = await models.NotifyModel.Notify.find({ delivery_id : user_id, status : false });
      
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Unread Notifications Count fetched successfully',
        data : notifications.length,
      })

    }catch (error) {
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data : error
      });
    }
  }
}

