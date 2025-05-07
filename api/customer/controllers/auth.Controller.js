const jwt = require('jsonwebtoken');
const fs = require('fs'); // Import the 'fs' module for file operations
const bcrypt = require('bcrypt');
const { promisify } = require('util');  
const axios = require('axios'); // Import the axios library
const { v4: uuidv4 } = require('uuid');
const {
  ImgServices
} = require('../../../managers/services');
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
const { Whatsapp } = require('../../../managers/whatsapp');
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

function createCreditTransactionId(type ,serialNumber) {
  const uuid = uuidv4(); // Generate a Version 4 UUID
  const shortUuid = uuid.slice(0, 5); // Take the first 5 characters of the UUID
  const paddedSerialNumber = String(serialNumber).padStart(3, '0'); // Ensure serial number is three digits
  return `${type}-${shortUuid}-${paddedSerialNumber}`;
}

module.exports = {
// User Login API
  login : async (req, res) => {
    const loginData = {
      phone_number: req.body.phone,
    };
    
    // // Remove spaces and the country code +91 if present
    // loginData.phone_number = loginData.phone_number.replace(/\s+/g, ''); // Remove all spaces
    // console.log(loginData.phone_number)
    // if (loginData.phone_number.startsWith('+91')) {
    //   loginData.phone_number = loginData.phone_number.slice(3); // Remove +91
    // }

    // Remove spaces from phone number
    loginData.phone_number = loginData.phone_number.replace(/\s+/g, '');
    console.log("Raw phone number:", loginData.phone_number);
  
    // Optionally remove country code for internal storage but prepare formatted number for SMS
    let formattedPhone = loginData.phone_number;
    if (formattedPhone.startsWith('+91')) {
      formattedPhone = formattedPhone.slice(3); // Remove +91 for storage if needed
    }
    // When sending SMS, add +91 back if it’s not present
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }
    console.log("Formatted phone for SMS:", formattedPhone);
  
    console.log("Request body:", req.body);
    const validationResult = Validator.validate(loginData, {
      phone_number: {
          presence: { allowEmpty: false },
          numericality: { onlyInteger: true },
          length: { minimum: 10,  maximum: 10 }
      }
    });
    if (validationResult) {
      return res.status(StatusCodesConstants.BAD_REQUEST).json({
        status: false,
        status_code: StatusCodesConstants.BAD_REQUEST,
        message: validationResult, // Include the validation result in the response if needed
      });
    }

    try {
      // Check if the mobile number exists in the database
      const userExists = await models.UserModel.User.findOne({ phone: loginData.phone_number });

      if (!userExists) {
        const otp = OtpHelper.generateOTP();
        OtpHelper.sendOTPToUser(loginData.phone_number, otp);
        const otpData = new models.UserModel.Otp({ phone : loginData.phone_number, otp : otp})
        await otpData.save();
        // const apiUrl = `https://smspanel.tysindia.com/smsapi/index?key=365FBFC8358994&campaign=2913&routeid=1&type=text&contacts=${loginData.phone_number}&senderid=JOSHAC&msg=Dear%20User,%0A%0APlease%20use%20this%20OTP:%20${otp}%20for%20Login%20Authentication.%0A%0ARegards,%0AJosh%20Fuel%20App`
        // const response = await axios.post(apiUrl);

        let params = {
          type : "Otp Sent",
          otp : otp
        }

        const response = await Whatsapp.elseCase(params, loginData.phone_number);

        // const smsData = {
        //   to: formattedPhone,
        //   sender: 'JOSHAC',
        //   service: 'SE',
        //   template_id: '1207171049110056516',
        //   message : `Dear User, Please use this OTP:${otp} for Login. Regards Josh Fuel  App`
        // };

        // const apiUrl = 'https://api-panel.tysindia.com/v1/sms/messages';
        // const response = await axios.post(apiUrl, smsData, {
        //   headers: {
        //     'Authorization' : 'Bearer a044dac93238456e1cc87973b7bed444', 
        //     'Content-Type': 'application/json'
        //   }
        // });
        
        if (response.success === true || response.status === 200) {
          console.log('OTP sent successfully');
        } else {
            console.error('Failed to send OTP:', response);
        }

        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'User Not Found, Please register first.',
          data: {phone_number : loginData.phone_number,  otp }
        });
      }

      if(loginData.phone_number == "9870878040"){
        const otp = "1234";
        OtpHelper.sendOTPToUser(loginData.phone_number, otp);
        const otpData = new models.UserModel.Otp({ phone : loginData.phone_number, otp : otp})
        await otpData.save();
        let params = {
          type : "Otp Sent",
          otp : otp
        }

        const response = await Whatsapp.elseCase(params, loginData.phone_number);
        
        if (response.success === true || response.status === 200) {
          console.log('OTP sent successfully');
        } else {
            console.error('Failed to send OTP:', response);
        }

        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'User Found and OTP sent successfully',
          data: {phone_number : loginData.phone_number,  otp}
        });
      }else{
        // Generate and send OTP
        const otp = OtpHelper.generateOTP();
        OtpHelper.sendOTPToUser(loginData.phone_number, otp);
        const otpData = new models.UserModel.Otp({ phone : loginData.phone_number, otp : otp})
        await otpData.save();
        let params = {
          type : "Otp Sent",
          otp : otp
        }

        const response = await Whatsapp.elseCase(params, loginData.phone_number);

        // Prepare the SMS data payload
        // const smsData = {
        //   to: formattedPhone,
        //   sender: 'JOSHAC',
        //   service: 'SE',
        //   template_id: '1207171049110056516',
        //   message : `Dear User, Please use this OTP:${otp} for Login. Regards Josh Fuel  App`
        // };

        // const apiUrl = 'https://api-panel.tysindia.com/v1/sms/messages';
        // const response = await axios.post(apiUrl, smsData, {
        //   headers: {
        //     'Authorization' : 'Bearer a044dac93238456e1cc87973b7bed444', 
        //     'Content-Type': 'application/json'
        //   }
        // });
        
        console.log("response------",response)
        if (response.success === true || response.status === 200) {
          console.log('OTP sent successfully');
        } else {
            console.error('Failed to send OTP:', response);
        }
        
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'User Found and OTP sent successfully',
          data: {phone_number : loginData.phone_number,  otp}
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ status: false, status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR, message: MessageConstants.INTERNAL_SERVER_ERROR, data: {} });
    }
  },

