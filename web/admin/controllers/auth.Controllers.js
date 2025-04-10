const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { format, addDays, isSameISOWeek, getISOWeek } = require('date-fns');

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
      // const generalData = await models.SettingModel.GeneralData.find();
      const generalData =  await models.UserModel.User.find();
      console.log("get general data----",generalData[0])
      const data = generalData[0];
      console.log("data from getLogin---------------------",data)
        res.render('a-login',{
          title: "admin" ,
          redirect : "branch" ,
          data,
          error: "Welcome to Login"
        })
    },

  // User Login API
    verifyLogin : async (req, res) => {
      const loginData = {
        email: req.body.email,
        password: req.body.password,
        remember: req.body.remember,
      };

      console.log("verify login data ",loginData)
      try {
          // Check if the mobile number exists in the database
          const userExists = await models.UserModel.User.findOne({ email: loginData.email });

          console.log("user is exist --------",userExists)

          if (!userExists) {
              return res.redirect(`/admin/auth/login?error=User Not Found${encodeURIComponent(loginData.email)}`);
          }

          // Generate and send OTP
          const isPasswordValid = await bcrypt.compare(loginData.password, userExists.password);

          if (!isPasswordValid) {
              return res.redirect(`/admin/auth/login?error=Invalid email or password&email=${encodeURIComponent(loginData.email)}`);
          }

          // Check if the user's usertype is "admin"
          if (userExists.usertype !== 'Admin') {
              return res.redirect('/admin/auth/login?error=You do not have permission to access the admin panel.');
          }

          // const generalData = await models.SettingModel.GeneralData.find();
          const generalData =  await models.UserModel.User.find();
          const server = generalData[0];
          // console.log("get generalData from verifylgin",server)
          const token = generateAccessToken(userExists, server);
          
          //  Set the token as a cookie or in the response body, depending on your preference
          if (loginData.remember == 'on') {
            res.cookie('jwt',  token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true }); 
            console.log("here")
          } else {
            res.cookie('jwt', token, { httpOnly: true });
          }
          res.return = token;
          
          return res.redirect('/admin/auth/dashboard');
    
      } catch (error) {
        console.error('Error during login:', error);
        return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ status: false, status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR, message: MessageConstants.INTERNAL_SERVER_ERROR, data: {} });
      }
    },
  
  // User Dashboard API
    getdashboard : async (req, res) => {
      const user = req.user;
      if (!user && user.usertype !== "Admin") {
        res.redirect('/admin/auth/login');
      }
      console.log("user login in getdashboard page ",user)
      console.log(req.cookies.jwt)
      const orderInfo = await models.BranchModel.Order.find();
      const allOrders = orderInfo.length;

      const products = await models.ProductModel.Product.find();
      const allProducts = products.length;

      const users = await models.UserModel.User.find({usertype: "Customer"});
      const allCustomers = users.length;

      const addOn = await models.ProductModel.AddOn.find();

      const vehicle = await models.BranchModel.Vehicle.find()
      .populate('branch_id')
      .populate('deliveryman_id');

      const orderDetail = await models.BranchModel.Order.aggregate([
        {
          $match: {
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

      // console.log(orderDetail)
      
          // Now you can access product quantities dynamically
          // const revenue = orderDetail;
          // const totalQuantity = orderDetail.length > 0 ? orderDetail[0].totalQuantity : 0;
          

          // console.log("Total Revenue for Delivered Orders with Payment Status True: " + totalRevenue);

            // Transform the data into arrays for charting
          const totalQuantity = orderDetail.map(item => item.totalQuantity);
          const sum = orderDetail.map(item => item.totalRevenue);
          console.log("Quantity",totalQuantity)
          console.log("Revenue",sum)

          const totalRevenue = sum.reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue, 10), 0);

          console.log(totalRevenue.toFixed(2))
          

      error = "You are successfully logged in"
      res.render('admin/dashboard', { options, vehicle, allOrders, allProducts, totalRevenue, totalQuantity, allCustomers , products, addOn ,user: user, error , productQuantities: JSON.stringify({ totalQuantity })})
    },

  // User Logout API
    logout:(req, res) => {
      try {
        // Clear the user session
        const user = req.user;

        res.clearCookie('jwt'); // Clear the JWT cookie
        
        res.redirect('admin/auth/login')
        

      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send('An error occurred during logout.');
      }
    },

    pageNotFound : async (req, res) => {
        const user = req.user;
          
        console.log(user)
        if (!user && !user.usertype === "Admin") {
          res.redirect('/admin/auth/login');
        }
        
        res.status(404).render('partials/404', {user}); // Render the pagenotfound.ejs view
    },
    
    redirecter: async (req, res) => {
      const user = req.user;
  
      console.log(user);
      if (!user && !user.usertype === "Admin") {
        res.redirect('/admin/auth/login');
      }
  
      return res.redirect('/branch/auth/dashboard');
  },
  

    getSalesData: async (req, res) => {
      try {
        // Get the current date
        const currentDate = new Date();
      
        // Calculate the date 7 days ago
        const sevenDaysAgo = addDays(currentDate, -7);
      
        console.log("seven Days ago ",sevenDaysAgo);
    
        const orderDetail = await models.BranchModel.Order.aggregate([
          {
            $match: {
              payment_status: true,
              updated_date: { $gte: sevenDaysAgo, $lte: currentDate }
              // Swap the conditions for correct date range
            }
          },
          {
            $unwind: "$product_items"
          },
          {
            $group: {
              _id: {
                year: { $year: "$updated_date" },
                month: { $month: "$updated_date" },
                day: { $dayOfMonth: "$updated_date" }
              },
              totalRevenue: { $sum: "$grand_total" },
            }
          },
          {
            $project: {
              _id: 0, // Exclude _id field
              date: {
                $concat: [
                  { $toString: "$_id.day" },
                  " ",
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                        { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                        { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                        { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                        { case: { $eq: ["$_id.month", 5] }, then: "May" },
                        { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                        { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                        { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                        { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                        { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                        { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                        { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                      ],
                      default: ""
                    }
                  }
                ]
              },
              totalRevenue: 1
            }
          }
        ]);
        
        console.log("order details----",orderDetail);
        
        // Rest of your code for creating an array of the last 7 days and mapping data with the last 7 days
        
    
        // Create an array of the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, index) => {
          const date = addDays(currentDate, -index);
          return {
            date: `${date.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}`,
            // Format the date in DD MMM format
            totalRevenue: 0, // Default value if there is no data
          };
        });
    
        // Map the data with the last 7 days
        const mappedData = last7Days.map(day => {
          const foundData = orderDetail.find(item => item.date === day.date);
          return foundData || day;
        });
    
        console.log("mapped data----",mappedData);
        res.json(mappedData);
      } catch (error) {
        console.error('Error fetching total revenue data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }, 

    getChangePass : async (req, res) => {
      try {
        const user = req.user;

        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        console.log(user)
        res.render('admin/settings/change_pass', {user , error: "Change your password"});
      } catch (error) {
        console.error('Error fetching total revenue data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    postChangePass : async (req, res) => {
      try {
        const user = req.user;

        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
          return res.redirect('/admin/auth/change-password?error=Please enter password and confirm password');
        }

        if (password !== confirmPassword) {
          return res.redirect('/admin/auth/change-password?error=Passwords do not match');
        }

        const users = await models.UserModel.User.findById(user.userId);
        console.log(users)
        users.password = await bcrypt.hash(password, 10);
        
        await users.save();

        res.redirect('/admin/auth/dashboard?success=Password changed successfully');
      } catch (error) {
        console.error('Error fetching :', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    getForgotPass : async (req, res) => {
      try {
        
        const email = req.body.email;

        if (!email) {
          return res.redirect('/admin/auth/forgot-password?error=Please enter email');
        }

        const user = await models.UserModel.User.findOne({ email });
        if (!user) {
          return res.redirect('/admin/auth/forgot-password?error=Email not found');
        }

        if(user.usertype !== "Admin"){
          return res.redirect('/admin/auth/forgot-password?error=Email not found');
        }

        res.render('/forgot_password');

      } catch (error) {
        console.error('Error fetching Forgot Pass :', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
}

