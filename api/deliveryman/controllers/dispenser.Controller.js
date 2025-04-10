const jwt = require('jsonwebtoken');
const fs = require('fs'); // Import the 'fs' module for file operations
const bcrypt = require('bcrypt');
const { promisify } = require('util');  
const axios = require("axios").default;
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
    // setPrice : async ( req, res ) => {
    // try{
    //     const session = req.user;
    //     const user_id = session.userId;

    //     if(!user_id){
    //     return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //         status: false,
    //         status_code: StatusCodesConstants.BAD_REQUEST,
    //         message: 'Please Login First',
    //     })
    //     }

    //     const order_id = req.params.order_id;

    //     const order = await models.BranchModel.Order.findOne({order_id : order_id});
    //     if(!order){
    //         return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //             status: false,
    //             status_code: StatusCodesConstants.BAD_REQUEST,
    //             message: 'Order Not Found',
    //         })
    //     }

    //     const vehicle = await models.BranchModel.Vehicle.findOne({_id : order.delivery_id});
    //     const price = parseFloat(order.product_items[0].price) - parseFloat(order.discount);
    //     console.log("Vehicle ---- ",vehicle.imei_number);
    //     console.log("Setting this price",price);

    //     const setPriceApi = `http://localhost:1324/api/auth/deliveryman/dispenser/test-api/?id=${vehicle.imei_number}&cmd=SetRefueling&number=1&value=${price}`;
    //     const saveDataResponse = await axios.get(setPriceApi);
        
    //     console.log(saveDataResponse);
    //     if(saveDataResponse.data.result === "success"){
    //       console.log("True");
    //       res.send({status : true, message : "Success" , data : saveDataResponse.data});
    //     }else{
    //       console.log("False");
    //       res.send({status : false, message : "False" , data : saveDataResponse.data});
    //     }
    // }catch (error) {  
    //     console.error(error);
    //     return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
    //     status: false,
    //     status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
    //     message: MessageConstants.INTERNAL_SERVER_ERROR,
    //     });
    // }
    // },

    testApi : async ( req, res ) => {
      try{
        const id = req.query.id;
        const cmd = req.query.cmd;
        const number = req.query.number;
        const value = req.query.value;

        if (id && cmd && number && value) {
          // Implement the logic to handle the refueling command here
          if (cmd === 'SetRefueling' || cmd === 'SetPrice' || cmd === 'SetQuantity') {
              console.log(`Command: ${cmd}, Number: ${number}, Value: ${value}`);
              console.log("Done");
              // Assuming the refueling process is successful
              return res.status(200).json({ success: true, message: 'success' , result : "success"});
          } else {
              return res.status(400).json({ success: false, message: 'Invalid command.' });
          }
        } else {
            return res.status(400).json({ success: false, message: 'Missing required query parameters.' });
        }    
      }catch (error) {
          console.error(error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
      }
    },

    // setRefulingAmount : async ( req, res ) => {
    //   try{
    //       const session = req.user;
    //       const user_id = session.userId;
  
    //       if(!user_id){
    //       return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //           status: false,
    //           status_code: StatusCodesConstants.BAD_REQUEST,
    //           message: 'Please Login First',
    //       })
    //       }
  
    //       const order_id = req.params.order_id;
  
    //       const order = await models.BranchModel.Order.findOne({order_id : order_id});
    //       if(!order){
    //           return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //               status: false,
    //               status_code: StatusCodesConstants.BAD_REQUEST,
    //               message: 'Order Not Found',
    //           })
    //       }
  
    //       const vehicle = await models.BranchModel.Vehicle.findOne({_id : order.delivery_id});
    //       const price = order.grand_total;
    //       console.log("Vehicle ---- ",vehicle.imei_number);
    //       console.log("Refueling this price ---- ",price);
          

    //       const setRefuelingPriceApi = `http://josh.enterox.com:5111/api/?id=${vehicle.imei_number}&cmd=SetRefueling&number=2&value=${price}`;
    //       const saveDataResponse = await axios.post(setRefuelingPriceApi);
          
    //       if(saveDataResponse.data.result === "success"){
    //         console.log("True");
    //         res.send({status : true, message : "Success" , data : saveDataResponse.data});
    //       }else{
    //         console.log("False");
    //         res.send({status : false, message : "False" , data : saveDataResponse.data});
    //       }
    //   }catch (error) {  
    //       console.error(error);
    //       return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
    //       status: false,
    //       status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
    //       message: MessageConstants.INTERNAL_SERVER_ERROR,
    //       });
    //   }
    // },
    
    // setRefulingQuantity : async ( req, res ) => {
    //   try{
    //       const session = req.user;
    //       const user_id = session.userId;
  
    //       if(!user_id){
    //       return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //           status: false,
    //           status_code: StatusCodesConstants.BAD_REQUEST,
    //           message: 'Please Login First',
    //       })
    //       }
  
    //       const order_id = req.params.order_id;
  
    //       const order = await models.BranchModel.Order.findOne({order_id : order_id});
    //       if(!order){
    //           return res.status(StatusCodesConstants.BAD_REQUEST).json({
    //               status: false,
    //               status_code: StatusCodesConstants.BAD_REQUEST,
    //               message: 'Order Not Found',
    //           })
    //       }
  
    //       const vehicle = await models.BranchModel.Vehicle.findOne({_id : order.delivery_id});
    //       const quantity = order.product_items[0].quantity;
    //       console.log("Vehicle ---- ",vehicle.imei_number);
    //       console.log("Refueling this quantity ---- ",quantity);
          

    //       const setRefuelingQuantityApi = `http://josh.enterox.com:5111/api/?id=${vehicle.imei_number}&cmd=SetRefueling&number=1&value=${quantity}`;
    //       const saveDataResponse = await axios.post(setRefuelingQuantityApi);
          
    //       if(saveDataResponse.data.result === "success"){
    //         console.log("True");
    //         res.send({status : true, message : "Success" , data : saveDataResponse.data});
    //       }else{
    //         console.log("False");
    //         res.send({status : false, message : "False" , data : saveDataResponse.data});
    //       }
    //   }catch (error) {  
    //       console.error(error);
    //       return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
    //       status: false,
    //       status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
    //       message: MessageConstants.INTERNAL_SERVER_ERROR,
    //       });
    //   }
    // },

    verifyOtp :  async ( req, res ) => {
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
  
          const server = req.body;
          const order = await models.BranchModel.Order.findOne({order_id : server.order_id}).populate('delivery_id').populate('user_id'); 
          if(!order){
              return res.status(StatusCodesConstants.BAD_REQUEST).json({
                  status: false,
                  status_code: StatusCodesConstants.BAD_REQUEST,
                  message: 'Order Not Found',
              })
          }

          const otpVerification = await models.BranchModel.DeliveryOtp.findOne({user_id : order.user_id});

          console.log("otpVerification", otpVerification);
          if(req.body.otp === otpVerification.otp){
            const vehicle = order.delivery_id.imei_number;
            const price = parseFloat(order.product_items[0].price);
            console.log("Price",parseFloat(order.product_items[0].price));
            console.log("Price",parseFloat(order.discount));
            console.log("Vehicle ---- ",vehicle);
            console.log("Setting this price",price);
            
            // check vehicle.is_connected === true

            if(!order.delivery_id.is_connected){
              res.send({status : true, message : "Success Vehicle Not Connected" , data : {}});
            }else{

                // const setPrice = `http://localhost:1324/api/auth/deliveryman/dispenser/test-api/?id=${vehicle}&cmd=SetPrice&number=1&value=${price}`;
                const setPrice = `http://josh.enterox.com:5111/api/?id=${vehicle}&cmd=SetPrice&number=1&value=${price}`;
                const saveDataResponse = await axios.post(setPrice);
                
                if(saveDataResponse.data.result === "success"){
                  console.log("True");
                  const quantity = order.product_items[0].quantity;

                  // const setRefuelingQuantityApi = `http://localhost:1324/api/auth/deliveryman/dispenser/test-api/?id=${vehicle.imei_number}&cmd=SetRefueling&number=1&value=${quantity}`;
                  const setRefuelingQuantityApi = `http://josh.enterox.com:5111/api/?id=${vehicle}&cmd=SetRefueling&number=1&value=${quantity}`;
                  const saveDataResponse = await axios.post(setRefuelingQuantityApi);
                  
                  if(saveDataResponse.data.result === "success"){
                    console.log("True");
                    const deliveryOtp = await models.BranchModel.DeliveryOtp.deleteOne({user_id : order.user_id});
                    res.send({status : true, message : "Success" , data : saveDataResponse.data});
                  }else{
                    console.log("False");
                    res.send({status : false, message : "False" , data : saveDataResponse.data});
                  }
                }else{
                  console.log("False");
                  return res.send({status : false, message : "False" , data : saveDataResponse.data});
                }
            }
          }else{
              return res.status(StatusCodesConstants.BAD_REQUEST).json({
                  status: false,
                  status_code: StatusCodesConstants.BAD_REQUEST,
                  message: 'Invalid OTP',
              })
          }


      }catch (error) {  
          console.error(error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
      }
    },

    resendOtp : async ( req, res ) => {
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

          const server = req.body;
          const order = await models.BranchModel.Order.findOne({order_id : server.order_id}).populate('delivery_id').populate('user_id'); 
          if(!order){
              return res.status(StatusCodesConstants.BAD_REQUEST).json({
                  status: false,
                  status_code: StatusCodesConstants.BAD_REQUEST,
                  message: 'Order Not Found',
              })
          }

          const otpVerification = await models.BranchModel.DeliveryOtp.findOne({user_id : order.user_id});
          console.log("otpVerification", otpVerification);

          if(otpVerification){
            const apiUrl = `https://smspanel.tysindia.com/smsapi/index?key=365FBFC8358994&campaign=2913&routeid=1&type=text&contacts=${order.user_id.phone}&senderid=JOSHAC&msg=Dear%20User,%0A%0APlease%20use%20this%20OTP:%20${otpVerification.otp}%20for%20Delivery%20Verification.%0A%0ARegards,%0AJosh%20Fuel%20App`
            const response = await axios.post(apiUrl);
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: 'OTP Resend Successfully',
              data : otpVerification
            })  

          }else{
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: 'Delivery Not Found',
              data : otpVerification
            })  
          }


      }catch (error) {  
          console.error(error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
      }
    },

    getRecord : async ( req, res ) => {
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
  
          const order_id = req.params.order_id;
  
          const order = await models.BranchModel.Order.findOne({order_id : order_id});
          if(!order){
              return res.status(StatusCodesConstants.BAD_REQUEST).json({
                  status: false,
                  status_code: StatusCodesConstants.BAD_REQUEST,
                  message: 'Order Not Found',
              })
          }
  
          const vehicle = await models.BranchModel.Vehicle.findOne({_id : order.delivery_id});
          console.log("Vehicle ---- ",vehicle.imei_number);
          if(!vehicle.is_connected){
            res.send({status : true, message : "Vehicle Not Connected" , data : {}});
          }else{
            const getRecord = `http://josh.enterox.com:5111/api/?id=${vehicle.imei_number}&cmd=GetRecord&number=1`;
            const saveDataResponse = await axios.post(getRecord);
            console.log("saveDataResponse",saveDataResponse.data);
            if(saveDataResponse.status === 200){
              console.log("True");
              const dispenserData = {
                vehicle_id : vehicle._id,
                amount : saveDataResponse.data.amount,
                price : saveDataResponse.data.price,
                liters : saveDataResponse.data.litres,
                datetime : saveDataResponse.data.datetime,
              }


              const dispenser = await models.BranchModel.Dispensed.findOne({datetime : saveDataResponse.data.datetime});
              if(dispenser){
                console.log("True");
                res.send({status : true, message : "Response Already Exists" , data : dispenser});
              }else{
                const saveData = new models.BranchModel.Dispensed(dispenserData);
                const saveDataResponse = await saveData.save();
                console.log("Created");
                res.send({status : true, message : "Record Fetched And Stored Successfully" , data : saveDataResponse.data});
              }
            }else{
              console.log("False");
              res.send({status : false, message : "False" , data : saveDataResponse.data});
            }
          }
      }catch (error) {  
          console.error(error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
      }
    },

    dispenseAction : async ( req, res ) => {
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
        const order_id = req.params.order_id;
        const order = await models.BranchModel.Order.findOne({order_id : order_id});
        if(!order){
          return res.status(StatusCodesConstants.BAD_REQUEST).json({
            status: false,
            status_code: StatusCodesConstants.BAD_REQUEST,
            message: 'Order Not Found',
          })
        }
        const vehicle = await models.BranchModel.Vehicle.findOne({_id : order.delivery_id});
        if(!vehicle){
          return res.status(StatusCodesConstants.BAD_REQUEST).json({  
            status: false,
            status_code: StatusCodesConstants.BAD_REQUEST,
            message: 'Vehicle Not Found',
          })
        }
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'Vehicle Dispensed Successfully',
          data : vehicle
        })  
      }catch(error) {
        console.error('Error while Dispensing the Vehicle:', error);
        return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
          data: {},
        });
      }
    },
}