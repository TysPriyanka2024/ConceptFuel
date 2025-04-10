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
  JwtService,
  UserService,
} = require('../../../managers/services');
const { generateAccessToken} = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');

// This would be your token blacklist storage
const tokenBlacklist = new Set();

const options = { day: '2-digit', month: 'short', year: 'numeric' };

module.exports = {

  // Verify OTP API
    getLogin : async (req, res) => {
        res.render('a-login',{
          title: "Branch" ,
          redirect : "admin" ,
          error: "Welcome to Branch Login"
        })
    },

  // User Login API
    verifyLogin : async (req, res) => {
      const loginData = {
        email: req.body.email,
        password: req.body.password,
        remember: req.body.remember,
      };

      console.log(loginData)
      try {
          // Check if the mobile number exists in the database
          const userExists = await models.BranchModel.Branch.findOne({ email: loginData.email });

          console.log(userExists)

          if (!userExists) {
              return res.redirect(`/branch/auth/login?error=User Not Found${encodeURIComponent(loginData.email)}`);
          }

          // Generate and send OTP
          const isPasswordValid = await bcrypt.compare(loginData.password, userExists.password);

          if (!isPasswordValid) {
              return res.redirect(`/branch/auth/login?error=Invalid email or password&email=${encodeURIComponent(loginData.email)}`);
          }

          // Check if the user's usertype is "admin"
          if (userExists.usertype !== 'Branch') {
              return res.redirect('/branch/auth/login?error=You do not have permission to access the admin panel.');
          }
          const token = generateAccessToken(userExists)
          
          //  Set the token as a cookie or in the response body, depending on your preference
          if (loginData.remember) {
            res.cookie('jwt',  token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true }); 
          } else {
            res.cookie('jwt', token, { httpOnly: true });
          }
          res.return = token;
          
          return res.redirect('/branch/auth/dashboard');
    
      } catch (error) {
        console.error('Error during login:', error);
        return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ status: false, status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR, message: MessageConstants.INTERNAL_SERVER_ERROR, data: {} });
      }
    },
  
  // User Dashboard API
    getdashboard : async (req, res) => {
      const user = req.user;
      const userId = user.userId;
      
      if(!user){
        res.redirect('branch/auth/login')
      }

      console.log(user)

      const orderInfo = await models.BranchModel.Order.find({branch_id: userId});
      const allOrders = orderInfo.length;

      const products = await models.BranchModel.BranchProduct.find({branch : userId});
      const allProducts = products.length;

      const users = await models.UserModel.User.find({usertype: "Customer"});
      const allCustomers = users.length;

      const addOn = await models.ProductModel.AddOn.find();

      const orderDetail = await models.BranchModel.Order.aggregate([
        {
          $match: {
            status: "Delivered",
            payment_status: true
          }
        },
        {
          $unwind: "$product_items" // Unwind the product_items array
        },
        {
          $group: {
            _id: "$product_items.product_id",
            totalRevenue: { $sum: "$grand_total" },
            totalQuantity: { $sum: "$product_items.quantity" }
          }
        }
      ]);
      
            // Now you can access product quantities dynamically
            const totalRevenue = orderDetail.length > 0 ? orderDetail[0].totalRevenue : 0;
            const totalQuantity = orderDetail.length > 0 ? orderDetail[0].totalQuantity : 0;
      
            console.log("Total Revenue for Delivered Orders with Payment Status True: " + totalRevenue);

      error = "You are successfully logged in"
      res.render('branch/dashboard', { options, allOrders, allProducts, orderDetail,totalRevenue, totalQuantity, allCustomers , products, addOn ,user: user, error})
    },

  // User Logout API
    logout:(req, res) => {
      try {
        // Clear the user session
        const user = req.user;

        res.clearCookie('jwt'); // Clear the JWT cookie

        if(!user){
          res.redirect('admin/auth/login')
        }

      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send('An error occurred during logout.');
      }
    }

}