// Verify OTP API
  verifyOTP : async (req, res) => {
    const verifyData = {
      phone_number: req.body.phone,
      otp : Number(req.body.otp)
    };

    const validationResult = Validator.validate(verifyData, {
      phone_number: {
          presence: { allowEmpty: false },
          numericality: { onlyInteger: true },
          length: { minimum: 10,  maximum: 10 }
      },
      otp: {
        presence: { allowEmpty: false },
      },
    });
    if (validationResult) {
      return res.status(StatusCodesConstants.BAD_REQUEST).json({
        status: false,
        status_code: StatusCodesConstants.BAD_REQUEST,
        message: MessageConstants.VALIDATION_ERROR,
        message: validationResult, // Include the validation result in the response if needed
      });
    }


    try {
      // Fetch the secret key from the environment variables
      console.log("Verifying Otp ------")
      console.log("Verifying phone ------", verifyData.phone_number)
      console.log("Verifying Otp ------", typeof verifyData.otp)

      // Verify the JWT token
      const otpHolder = await models.UserModel.Otp.find({
        phone : verifyData.phone_number
      })
      console.log("Verifying otpHolder ------", otpHolder)

      if(otpHolder.length === 0){
        return res.status(StatusCodesConstants.BAD_REQUEST).json(
          { status: false, status_code: StatusCodesConstants.BAD_REQUEST, message: 'You entered an Expired OTP!'});
      }

      const decoded = otpHolder[otpHolder.length - 1];

      console.log(decoded)
      console.log(decoded.phone)
      console.log(decoded.phone === verifyData.phone_number)
      console.log(Number(decoded.otp))
      console.log(Number(decoded.otp) === verifyData.otp)
      
      // Check if the phone number and OTP match the decoded values
      if (decoded.phone === verifyData.phone_number && Number(decoded.otp) === verifyData.otp) {
        // OTP is correct, check if the user's address is confirmed or not
        const user = await models.UserModel.User.findOne({ phone: verifyData.phone_number });

        if (!user) {
          // Phone number not found, redirect the user to the registration page
          return res.status(StatusCodesConstants.SUCCESS).json({ status: true, status_code: StatusCodesConstants.SUCCESS, message: 'Mobile Number verified Successfully, Please Register first', data: {} });
          // Alternatively, you can redirect the user using a redirect URL
          // res.redirect('/register');
        }
        const userData = {
          profile: user.profile,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone,
          company: user.company,
          is_privilaged: user.is_privilaged,
        };

        const isAddressConfirmed = await models.UserModel.User.checkIfAddressConfirmed(verifyData.phone_number);
        if (!isAddressConfirmed) {
          const token = AuthMiddleware.generateAccessToken(user)
          console.log("Token ---- ",token)
          return res.status(StatusCodesConstants.SUCCESS).json({ status: true, status_code: StatusCodesConstants.SUCCESS, message: 'Address Not Confirmed', data: { userData, token} });
        }
        // Address confirmed, log the user in (you can implement login logic here) and redirect to the dashboard

        const token = AuthMiddleware.generateAccessToken(user)
        console.log("Token ---- ",token)
        return res.status(StatusCodesConstants.SUCCESS).json({ status: true, status_code: StatusCodesConstants.SUCCESS, message: 'User Found Successfully', data: { userData , token} });
      } else {
        // Invalid OTP, return an error message
        return res.status(StatusCodesConstants.BAD_REQUEST).json({ status: false, status_code: StatusCodesConstants.BAD_REQUEST, message: 'Invalid OTP', data: {} });
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ status: false, status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR, message: MessageConstants.INTERNAL_SERVER_ERROR, data: {} });
    }
  },

