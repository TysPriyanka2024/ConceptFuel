const {
  MessageConstants,
  StatusCodesConstants,
  
} = require('../constants');
const { AuthMiddleware } = require('../middlewares');
const { Validator, ApiError } = require('../../../managers/utils');
const { generateAccessToken } = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');



module.exports = {
// Get Nearest branch
  getNearestBranch : async (req, res) => {
    try {
      const session = req.user;
      const user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.ACCESS_DENIED).json({
          status: false,
          status_code: StatusCodesConstants.ACCESS_DENIED,
          message: MessageConstants.NOT_LOGGED_IN,
        })
      }

      console.log(user_id)
      // Fetch user's city based on the sessions user_id
      const user_city = await models.UserModel.Address.findOne({ user_id: user_id , primary : true});

      console.log("User's City ----- ",user_city.area);

      const district_of_city = await models.SettingModel.Area.find({ name : user_city.area}).populate('district_id');
      console.log(district_of_city)

      if(!district_of_city || district_of_city.length === 0){
        return res.status(StatusCodesConstants.SUCCESS).json({ 
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.BRANCH_NOT_IN_AREA,
          data : []
         });
      }
      console.log(district_of_city);
      const district = district_of_city[0].district_id.name;
      
      const branchesInDistrict = await models.BranchModel.Branch.find({ district :  district});

      console.log(branchesInDistrict);

      if (!branchesInDistrict || branchesInDistrict.length === 0) {
        return res.status(StatusCodesConstants.SUCCESS).json({ 
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.BRANCH_NOT_IN_AREA,
          data : []
         });
      }

      res.status(StatusCodesConstants.SUCCESS).json({
        status: true,
        status_code: StatusCodesConstants.SUCCESS,
        message: MessageConstants.BRANCH_FETCHED_SUCCESSFULLY,
        data: branchesInDistrict,
      });
  } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
  }
  },

// Get Branch Products
  branchProducts : async (req, res) => {
    try {
      const session = req.user;
      const user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.ACCESS_DENIED).json({
          status: false,
          status_code: StatusCodesConstants.ACCESS_DENIED,
          message: MessageConstants.NOT_LOGGED_IN,
        })
      }

      console.log(user_id)
      // Fetch user's city based on the sessions user_id
      const user_city = await models.UserModel.Address.findOne({ user_id: user_id , primary : true});

      if(!user_city){
        return res.status(StatusCodesConstants.SUCCESS).json({ 
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.ADDRESS_NOT_PRESENT,
          data : []
         });
      }

      console.log("User's City ----- ",user_city.area);

      const district_of_city = await models.SettingModel.Area.find({ name : user_city.area}).populate('district_id');
      console.log(district_of_city)

      if(!district_of_city || district_of_city.length === 0){
        return res.status(StatusCodesConstants.SUCCESS).json({ 
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.BRANCH_NOT_IN_AREA,
          data : {}
         });
      }
      console.log(district_of_city);
      const district = district_of_city[0].district_id.name;
      
      const branchesInDistrict = await models.BranchModel.Branch.find({ district :  district});

      console.log(branchesInDistrict);
      
      const branchIds = branchesInDistrict.map(branch => branch._id);

      console.log("This is Branch Ids",branchIds)
  
      const productsData = await models.BranchModel.BranchProduct.find({ branch: branchIds[0] , is_selling : true});

      console.log(productsData)
      var customer_price = 0;
      const modifiedProductsData = productsData.map(product => {
        if (district_of_city[0].price > 0) {
          product.branch_price = district_of_city[0].price;
          customer_price = parseFloat(district_of_city[0].price);
        }
  
    
        return product;
      });

      const userData = await models.UserModel.User.findById(user_id)

      if(userData.is_privilaged === true){
        const overall_discount = (userData.discount + userData.volume_discount + userData.card_discount).toFixed(2);
        console.log(overall_discount)
        console.log(customer_price)
        customer_price = (customer_price + parseFloat(overall_discount));
      }
      
      const responseData = {
        productsData : modifiedProductsData,
        customer_price : customer_price
      }

      if(!productsData || productsData.length === 0){
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.PRODUCT_NOT_PRESENT,
          data: {},
        });
      }else{
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.PRODUCT_FETCHED_SUCCESSFULLY,
          data: responseData,
        });
      }
  
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
    }
  },

  getDeliveryFees : async (req, res) => {
    try {
      const session = req.user;
      const user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.ACCESS_DENIED).json({
          status: false,
          status_code: StatusCodesConstants.ACCESS_DENIED,
          message: MessageConstants.NOT_LOGGED_IN,
        })
      }

      console.log(user_id)
      const user_data = await models.UserModel.User.findOne({_id : user_id})

      const DeliveryFeesData = {
        delivery_fee : user_data.delivery_fee
      } ;

      if(!DeliveryFeesData || DeliveryFeesData.length === 0){
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.DELIVERY_FEES_NOT_PRESENT,
          data: {},
        });
      }else{
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.DELIVERY_FEES_FETCHED_SUCCESSFULLY,
          data: DeliveryFeesData,
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
    }
  },

  getCustomerCare : async (req, res) => {
    try{
      const session = req.user;
      const user_id = session.userId;
      if(!user_id){
        return res.status(StatusCodesConstants.ACCESS_DENIED).json({
          status: false,
          status_code: StatusCodesConstants.ACCESS_DENIED,
          message: MessageConstants.NOT_LOGGED_IN,
        })
      }

      const customerCare = await models.SettingModel.CustomerCare.findOne({});
      if(!customerCare || customerCare.length === 0){
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.CUSTOMER_CARE_NOT_PRESENT,
          data: {},
        });
      }else{
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.CUSTOMER_CARE_FETCHED_SUCCESSFULLY,
          data: customerCare,
        });
      }
    }catch(error){
      console.error('Error fetching data:', error);
      return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
    }
  }
}


