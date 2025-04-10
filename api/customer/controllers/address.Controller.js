const {
    MessageConstants,
    StatusCodesConstants,
  } = require('../constants');
  const { Validator} = require('../../../managers/utils');
  const models = require('../../../managers/models');
  
  // This would be your token blacklist storage
  const tokenBlacklist = new Set();
  
  
  
  module.exports = {
      // Add Address
          addAddress : async (req, res) => {
              try { 
              const user = req.user;
              user_id = user.userId;
              if(!user_id){
                  return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                  status: false,
                  status_code: StatusCodesConstants.ACCESS_DENIED,
                  message: MessageConstants.NOT_LOGGED_IN,
                  });
              }
  
  
              const existingAddresses = await models.UserModel.Address.find({ user_id });
  
              // If there are existing addresses, update them to set primary to false
              if (existingAddresses.length > 0) {
                  await models.UserModel.Address.updateMany({ user_id }, { $set: { primary: false } });
              }
  
              const addAddress = {
                  user_id: user_id,
                  address_type: req.body.address_type,
                  address_1: req.body.address_1,
                  address_2: req.body.address_2,
                  area: req.body.area,
                  city: req.body.city.charAt(0).toUpperCase() + req.body.city.slice(1),
                  pincode: req.body.pincode,
                  state: req.body.state,
                  country: req.body.country,
                  primary : true
              }
  
              console.log(req.body)
  
              const validationResult = Validator.validate(addAddress, {
                  address_type: {
                  presence: { allowEmpty: false },
                  length: { minimum: 4, maximum: 20 },
                  },
                  address_1: {
                  presence: { allowEmpty: false },
                  length: { minimum: 3, maximum: 150 },
                  },
                  area: {
                  presence: { allowEmpty: false },
                  length: { minimum: 2, maximum: 50 },
                  },
                  city: {
                  presence: { allowEmpty: false },
                  length: { minimum: 4, maximum: 50 },
                  },
                  state: {
                  presence: { allowEmpty: false },
                  length: { minimum: 3, maximum: 50 },
                  },
                  country: {
                  presence: { allowEmpty: false },
                  length: { minimum: 4, maximum: 50 },
                  },
                  pincode:{
                  presence: { allowEmpty: false },
                  numericality: { onlyInteger: true },
                  length: { minimum: 3, maximum: 6 },
                  },
              })
  
              if (validationResult) {
                  return res.status(StatusCodesConstants.NOT_FOUND).json({
                  status: false,
                  status_code: StatusCodesConstants.NOT_FOUND,
                  message: validationResult, // Include the validation result in the response if needed
                  });
              }
  
              const newAddress = new models.UserModel.Address(addAddress);
              const savedAddress = await newAddress.save();
              console.log("Saved Address  --", savedAddress)
              // Update the user's data (is_address_available: true)
              await models.UserModel.User.findOneAndUpdate(
                  { _id: user_id },
                  { is_address_available: true }
              );
  
              console.log(models.UserModel.User.findOneAndUpdate(
                  { _id: user_id },
                  { is_address_available: true }))
  
              console.log(`User ${user_id} updated successfully`)
              
              console.log("Address Added SuccessFully")
              return res.status(StatusCodesConstants.SUCCESS).json({
                  status: true,
                  status_code: StatusCodesConstants.SUCCESS,
                  message: 'Address added successfully',
                  data: { address: savedAddress },
              });
              } catch (error) {
              console.error(error);
              return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
                  status: false,
                  status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
                  message: MessageConstants.INTERNAL_SERVER_ERROR,
              });
              }
          },
  
      // Get Address
          getAddress: async (req, res) => {
              try {
              const user = req.user;
              const user_id = user.userId;
          
              if (!user_id) {
                  return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                  status: false,
                  status_code: StatusCodesConstants.ACCESS_DENIED,
                  message: MessageConstants.NOT_LOGGED_IN,
                  });
              }
          
              // Find addresses for the user
              const addresses = await models.UserModel.Address.find({ user_id });
              console.log("---",addresses)
              if (addresses && addresses.length > 0) {
                  return res.status(StatusCodesConstants.SUCCESS).json({
                      status: true,
                      status_code: StatusCodesConstants.SUCCESS,
                      message: MessageConstants.ADDRESS_FETCHED_SUCCESSFULLY,
                      data: addresses,
                  });
              }else{
                  return res.status(StatusCodesConstants.SUCCESS).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message: MessageConstants.ADDRESS_NOT_PRESENT,
                      data: [],
                  });
              }
              } catch (error) {
              console.error(error);
              return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
                  status: false,
                  status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
                  message: MessageConstants.INTERNAL_SERVER_ERROR,
              });
              }
          },
  
      // Update Address
          updateAddress: async (req, res) => {
              try {
                  const session = req.user;
                  const user_id = session.userId;
              
                  console.log(`User ${session.first_name} updating address`)
          
                  if (!user_id) {
                  return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                      status: false,
                      status_code: StatusCodesConstants.ACCESS_DENIED,
                      message: MessageConstants.NOT_LOGGED_IN,
                  });
                  }
          
                  const addressData = {
                      user_id: user_id,
                      address_id: req.body.address_id,
                      address_type: req.body.address_type,
                      address_1: req.body.address_1,
                      address_2: req.body.address_2,
                      area: req.body.area,
                      city: req.body.city,
                      pincode: req.body.pincode,
                      state: req.body.state,
                      country: req.body.country,
                  }
  
                  const validationResult = Validator.validate(addressData, {
                      address_id: {
                          presence: { allowEmpty: false },
                      },
                      address_type: {
                          presence: { allowEmpty: false },
                          length: { minimum: 4, maximum: 20 },
                      },
                      address_1: {
                          presence: { allowEmpty: false },
                          length: { minimum: 10, maximum: 150 },
                      },
                      area: {
                          presence: { allowEmpty: false },
                          length: { minimum: 4, maximum: 50 },
                      },
                      city: {
                          presence: { allowEmpty: false },
                          length: { minimum: 4, maximum: 50 },
                      },
                      state: {
                          presence: { allowEmpty: false },
                          length: { minimum: 4, maximum: 50 },
                      },
                      country: {
                          presence: { allowEmpty: false },
                          length: { minimum: 4, maximum: 50 },
                      },
                      pincode:{
                          presence: { allowEmpty: false },
                          numericality: { onlyInteger: true },
                          length: { minimum: 3, maximum: 6 },
                      },
                  })
  
                  if (validationResult) {
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message: validationResult, // Include the validation result in the response if needed
                      });
                  }
  
                  // Step 1: Check if there is already a address item with the same user_id, branch_id, and product_id
                  const existingAddress = await models.UserModel.Address.findOne({
                      _id : addressData.address_id,
                      user_id: addressData.user_id,
                  });
  
                  if(existingAddress){
                      // If the address item already exists, you can update its quantity here
                      existingAddress.address_type = req.body.address_type || existingAddress.address_type;
                      existingAddress.address_1 = req.body.address_1 || existingAddress.address_1;
                      existingAddress.address_2 = req.body.address_2 || existingAddress.address_2;
                      existingAddress.area = req.body.area || existingAddress.area;
                      existingAddress.city = req.body.city || existingAddress.city;
                      existingAddress.pincode = req.body.pincode || existingAddress.pincode;
                      existingAddress.state = req.body.state || existingAddress.state;
                      existingAddress.country = req.body.country || existingAddress.country;
  
                      await existingAddress.save();
  
                      return res.status(StatusCodesConstants.SUCCESS).json({
                          status: true,
                          status_code: StatusCodesConstants.SUCCESS,
                          message: MessageConstants.ADDRESS_UDPATED_SUCCESSFULLY,
                          data: { address : existingAddress },
                      });
                  }else{
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                          status: false,
                          status_code: StatusCodesConstants.NOT_FOUND,
                          message: MessageConstants.ADDRESS_NOT_PRESENT,
                          data: []
                      });
                  }
              } catch (error) {
              console.error(error);
              return res.status(500).json({
                  status: false,
                  status_code: 500,
                  message: 'Internal server error',
              });
              }
          },
  
      // Delete Address
          deleteAddress : async (req, res) => {
              try {
                  const session = req.user;
                  const user_id = session.userId;
                  console.log(`User ${session.first_name} ----- Deleting Address`);
                  if (!user_id) {
                      return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                          status: false,
                          status_code: StatusCodesConstants.ACCESS_DENIED,
                          message: MessageConstants.NOT_LOGGED_IN,
                      });
                  }
          
                  const addressData = {
                      user_id: session.userId,
                      address_id: req.body.address_id,
                  };
          
                  // Step 1: Check if the address item exists
                  const existingAddress = await models.UserModel.Address.findOne({
                      user_id: addressData.user_id,
                      _id: addressData.address_id,
                  });
          
                  if (!existingAddress) {
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                          status: false,
                          status_code: StatusCodesConstants.NOT_FOUND,
                          message: MessageConstants.ADDRESS_NOT_PRESENT,
                          data: [],
                      });
                  }
          
                  // Step 2: Delete the address item
                  const deletedAddress = await models.UserModel.Address.findOneAndDelete({
                      user_id: addressData.user_id,
                      _id: addressData.address_id,
                  });
          
                  console.log(`User ${session.first_name} ---- ${MessageConstants.ADDRESS_DELETED_SUCCESSFULLY}`);
                  return res.status(StatusCodesConstants.SUCCESS).json({
                      status: true,
                      status_code: StatusCodesConstants.SUCCESS,
                      message: MessageConstants.ADDRESS_DELETED_SUCCESSFULLY,
                      data: { address: deletedAddress },
                  });
              } catch (error) {
                  console.error('Error deleting address item:', error);
                  return res
                      .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
                      .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
              }
          },
              
  
          setPrimaryAddress: async (req, res) => {
              try {
                  // Extract user information from the request session
                  const { userId, first_name } = req.user;
          
                  console.log(`User ${first_name} updating address`);
          
                  // Check if the user is logged in
                  if (!userId) {
                      return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                          status: false,
                          status_code: StatusCodesConstants.ACCESS_DENIED,
                          message: MessageConstants.NOT_LOGGED_IN,
                      });
                  }
          
                  // Extract address information from the request body
                  const addressData = {
                      user_id: userId,
                      address_id: req.body.address_id,
                  };
          
                  const existingAddresses = await models.UserModel.Address.find({ user_id :  userId });
  
                  // If there are existing addresses, update them to set primary to false
                  if (existingAddresses.length > 0) {
                      await models.UserModel.Address.updateMany({ user_id :  userId }, { $set: { primary: false } });
                  }
  
                  // Find the existing address based on user_id and address_id
                  const existingAddress = await models.UserModel.Address.findOne({
                      user_id: addressData.user_id,
                      _id: addressData.address_id,
                  });
          
                  // Check if the address exists
                  if (!existingAddress) {
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                          status: false,
                          status_code: StatusCodesConstants.NOT_FOUND,
                          message: MessageConstants.ADDRESS_NOT_PRESENT,
                          data: [],
                      });
                  }
          
                  // Update the existing address to set primary to true
                  existingAddress.primary = true;
                  await existingAddress.save();
          
                  // Respond with success message and updated address data
                  return res.status(StatusCodesConstants.SUCCESS).json({
                      status: true,
                      status_code: StatusCodesConstants.SUCCESS,
                      message: 'Primary address set successfully',
                      data: { address: existingAddress },
                  });
              } catch (error) {
                  // Handle any unexpected errors and respond with an internal server error
                  console.error(error);
                  return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
                      status: false,
                      status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
                      message: MessageConstants.INTERNAL_SERVER_ERROR,
                  });
              }
          },
  
          getStateLists : async (req, res) => {
              try{
                const stateData = await models.SettingModel.State.find();
          
                if(!stateData){
                  return res.status(StatusCodesConstants.NOT_FOUND).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message: 'States Lists No Found',
                      data: { stateData },
                    });
                }
                
                return res.status(StatusCodesConstants.SUCCESS).json({
                  status: true,
                  status_code: StatusCodesConstants.SUCCESS,
                  message: 'States Lists Fetched Successfully',
                  data: { stateData },
                });
          
              }catch(error) {
                console.error('Error while Listing the Company:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
                  status: false,
                  status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
                  message: MessageConstants.INTERNAL_SERVER_ERROR,
                  data: {},
                });  
              }
            },
            
          getDistrictLists : async (req, res) => {
          try{
      
              const state = req.body.state_id;
      
              const districtData = await models.SettingModel.District.find({state_id : state});
      
              return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: 'District Lists Fetched Successfully',
              data: { districtData },
              });
      
          }catch(error) {
              console.error('Error while Listing the Company:', error);
              return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
              status: false,
              status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
              message: MessageConstants.INTERNAL_SERVER_ERROR,
              data: {},
              });  
          }
          },
            
          //   getCityLists : async (req, res) => {
          //     try{
          
          //       const district_id = req.body.district_id;
          
          //       const cityData = await models.SettingModel.City.find({ district_id : district_id});
          
          //       return res.status(StatusCodesConstants.SUCCESS).json({
          //         status: true,
          //         status_code: StatusCodesConstants.SUCCESS,
          //         message: 'City Lists Fetched Successfully',
          //         data: { cityData },
          //       });
          
          //     }catch(error) {
          //       console.error('Error while Listing the Company:', error);
          //       return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          //         status: false,
          //         status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          //         message: MessageConstants.INTERNAL_SERVER_ERROR,
          //         data: {},
          //       });  
          //     }
          //   },
  
            getCityLists: async (req, res) => {
              try {
                    console.log("Hitted");
                  const stateName = req.body.state;
                  console.log(stateName);
          
                  // Fetch the state based on the name
                  const states = await models.SettingModel.State.find({ name: stateName });
                  console.log(states);
          
                  if (states.length > 0) {
                      const stateId = states[0]._id;
          
                      // Fetch all districts based on the state
                      const districts = await models.SettingModel.District.find({ state_id: stateId });
                      console.log("District Data", districts);
          
                      if (districts.length > 0) {
                          // Gather all city data for each district
                          const citiesPromises = districts.map(async (district) => {
                              const districtId = district._id;
                              const cities = await models.SettingModel.City.find({ district_id: districtId });
                              return cities;
                          });
          
                          // Wait for all city queries to complete
                          const allCities = await Promise.all(citiesPromises);
          
                          // Flatten the array of arrays into a single array of cities
                          const flattenedCities = [].concat(...allCities);
          
                          // Send the response
                          return res.status(StatusCodesConstants.SUCCESS).json({
                              status: true,
                              status_code: StatusCodesConstants.SUCCESS,
                              message: 'City Lists Fetched Successfully',
                              data: { cityData : flattenedCities },
                            });
                      } else {
                          return res.status(StatusCodesConstants.NOT_FOUND).json({
                              status: false,
                              status_code: StatusCodesConstants.NOT_FOUND,
                              message: "No districts found for the given state.", 
                              data: {},
                            });
                      }
                  } else {
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                          status: false,
                          status_code: StatusCodesConstants.NOT_FOUND,
                          message: "State not found." ,
                          data: {},
                        });
                  }
              } catch (error) {
                  console.error(error);
                  res.status(500).json({ error: 'Internal Server Error' });
              }
          },
  
          getAreaLists: async (req, res) => {
              try {
                  const stateName = req.body.state;
                  console.log(stateName);
          
                  // Fetch the state based on the name
                  const states = await models.SettingModel.State.find({ name: stateName });
                  console.log(states);
          
                  if (states.length > 0) {
                      const stateId = states[0]._id;
          
                      // Fetch all districts based on the state
                      const districts = await models.SettingModel.District.find({ state_id: stateId });
                      console.log("District Data", districts);
          
                      if (districts.length > 0) {
                          // Gather all city data for each district
                          const areaPromises = districts.map(async (district) => {
                              const districtId = district._id;
                              const area = await models.SettingModel.Area.find({ district_id: districtId });
                              return area;
                          });
          
                          // Wait for all city queries to complete
                          const allArea = await Promise.all(areaPromises);
          
                          // Flatten the array of arrays into a single array of cities
                          const flattenedArea = [].concat(...allArea);
          
                          // Send the response
                          return res.status(StatusCodesConstants.SUCCESS).json({
                              status: true,
                              status_code: StatusCodesConstants.SUCCESS,
                              message: 'Area Lists Fetched Successfully',
                              data: { areaData : flattenedArea },
                            });
                      } else {
                          return res.status(StatusCodesConstants.NOT_FOUND).json({
                              status: false,
                              status_code: StatusCodesConstants.NOT_FOUND,
                              message: "No districts found for the given state.", 
                              data: {},
                            });
                      }
                  } else {
                      return res.status(StatusCodesConstants.NOT_FOUND).json({
                          status: false,
                          status_code: StatusCodesConstants.NOT_FOUND,
                          message: "State not found." ,
                          data: {},
                        });
                  }
              } catch (error) {
                  console.error(error);
                  res.status(500).json({ error: 'Internal Server Error' });
              }
          },
  
  
  
  }
  
  
  