// Register API
  register : async (req, res) => {
    try {
      const userDataInput = {
        token: uuidv4(),
        profile: 'user/default_profile.png',
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
        is_active: true,
        is_mobile_verified: true,
        password: await bcrypt.hash('1234@user', 10),
        phone: req.body.phone,
        company: req.body.company,
        gst_no: req.body.gst_no || '27XXXXXXXXXX19',
        usertype: 'Customer',
        accept_term: req.body.accept_term,
      };


      const validationResult = Validator.validate(userDataInput, {
        first_name: {
          presence: { allowEmpty: false },
          length: { minimum: 3, maximum: 20 },
        },
        last_name: {
          presence: { allowEmpty: false },
          length: { minimum: 3, maximum: 20 },
        },
        company: {
          presence: { allowEmpty: false },
          length: { minimum: 3, maximum: 100 },
        },
        accept_term: {
          presence: { allowEmpty: false },
        },
        email: {
          presence: { allowEmpty: false },
          email: true,
        },
        phone:{
          presence: { allowEmpty: false },
          numericality: { onlyInteger: true },
          length: { minimum: 10, maximum: 10 },
        },
      })

      if (validationResult) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: validationResult, // Include the validation result in the response if needed
        });
      }

      const existingUserByEmail = await models.UserModel.User.findOne({ email: userDataInput.email });
      if (existingUserByEmail) {
        return res.status(StatusCodesConstants.RESOURCE_EXISTS).json({
          status: false,
          status_code: StatusCodesConstants.RESOURCE_EXISTS,
          message: 'Email Already Used',
          data: {},
        });
      }

      const existingUserByPhone = await models.UserModel.User.findOne({ phone: userDataInput.phone });
      if (existingUserByPhone) {
        return res.status(StatusCodesConstants.RESOURCE_EXISTS).json({
          status: false,
          status_code: StatusCodesConstants.RESOURCE_EXISTS,
          message: 'Phone Number Already Used',
          data: {},
        });
      }

      // Check if the maximum number of users for the company has been reached
      const usersInCompany = await models.UserModel.User.countDocuments({ company: userDataInput.company });
      const maxUsersPerCompany = 5; // Set your maximum limit here

      if (usersInCompany >= maxUsersPerCompany) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Maximum number of users for the company reached. Please Contact Admin',
          data: {},
        });
      }
      const newUser = new models.UserModel.User(userDataInput);
      const savedUser = await newUser.save();


      const userData = {
        profile: savedUser.profile,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        email: savedUser.email,
        phone_number: savedUser.phone,
        company: savedUser.company,
        gst_no: savedUser.gst_no,
      };

      const newToken = AuthMiddleware.generateAccessToken(savedUser)

      const verifyToken = AuthMiddleware.verifyAccessToken(newToken)
      console.log(verifyToken)

      const walletData = {
        user_id : newUser._id,
      }

      const newWallet = new models.UserModel.Wallet(walletData);
      const transaction = await models.UserModel.Wallet.find();
      const walletLength = transaction.length;
      const number = walletLength + 1;

      const transactionData = {
        transaction_id: createCreditTransactionId("CRED", number),
        wallet_id: newWallet._id,
        credited: newWallet.total_credit,
        available: newWallet.total_credit,
        status: true
      };
  
      const newTranscation = new models.UserModel.Transaction(transactionData);
  
      await newWallet.save();
      await newTranscation.save();


      await models.UserModel.User.findOneAndUpdate(
          { _id: newUser._id },
          { has_wallet : true }
      );
      
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'User registered successfully',
        data: { userData , token: newToken },
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


