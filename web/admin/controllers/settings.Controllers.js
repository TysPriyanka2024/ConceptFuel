const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { OtpHelper } = require('../../../managers/helpers');
const axios = require('axios'); // Import the axios library
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
const { PushNotification } = require('../../../managers/notifications')

const options = { day: '2-digit', month: 'short', year: 'numeric' };


module.exports = {

  // Verify OTP API
    getNotify : async (req, res) => {
        try {
            const notify = await models.NotifyModel.FlashNotify.find({});
            const notifyCount = notify.length;
            const user = req.user;
            if (!user) {
                return res.redirect('/admin/auth/login');
            }
            res.render('admin/settings/notify', { Title: "Notification list", user, notifyCount, notify , error: "Notification List" })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

    getAddNotify : async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.redirect('/admin/auth/login');
            }
            res.render('admin/settings/addNotify', { Title: "Add Notification", user, error: "Add New Notification" })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

    postAddNotify : async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
            const {title , message } = req.body;
            const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;
            const imgData = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}`

            if (!title || !message) {
              res.render('admin/settings/addNotify', { Title: "Add Notification", user, error: "Required Field Are Missing" })
            }
              const notificationData = {
                title,
                message,
                image: imgData,
              }

              const notification = new models.NotifyModel.FlashNotify(notificationData);
              await notification.save();

              console.log("Notification Added successfully");
              res.redirect('/admin/auth/settings/notification');

            res.render('admin/settings/addNotify', { Title: "Add Notification", user, error: "Add New Notification" })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

    getUpdateNotify : async (req, res) => {
      try {
          const user = req.user;
          console.log(req)
          const notify_id = req.params.id;
          console.log("Param -id ",notify_id);
          if (!user) {
              return res.redirect('/admin/auth/login');
          }

          const notification = await models.NotifyModel.FlashNotify.findOne({_id : notify_id });
          console.log(notification)
          res.render('admin/settings/updateNotify', { Title: "Add Notification", notification,user, error: "Add New Notification" })
      } catch (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
    },

    postUpdateNotify : async (req, res) => {
      try {
          const user = req.user;
          if (!user) {
            return res.redirect('/admin/auth/login');
          }

          const notify_id = req.params.id;
          const {title , message } = req.body;

          if (!title || !message) {
            res.render('admin/settings/updateNotify', { Title: "Add Notification", user, error: "Required Field Are Missing" })
          }
            const notificationData = {
              title,
              message
            }

            const notification = await models.NotifyModel.FlashNotify.findOne({_id : notify_id});

            if (req.files && req.files['image']) {
              if (notification.image) {
                ImgServices.deleteImageFile(notification.image);
              }
              notification.image = `${req.body.maincategory}/${req.body.subcategory}/${req.files['image'][0].filename}`;
            }

            notification.title = notificationData.title
            notification.message = notificationData.message
            await notification.save();

            console.log("Notification Added successfully");
            res.redirect('/admin/auth/settings/notification');

          res.render('admin/settings/addNotify', { Title: "Add Notification", user, error: "Add New Notification" })
      } catch (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
    },

    sendNotification : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        const notify_id = req.params.id;

          const notification = await models.NotifyModel.FlashNotify.findOne({_id : notify_id});
          const notify = await models.NotifyModel.FlashNotify.find({});
          const notifyCount = notify.length;

          const users = await models.UserModel.User.find({usertype : "Customer"});

          const userIds = users.map(user => user._id);

          console.log(userIds)
          const messageData = {
            title : notification.title,
            message : notification.message,
          }

          PushNotification.sendPushNotification(userIds, messageData)

          console.log("Notification Added successfully");

        res.render('admin/settings/notify', { Title: "Add Notification", user, notifyCount, notify,error: "Add New Notification" })
      } catch (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
    },

    getOtp : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }
        res.render('admin/settings/vehicleControl', { Title: "Vehicle Controls", user, error: "Vehicle Controls" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    setPrice: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        console.log("I am here");
    
        const loginData = {
          phone_number: user.phone
        };
    
        const userExists = await models.UserModel.User.findOne({ phone: loginData.phone_number });
    
        const otp = OtpHelper.generateOTP();
        OtpHelper.sendOTPToUser(loginData.phone_number, otp);
    
        const otpData = new models.UserModel.VehicleOtp({ phone: loginData.phone_number, otp: otp, status: "SETPRICE" });
        const result = await otpData.save();
        console.log("Result Saved");
    
        if (!result) {
          console.error('Error saving OTP data');
          const errorMessage = 'Failed to save OTP data';
          return res.redirect('/admin/settings/vehicleControl?errorMessage=' + encodeURIComponent(errorMessage));
        }
    
        const apiUrl = `https://module.logonutility.com/smsapi/index?key=2605B0EA308974&campaign=0&routeid=1&type=text&contacts=${loginData.phone_number}&senderid=TYSTST&msg=Welcome%20to%20Run%20for%20Heart%21%20Enter%20the%20OTP%20code%20${otp}%20to%20verify%20your%20account%20and%20get%20started.%20Regards%20The%20Yellow%20Strawberry`;
    
        axios.post(apiUrl)
          .then(response => {
            console.log("Posted And Sent");
            if (response.status === 200) {
              console.log('OTP sent successfully');
            } else {
              console.error('Failed to send OTP:', response.statusText);
            }
            console.log("time taking");
            const successMessage = 'OTP Sent successfully';
            return res.redirect(`/admin/auth/settings/vehicle-control?Success=${encodeURIComponent(successMessage)}`);
          })
          .catch(error => {
            console.error('Error posting OTP:', error);
            const errorMessage = 'Failed to send OTP';
            return res.redirect(`/admin/auth/settings/vehicle-control?error=${encodeURIComponent(errorMessage)}`);
          });
      } catch (error) {
        console.error('Error in setPrice:', error);
        // Handle the error as needed
      }
    },

    calibrate: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        console.log("I am here");
    
        const loginData = {
          phone_number: user.phone
        };
    
        const userExists = await models.UserModel.User.findOne({ phone: loginData.phone_number });
    
        const otp = OtpHelper.generateOTP();
        OtpHelper.sendOTPToUser(loginData.phone_number, otp);
    
        const otpData = new models.UserModel.VehicleOtp({ phone: loginData.phone_number, otp: otp, status: "SETPRICE" });
        const result = await otpData.save();
        console.log("Result Saved");
    
        if (!result) {
          console.error('Error saving OTP data');
          const errorMessage = 'Failed to save OTP data';
          return res.redirect('/admin/settings/vehicleControl?errorMessage=' + encodeURIComponent(errorMessage));
        }
    
        const apiUrl = `https://module.logonutility.com/smsapi/index?key=2605B0EA308974&campaign=0&routeid=1&type=text&contacts=${loginData.phone_number}&senderid=TYSTST&msg=Welcome%20to%20Run%20for%20Heart%21%20Enter%20the%20OTP%20code%20${otp}%20to%20verify%20your%20account%20and%20get%20started.%20Regards%20The%20Yellow%20Strawberry`;
    
        axios.post(apiUrl)
          .then(response => {
            console.log("Posted And Sent");
            if (response.status === 200) {
              console.log('OTP sent successfully');
            } else {
              console.error('Failed to send OTP:', response.statusText);
            }
            console.log("time taking");
            const successMessage = 'OTP Sent successfully';
            return res.redirect(`/admin/auth/settings/vehicle-control?error=${encodeURIComponent(successMessage)}`);
          })
          .catch(error => {
            console.error('Error posting OTP:', error);
            const errorMessage = 'Failed to send OTP';
            return res.redirect(`/admin/auth/settings/vehicle-control?error=${encodeURIComponent(errorMessage)}`);
          });
      } catch (error) {
        console.error('Error in setPrice:', error);
        // Handle the error as needed
      }
    },
    
    getCompany : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const companyList = await models.SettingModel.Company.find();
        
        res.render('admin/settings/company', { Title: "Company Lists", companyList, user, error: "Company Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postCompany : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const companyData = {
          name : req.body.name
        }

        console.log(companyData);

        const companyLists = await models.SettingModel.Company.findOne({name : companyData.name});

        console.log(companyLists)

        if(companyLists){
          const errorMessage = 'Company Name Already Exists';
          return res.redirect(`/admin/auth/settings/company-lists?error=${encodeURIComponent(errorMessage)}`);
        }


        const companyList = await models.SettingModel.Company(companyData);
        await companyList.save();

        const errorMessage = 'Company Added Successfully';
        return res.redirect(`/admin/auth/settings/company-lists?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    servingState : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const states = await models.SettingModel.State.find();
        
        res.render('admin/settings/state', { Title: "State Lists", states, user, error: "Serving State Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    updateState : async (req, res) => {
      try {
        const user = req.user;
        const stateId = req.params.stateId;
        const state = await models.SettingModel.State.findById(stateId);

        if (!user) {
            return res.redirect('/admin/auth/login');
        }
  
        res.render('admin/settings/update_state', { Title: "Update State Lists", state, user, error: "Serving State Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postupdateState : async (req, res) => {
      try {
        const user = req.user;
        const stateId = req.params.stateId;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const state = await models.SettingModel.State.findById(stateId);
        
        console.log(`statelist: ${state}`)

        state.name = req.body.update_state;
        await state.save();

        const errorMessage = 'States Updates Successfully';
        return res.redirect(`/admin/auth/settings/serving-states?success=${encodeURIComponent(errorMessage)}`);

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
    },

    servingDistricts : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const district = await models.SettingModel.District.find().populate('state_id');
        const stateList = await models.SettingModel.State.find();

        res.render('admin/settings/districts', { Title: "District Lists", stateList, district, user, error: "Serving Districts Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    updateDistricts : async (req, res) => {
      try {
        const user = req.user;
        const districtId = req.params.districtId;

        console.log(districtId)
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const district = await models.SettingModel.District.findById(districtId);
        const stateList = await models.SettingModel.State.find();

        console.log(district)

        res.render('admin/settings/update_district', { Title: "District Lists", stateList, district, user, error: "Updating Districts Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    servingAreas : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const stateLists = await models.SettingModel.State.find();
        const areaLists = await models.SettingModel.Area.find().populate("district_id");
        
        res.render('admin/settings/area', { Title: "Area Lists", stateLists, areaLists, user, error: "Serving Area Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    updateArea : async (req, res) => {
      try {
        const areaId = req.params.areaId;
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const stateLists = await models.SettingModel.State.find();
        const area = await models.SettingModel.Area.findById(areaId).populate("district_id");
        
        res.render('admin/settings/update_area', { Title: "Area Lists", stateLists, area, user, error: "updated Area Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    servingCities : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const stateLists = await models.SettingModel.State.find();
        const cityLists = await models.SettingModel.City.find().populate("district_id");
        
        res.render('admin/settings/city', { Title: "City Lists", stateLists, cityLists, user, error: "Serving City Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    updateCities : async (req, res) => {
      try {
        const user = req.user;
        const cityId = req.params.cityId;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const stateLists = await models.SettingModel.State.find();
        const city = await models.SettingModel.City.findById(cityId).populate("district_id");
        
        res.render('admin/settings/update_city', { Title: "City Lists", stateLists, city, user, error: "Update Serving City Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    servingCities : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const stateLists = await models.SettingModel.State.find();
        const cityLists = await models.SettingModel.City.find().populate("district_id");
        
        res.render('admin/settings/city', { Title: "City Lists", stateLists, cityLists, user, error: "Serving City Lists" })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postCity : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const cityData = {
          district_id : req.body.district,
          name : req.body.city,
          status : true
        }

        console.log(cityData);

        const cityLists = await models.SettingModel.City.findOne({name : cityData.name});

        console.log(cityLists)

        if(cityLists){
          const errorMessage = 'We Already Serve in this City';
          return res.redirect(`/admin/auth/settings/serving-cities?error=${encodeURIComponent(errorMessage)}`);
        }


        const cityList = await models.SettingModel.City(cityData);
        await cityList.save();

        const errorMessage = 'City Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-cities?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postupdateCities : async (req, res) => {
      try {
        const user = req.user;
        const cityId = req.params.cityId;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        console.log(req.body)
        console.log(`cityId: ${cityId}`)
        const cityLists = await models.SettingModel.City.findById(cityId);
        console.log(cityLists)
        cityLists.name = req.body.city
        cityLists.district_id = req.body.district

        await cityLists.save();

        const errorMessage = 'City Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-cities?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postArea : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const areaData = {
          district_id : req.body.district,
          name : req.body.area,
          price : req.body.price,
          status : true
        }

        console.log(areaData);

        const areaLists = await models.SettingModel.Area.findOne({name : areaData.name});

        console.log(areaLists)

        if(areaLists){
          const errorMessage = 'We Already Serve in this Area';
          return res.redirect(`/admin/auth/settings/serving-areas?error=${encodeURIComponent(errorMessage)}`);
        }


        const areaList = await models.SettingModel.Area(areaData);
        await areaList.save();

        const errorMessage = 'City Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-areas?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postupdateArea : async (req, res) => {
      try {
        const user = req.user;
        const areaId = req.params.areaId
        if (!user) {
            return res.redirect('/admin/auth/login');
        }
        console.log(areaId)

        const area = await models.SettingModel.Area.findById(areaId);

        console.log(area)
          area.district_id = req.body.district;
          area.name = req.body.area;
          area.price = req.body.price;

        await area.save();

        const errorMessage = 'City Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-areas?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postStates : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const statesData = {
          name : req.body.state
        }

        console.log(statesData);

        const stateLists = await models.SettingModel.State.findOne({name : statesData.name});

        console.log(stateLists)

        if(stateLists){
          const errorMessage = 'We Already Serve in this State';
          return res.redirect(`/admin/auth/settings/serving-states?error=${encodeURIComponent(errorMessage)}`);
        }


        const stateList = await models.SettingModel.State(statesData);
        await stateList.save();

        const errorMessage = 'States Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-states?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },
    
    postDistricts : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const districtData = {
          name : req.body.name,
          state_id : req.body.state
        }

        console.log(districtData);

        const districtLists = await models.SettingModel.District.findOne({name : districtData.name , state_id: districtData.state_id});

        console.log(districtLists)

        if(districtLists){
          const errorMessage = 'We Already Serve in this District';
          return res.redirect(`/admin/auth/settings/serving-districts?error=${encodeURIComponent(errorMessage)}`);
        }


        const districtList = await models.SettingModel.District(districtData);
        await districtList.save();

        const errorMessage = 'District Added Successfully';
        return res.redirect(`/admin/auth/settings/serving-districts?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    postupdateDistricts : async (req, res) => {
      try {
        const user = req.user;
        const districtId = req.params.districtId
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const districtList = await models.SettingModel.District.findById(districtId);

        districtList.name = req.body.name
        districtList.state= req.body.state
        await districtList.save();

        const errorMessage = 'District Updated Successfully';
        return res.redirect(`/admin/auth/settings/serving-districts?success=${encodeURIComponent(errorMessage)}`);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    },

    getDistricts : async ( req, res ) =>{
      try {
          const stateId = req.query.state_id;
          console.log(stateId);
          const district = await models.SettingModel.District.find({ state_id: stateId });
          res.json(district);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  },

    getDistrictsList : async ( req, res ) =>{
        try {
            const state = req.query.state;
            console.log(state);
            const states = await models.SettingModel.State.find({ name : state });
            console.log(states)
            const state_id = states[0]._id ; 
            console.log(state_id)
            const District = await models.SettingModel.District.find({ state_id : state_id });
            // console.log(area)
            res.json(District);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getCityList : async ( req, res ) =>{
        try {
            const district = req.query.district;
            console.log(district);
            const districts = await models.SettingModel.District.find({ name : district });
            console.log(districts)
            const district_id = districts[0]._id ; 
            console.log(district_id)
            const City = await models.SettingModel.City.find({ district_id : district_id });
            // console.log(area)
            res.json(City);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getAreaList : async ( req, res ) =>{
        try {
            const district = req.query.district;
            console.log(district);
            const districts = await models.SettingModel.District.find({ name : district });
            console.log(districts)
            const district_id = districts[0]._id ; 
            console.log(district_id)
            const Area = await models.SettingModel.Area.find({ district_id : district_id });
            res.json(Area);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateAreaPrice : async (req, res) => {
      try {
          const areaId = req.body.areaId;
          const updated_price = req.body.updated_price;
          // Find the branch in the database by ID
          const area = await models.SettingModel.Area.findById(areaId);
      
          if (!area) {
              // Branch not found in the database
              return res.status(404).send('User not found');
          }
      
          // Toggle the status (true to false or false to true) and save the updated branch
          area.price = updated_price;
          await area.save();
          
          console.log(`Database value updated successfully`);
          res.json({ status: updated_price }); // Respond with the updated status
      } catch (err) {
        console.error('Error updating database value: ', err);
          res.status(500).send('Error updating database value');
      }
  },

  setup : async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
          return res.redirect('/admin/auth/login');
      }

      const generalData = await models.SettingModel.GeneralData.find();
      
      res.render('admin/settings/setup.ejs', { Title: "General Settings", generalData, user, error: "General Settings" })
  } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
  }
  },
  
  postSetup: async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect('/admin/auth/login');
        }

        const imageFilename = req.files && req.files['image'] ? req.files['image'][0].filename : (req.file ? 'defualts/default.jpg' : null);
        const imgdata = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}`

        const { app_name, app_email, email_password } = req.body;

        const generalDatas = {
            name: app_name,
            email: app_email,
            password: email_password,
            logo_image: imgdata,
        };

        const data = await models.SettingModel.GeneralData.find();
        const generalData = data[0];
        let existingData = await models.SettingModel.GeneralData.findOne({ name: generalDatas.name });

        if (existingData) {
            console.log("Data already available, updating...");
            existingData.email = generalDatas.email;
            existingData.password = generalDatas.password;
            existingData.logo_image = generalDatas.logo_image;
            await existingData.save();
            res.render('admin/settings/setup.ejs', { Title: "General Settings", generalData, user, error: "Profile Updated" });
        } else {
            console.log("Creating new profile...");
            const profile = new models.SettingModel.GeneralData(generalDatas);
            await profile.save();
            res.render('admin/settings/setup.ejs', { Title: "General Settings", generalData, user, error: "Profile Created" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
},

  getCustomerCare : async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
          return res.redirect('/admin/auth/login');
      }

      const care = await models.SettingModel.CustomerCare.find({});
      res.render('admin/settings/customer-care', { Title: "Customer Care", user, error: "Customer Care" ,care})
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }    
  },

  postCustomerCare : async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
          return res.redirect('/admin/auth/login');
      }
      const { name, phone, whatsapp } = req.body;

      const check = await models.SettingModel.CustomerCare.findOne({ phone });
      if (check) {
        return res.redirect('/admin/auth/settings/customer-care?error=Customer Care Already Exists');
      }
      const customerCare = new models.SettingModel.CustomerCare({ name, phone, whatsapp });
      await customerCare.save();
      res.redirect('/admin/auth/settings/customer-care?success=Customer Care Added Successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
  },

  getUpdateCustomerCare : async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
          return res.redirect('/admin/auth/login');
      }
      const care_id = req.params.care_id;
      const care = await models.SettingModel.CustomerCare.findById(care_id);
      res.render('admin/settings/update_care', { Title: "Update Customer Care", user, error: "Update Customer Care", care });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
  },
  updateCustomerCare : async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
          return res.redirect('/admin/auth/login');
      }
      const care_id = req.params.care_id;
      const { name, phone, whatsapp} = req.body;
      const customerCare = await models.SettingModel.CustomerCare.findById(care_id);
      customerCare.name = name;
      customerCare.phone = phone;
      customerCare.whatsapp = whatsapp;
      await customerCare.save();
      res.redirect('/admin/auth/settings/customer-care?success=Customer Care Updated Successfully');

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
  },
  getCustomer : async (req, res) => {
    try {
      const user = req.user;

      const updateResult = await models.UserModel.User.updateMany(
        { profile: 'images/user/default_profile.png' },
        { $set: { profile: 'user/default_profile.png' } }
      );
      
      const customer = await models.UserModel.User.find({
        profile: 'user/default_profile.png'
      });

      const count = customer.length;
      res.send({ count : count,  customer : customer })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
  }
}