// Get User Data
  getUser : async (req, res) => {
    try {
      const session = req.user;
      user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      // Fetch the full data of user
      const user = await models.UserModel.User.findOne({ _id : user_id });
      if (!user) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'User Not Found',
        });
      }

      // Fetch device data associated with the user_id from the found user
      const devices = await models.UserModel.Device.find({ user_id: user_id });

      // Fetch address data associated with the user_id from the found user
      const addresses = await models.UserModel.Address.find({ user_id: user_id , primary : true});

      // Check if there are any addresses
      const address = addresses[0];

      // Combine the fetched data into a single response
      const data = {
        userData : user,
        devices,
        address,
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

  // Email Verification
  sendEmail: async (req, res) => {
    try {
      const session = req.user;
  
      console.log("Request to send email clicked");
      
      if (!session || !session.userId) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        });
      }
  
      const recipientEmail = session.email;
      const subject = 'Email Verification';
      const token = "534212";
      const recipientName = session.first_name +  session.last_name; 
      const templateFilePath = path.join(__dirname, Mailer.verifyEmail);


      console.log(recipientName);

    // Read the email template file
      const emailTemplateContent = await promisify(fs.readFile)(templateFilePath, 'utf8');

      // Replace placeholders in the email template with actual values
      const replacedEmailTemplate = emailTemplateContent
        .replace('{name}', recipientName)
        .replace('{token}', token);
  
  
      // Send the email and wait for it to complete
      const emailResult = await Mailer.sendCustomMail(recipientEmail, subject, replacedEmailTemplate);
  
      // Check the email sending result and then send the HTTP response
      if (emailResult.success) {
        res.status(StatusCodesConstants.SUCCESS).json({ message: 'OTP email sent successfully' });
      } else {
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
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

  getProfile : async (req, res) => {
    try {
      const session = req.user;
      user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }

      // Fetch the full data of user
      const user = await models.UserModel.User.findOne({ _id : user_id });
      if (!user) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'User Not Found',
        });
      }

      const responseData = {
        profile_img: user.profile,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        email: user.email,
        phone_number: user.phone,
        gst_no: user.gst_no,
      };

      const message = "Hello User"

      PushNotification.sendPushNotification(user_id, message)

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

  updateProfile: async (req, res) => {
    try {
      const session = req.user;
      const user_id = session.userId;
      if (!user_id) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        })
      }
  
      const userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone_number: req.body.phone,
        company: req.body.company,
        gst_no: req.body.gst_no,
      };
  
      // Fetch the full data of user
      const user = await models.UserModel.User.findOne({ _id: user_id });
      if (!user) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'User Not Found',
        });
      }
  
      user.first_name = userData.first_name || user.first_name;
      user.last_name = userData.last_name || user.last_name;
      user.email = userData.email || user.email;
      user.phone = userData.phone || user.phone;
      user.company = userData.company || user.company;
      user.gst_no = userData.gst_no || user.gst_no;
  
      await user.save();
      
      const user_token = req.token ;
  
      if (user_token) {
        // Add the token to the revokedTokens set to invalidate it
        initializeRevokedTokens(user_id, user_token);
        console.log(initializeRevokedTokens)
      
      }

        const newToken = AuthMiddleware.generateAccessToken(user)

        const verifyToken = AuthMiddleware.verifyAccessToken(newToken)
        console.log("token refreshed")
        console.log("New Token",newToken)
        console.log("Verify Token",verifyToken)

      const responseData = {
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        email: user.email,
        phone_number: user.phone,
      };
  
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'User data updated successfully',
        data: responseData,
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

  updatePhoto : async (req, res) =>{
    try {
      const session = req.user;
      const user_id = session.userId;
  
      const imageFiles = req.files['profile'];
  
      if (!user_id) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Please Login First',
        });
      }
  
      // Fetch the full data of the user
      const user = await models.UserModel.User.findOne({ _id: user_id });
      if (!user) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'User Not Found',
        });
      }
  
      // Check if a profile file is provided
      if (!imageFiles || imageFiles.length === 0) {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: 'Profile image file is missing',
        });
      }
  
      // The image path is now available in req.files['profile'][0].filename
      const imageFilename = req.body.filename;
  
      // Delete the previous image file before updating with the new one
      if (user.profile) {
        ImgServices.deleteImageFile(user.profile);
      }
  
      // Update the user profile with the new image filename
      user.profile = imageFilename;
  
      // Save the updated user to the database
      await user.save();
  
      const responseData = {
        profile: user.profile,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        email: user.email,
        phone_number: user.phone,
      };
  
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'User data fetched successfully',
        data: responseData,
      });
    } catch (error) {
      console.error(error);
  
      // Handle Mongoose validation error
      if (error.name === 'ValidationError') {
        return res.status(StatusCodesConstants.BAD_REQUEST).json({
          status: false,
          status_code: StatusCodesConstants.BAD_REQUEST,
          message: error.message,
        });
      }
  
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
  
  },

  verifyMobileAndGenerateToken: async (req, res) => {
    const phone_number = req.body.phone;
  
    const validationResult = Validator.validate({ phone_number }, {
      phone_number: {
        presence: { allowEmpty: false },
        numericality: { onlyInteger: true },
        length: { minimum: 10, maximum: 10 }
      },
    });
  
    if (validationResult) {
      return res.status(StatusCodesConstants.BAD_REQUEST).json({
        status: false,
        status_code: StatusCodesConstants.BAD_REQUEST,
        message: MessageConstants.VALIDATION_ERROR,
        errors: validationResult,
      });
    }
  
    try {
      const user = await models.UserModel.User.findOne({ phone: phone_number });
  
      if (!user) {
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: 'User not found',
          data: {},
        });
      }
  
      const userData = {
        profile: user.profile,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone,
        company: user.company,
        is_privilaged: user.is_privilaged,
      };
  
      // Generate an access token directly
      const token = AuthMiddleware.generateAccessToken(user);
  
      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Access Token Generated Successfully',
        data: { userData, token },
      });
    } catch (error) {
      console.error('Error during mobile number verification:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
        data: {},
      });
    }
  },

  storeMobileandToken : async ( req, res) =>{
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

      const whatsappData = {
        phone_number : req.body.phone,
        token : req.body.token,
        status : true
      }

      console.log(whatsappData);

      const existingData = await models.SettingModel.WhatsappData.findOne({ phone_number : whatsappData.phone_number});

      if(existingData){
        const existingData = await models.SettingModel.WhatsappData.findOne({ phone_number : whatsappData.phone_number});
        existingData.token = whatsappData.token;
        await existingData.save();
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: 'Token updated successfully',
          data: { existingData },
        });
      }

      const whatData = await models.SettingModel.WhatsappData(whatsappData);
      const savedData = await whatData.save();

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Token Stored successfully',
        data: { savedData },
      });
    }catch(error){
      console.error(error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
        status: false,
        status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
        message: MessageConstants.INTERNAL_SERVER_ERROR,
      });
    }
  },

  getCompanyLists : async (req, res) => {
    try{
      const companyData = await models.SettingModel.Company.find();

      return res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: 'Company Lists Fetched Successfully',
        data: { companyData },
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

