const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require("path")
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
const s3Client = require('../../../managers/utils/s3Delete')

// Function to generate a credit transaction ID
function createCreditTransactionId(type ,serialNumber) {
  const uuid = uuidv4(); // Generate a Version 4 UUID
  const shortUuid = uuid.slice(0, 5); // Take the first 5 characters of the UUID
  const paddedSerialNumber = String(serialNumber).padStart(3, '0'); // Ensure serial number is three digits
  return `${type}-${shortUuid}-${paddedSerialNumber}`;
}
const options = { day: '2-digit', weekday: 'long', month: 'short', year: 'numeric' };
const options2 = { timeZone: 'UTC', };
const options4 = { year: 'numeric', month: '2-digit', day: '2-digit' };

module.exports = {

  // Get Product List
    list : async (req, res) => {
        try {
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
        
            // Filter customers with user_type = "customer"
            const customers = await models.UserModel.User.find({ usertype: "Customer" });
            const customerCount = customers.length;
            


            console.log(customerCount)
            const error = "Customer's Lists";

            res.render('admin/customer/lists', {
              Title: "All Customers",
              user,
              customers,
              customerCount,
              error,
            });
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

    // Customer Details
    getCustomer : async (req, res) => {
        try {
            const customerId = req.params.customerId;
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
            console.log("Fetching branch with ID:", customerId);
        
            // Find the customer in the database by ID
            const customer = await models.UserModel.User.findById(customerId);
            const address = await models.UserModel.Address.findOne({user_id: customerId})
            const orders = await models.BranchModel.Order.find({user_id : customerId , is_cancelled : false}).populate('product_items').populate('product_items.product_id');
            const payments = await models.UserModel.Payment.find({user_id : customerId});
            const branchProduct = await models.BranchModel.BranchProduct.find();
            
            let totalPaid = 0;
            let totalDue = 0;
            let grandTotal = 0;

            orders.forEach(item => {
              grandTotal += item.grand_total;  // Add the grand_total to the grand total

              if (!item.payment_status) {
                totalDue = item.grand_total - totalPaid;   // Due amount
                console.log(totalDue)
              }
            });

            payments.forEach(item => {
              totalPaid += item.amount;
              console.log(totalPaid)
            })

            grandTotal = parseFloat(grandTotal.toFixed(2));
            totalPaid = parseFloat(totalPaid.toFixed(2));
            totalDue = parseFloat(totalDue.toFixed(2));

            totalDue = grandTotal - totalPaid;
            const paymentData = {
              totalPaid,
              totalDue,
              grandTotal
            };

            console.log(paymentData)

            // Send the category details to the client for updats
            const error = "Customer Overview";
            res.render('admin/customer/details', { customer,paymentData, address,user,payments, branchProduct, orders, error }); // Assuming you are using a template engine like EJS
          } catch (err) {
            console.log("There is an issue while fetching the customer for updating.");
            console.log(err.message);
            res.status(404).send(err.message);
          }
    },

    getAdd : async (req, res) => {
      try {
        const user = req.user;
    
        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        const states = await models.SettingModel.State.find({});
        const companies = await models.SettingModel.Company.find({});
        res.render('admin/customer/add', {user, companies,states,error:"Add New Customer" });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

  // Add Category List
    postAdd: async (req, res) => {
      try{
        const { first_name,last_name, email, phone, company, accept_term, gst_no, credit_limit, address1, address2, area, pincode, city, state, country, payment_method , discount , volume_discount , card_discount, delivery_fee} = req.body;

        const imageFilename = req.files['image'] ? req.files['image'][0].filename : "user/default_profile.png";
        const defaultProfileImage = 'images/user/default_profile.png';
        var is_privilaged = false ;
        // Set the image filename to either the uploaded image or the default profile image
        const imgData = `${req.body.maincategory}/${req.body.subcategory}/${imageFilename}` ? imageFilename : defaultProfileImage;

        if(discount > 0 || volume_discount > 0 || card_discount > 0 || discount < 0 || volume_discount < 0 || card_discount < 0){
          is_privilaged = true;
        }else if (discount === 0 && volume_discount === 0 && card_discount === 0) {
          is_privilaged = false;
        }

        const acceptTerm = accept_term === "true";

        if (!first_name || !last_name || !email || !phone || !company) {
          throw new Error('Required fields are missing.');
        }
        
        // Validate if the customer with same number and email exists
        const existingUserByEmail = await models.UserModel.User.findOne({phone : phone});
        const existingUserByPhone = await models.UserModel.User.findOne({email : email})

        if(existingUserByEmail || existingUserByPhone){
          res.redirect(`/admin/customer/list?error=${encodeURIComponent("Customer With Same Email/Phone Number already Exists")}`);
        }

        const customer = new models.UserModel.User({
          first_name,
          last_name,
          email,
          phone,
          company,
          usertype: "Customer",
          profile:  imgData,
          gst_no : gst_no,
          is_active : true,
          discount : discount,
          volume_discount : volume_discount,
          card_discount : card_discount,           
          delivery_fee : delivery_fee,
          is_privilaged : is_privilaged,
          accept_term : acceptTerm,
          is_address_available : true,
          payment_method : payment_method,
        })
    
        await customer.save();
        const address = new models.UserModel.Address({
          user_id : customer._id, 
          address_type : "Home",
          address_1 : address1,
          address_2 : address2,
          area,
          city,
          state,
          country,
          pincode,
          primary : true
        })
        await address.save();

        const transaction = await models.UserModel.Wallet.find();
        const walletLength = transaction.length;
        const number = walletLength + 1;

        const walletData = {
          user_id : customer._id,
          total_credit : credit_limit
        }
  
        const newWallet = new models.UserModel.Wallet(walletData);

        const transactionData = {
          transaction_id : createCreditTransactionId("CRED", number),
          wallet_id : newWallet._id,
          credited : newWallet.total_credit,
          available : newWallet.total_credit,
          status : true
        }

        const newTranscation = new models.UserModel.Transaction(transactionData)

        await newWallet.save();
        await newTranscation.save();

        await models.UserModel.User.findOneAndUpdate(
          { _id: customer._id },
          { has_wallet : true }
        );

        console.log("Customer added successfully");
        res.redirect('/admin/customer/list');
    
      }catch (err) {
        console.error(err);
        res.redirect(`/admin/customer/list?error=${encodeURIComponent(err.message)}`);
      }
    
    },


  // Update Status
    updateStatus : async (req, res) => {
        try {
            const customerId = req.body.customerId;
            console.log(customerId)
            // Find the branch in the database by ID
            const customer = await models.UserModel.User.findById(customerId,{usertype : "Customer"});
        
            if (!customer) {
                // Branch not found in the database
                return res.status(404).send('customer not found');
            }
        
            // Toggle the status (true to false or false to true) and save the updated branch
            customer.is_active = !customer.is_active;
            await customer.save();
            
            console.log('Database value updated successfully');
            res.json({ is_active: customer.is_active }); // Respond with the updated status
        } catch (err) {
          console.error('Error updating database value: ', err);
            res.status(500).send('Error updating database value');
        }
    },

  // Edit Category
    getUpdate :  async (req, res) => {
      try {
        const customerId = req.params.customerId;
        const user = req.user;
    
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        console.log("Fetching customer with ID:", customerId);
    
        // Find the customer in the database by ID
        const customer = await models.UserModel.User.findById(customerId);
        const address = await models.UserModel.Address.findOne({user_id: customerId});
        const states = await models.SettingModel.State.find({});
        console.log(address);
        if (!customer) {
          // customer not found in the database
          throw new Error('Customer not found.');
        }
    
        res.render('admin/customer/update', {address, customer, user, states,error: " Update Customer" }); // Assuming you are using a template engine like EJS
      } catch (err) {
        console.log("There is an issue while fetching the customer for updating.");
        console.log(err.message);
        res.status(404).send(err.message);
      }
    },

  // Update Category
  postUpdate: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const user = req.user;
      if (!user) {
        return res.redirect('/admin/auth/login');             
      }
     console.log("user in update customer",user.usertype) 
      console.log("req.body contains ",{ ...req.body});
      console.log("Updating customer with ID:", customerId);
      var privilage = false

      const {
        first_name,
        last_name,
        phone,
        email,
        company,
        address1,
        address2,
        area,
        pincode,
        gst_no,
        city,
        state,
        country,
        payment_method,
        discount,
        volume_discount,
        card_discount,
        delivery_fee,
      } = req.body;
      
      if(discount > 0 || volume_discount > 0 || card_discount > 0 || discount < 0 || volume_discount < 0 || card_discount < 0){
        privilage = true;
      }else if (discount === 0 && volume_discount === 0 && card_discount === 0) {
        privilage = false;
      } 
      

      // Find the customer in the database by ID
      const customer = await models.UserModel.User.findById(customerId);
      let address = await models.UserModel.Address.findOne({ user_id: customerId });
      console.log(address);
  
      if (!customer) {
        // customer not found in the database
        throw new Error("Customer not found.");
      }
  
      // Check if 'image' field is found in the request
      if (req.files && req.files['image']) {
        if (customer.profile) {
          ImgServices.deleteImageFile(customer.profile);
        }
        customer.profile = `${req.body.maincategory}/${req.body.subcategory}/${req.files['image'][0].filename}`;
      }
  
      if (!address) {
        // If address not found, create a new one
        address = new models.UserModel.Address({
          user_id: customerId,
          address_1: address1,
          address_2: address2,
          address_type : "office",
          area: area,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
        });
      } else {
        // If address found, update it
        address.address_1 = address1;
        address.address_2 = address2;
        address.area = area;
        address.pincode = pincode;
        address.city = city;
        address.state = state;
        address.country = country;
        address.primary = true;
      }
      
      let product_price
      const district_of_city = await models.SettingModel.Area.findOne({ name : area}).populate('district_id');
      if (district_of_city.price > 0) { 
        product_price = district_of_city.price;
      }
      // const discount_total = parseFloat(discount) + parseFloat(card_discount) + parseFloat(volume_discount);
      // const rate = parseFloat(product_price) + parseFloat(discount_total)
      const rate = parseFloat(product_price)
      console.log(`Customer ${first_name} rate:`, rate);

      customer.rate = rate     
      customer.first_name = first_name;
      customer.last_name = last_name;
      customer.phone = phone;
      customer.is_address_available = true;
      customer.email = email;
      customer.gst_no = gst_no;
      customer.company = company;
      customer.is_privilaged = privilage;
      customer.payment_method = payment_method;
      customer.discount = discount;
      customer.volume_discount = volume_discount;
      customer.card_discount = card_discount;
      customer.delivery_fee = delivery_fee;
  
      // Save the updated customer and address to the database
      await customer.save();
      await address.save();
      console.log("Customer updated successfully");
  
      res.redirect('/admin/customer/list');
    } catch (err) {
      console.log("There is an issue while updating the Customer.",err.message);
      console.error(err);
      res.redirect(`back?error=${encodeURIComponent(err.message)}`);
    }
  },
  
  

  // Delete Category
  delete : async (req, res) => {
    try {
      const customerId = req.params.customerId;
      console.log("Deleting branch with ID:", customerId);
    
      // Find and delete the product from the database
      const deletedCustomer = await models.UserModel.User.findOne({ _id: customerId });
  
      if (!deletedCustomer) {
        // product not found in the database
        throw new Error(`${deletedCustomer} not found.`);
      }
  
      deletedCustomer.status = !deletedCustomer.status;

      await deletedCustomer.save();
      
      console.log(`${deletedCustomer.name} deleted successfully`);
  
      res.status(200).json({ message: `${deletedCustomer.name} deleted successfully` });
    } catch (err) {
      console.log(`There is an issue while deleting`);
      console.log(err.message);
      res.status(400).send(err.message);
    }
  },

  getCityList: async (req, res) => {
    try {
        const stateName = req.query.state;
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
                res.json(flattenedCities);
            } else {
                res.status(404).json({ message: "No districts found for the given state." });
            }
        } else {
            res.status(404).json({ message: "State not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},

  getAreaList: async (req, res) => {
    try {
        const stateName = req.query.state;
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
                // Gather all area data for each district
                const areasPromises = districts.map(async (district) => {
                    const districtId = district._id;
                    const areas = await models.SettingModel.Area.find({ district_id: districtId });
                    return areas;
                });

                // Wait for all area queries to complete
                const allAreas = await Promise.all(areasPromises);

                // Flatten the array of arrays into a single array of area
                const flattenedAreas = [].concat(...allAreas);

                // Send the response
                res.json(flattenedAreas);
            } else {
                res.status(404).json({ message: "No districts found for the given state." });
            }
        } else {
            res.status(404).json({ message: "State not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},

  getPaymentIN : async (req, res) => {
    try {
      const customer_id = req.params.customer_id; 
      console.log("customer_id",customer_id);
      const customer = await models.UserModel.User.findById(customer_id);
      console.log("customer",customer);

      const paymentData = {
        payment_type: req.body.payment_method,
        payment_id : req.body.transaction_id,
        amount: req.body.amount,
        user_id: customer._id,
        date : req.body.date,
      }

      const payment = new models.UserModel.Payment(paymentData);

      await payment.save();
      console.log("payment",payment);

      res.redirect('/admin/customer/detail/' + customer_id);


    } catch (err) {
      console.log(`There is an issue while deleting`);
      console.log(err.message);
      res.status(400).send(err.message);
    }
  },

  getCustomerLedger: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const user = req.user;
  
      if (!user) {
        return res.redirect('/admin/auth/login');
      }
      console.log("Fetching branch with ID:", customerId);
  
      // Find the customer in the database by ID
      const customer = await models.UserModel.User.findById(customerId);
      const address = await models.UserModel.Address.findOne({ user_id: customerId });
  
      // Fetch orders
      const orders = await models.BranchModel.Order.find({ user_id: customerId , is_delivered  : true })
        .populate('product_items')
        .populate('product_items.product_id');
  
      // Fetch payments
      const payments = await models.UserModel.Payment.find({ user_id: customerId });
  
      // Create an array of orders with type and necessary fields
      const ordersWithType = orders.map(order => ({
        date: order.created_date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        type: 'Sale',
        id: order.order_id, // Example field; replace with actual field
        paymentMode: '--',
        amount: order.grand_total,
        paymentStatus: order.payment_status // Added to track payment status
      }));
  
      // Create an array of payments with type and necessary fields
      const paymentsWithType = payments.map(payment => ({
        date: payment.date,
        type: 'Payment-In',
        id: payment.payment_id, // Example field; replace with actual field
        paymentMode: payment.payment_type,
        amount: payment.amount,
      }));
  
      // Combine orders and payments into a single array
      const combinedData = [...ordersWithType, ...paymentsWithType];
  
      // Sort combined array by date (both payments and orders)
      combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Process totals
      let totalPaid = payments.reduce((acc, item) => acc + item.amount, 0);
      console.log("totalPaid",totalPaid)
      let totalDue = orders.reduce((acc, item) => {
        return  acc + item.grand_total;
      }, 0);
      
      
      // Calculate grand total
      console.log("grand total",totalPaid, totalDue)
      const grandTotal = totalDue;
  
      // Prepare payment data
      const paymentData = {
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalDue: parseFloat((totalDue - totalPaid).toFixed(2)), // Adjusted total due
        grandTotal: parseFloat(grandTotal.toFixed(2))
      };
  
      // Render the response
      const error = "Customer Overview";
      console.log("orders",orders)
      res.render('admin/customer/ledger', {
        customer, paymentData, combinedData, address, user, orders, error
      });
    } catch (err) {
      console.log("There is an issue while fetching the customer for updating.");
      console.log(err.message);
      res.status(404).send(err.message);
    }
  },

  deletePayment: async (req, res) => {
    try {
        const { paymentId, customerId } = req.params;

        if (!paymentId || !customerId) {
            return res.status(400).json({ success: false, message: 'Missing paymentId or customerId' });
        }

        const deletedPayment = await models.UserModel.Payment.findByIdAndDelete(paymentId);
        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const payments = await models.UserModel.Payment.find({ user_id: customerId });
        const orders = await models.BranchModel.Order.find({ user_id: customerId, is_cancelled: false });

        let totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        let grandTotal = orders.reduce((sum, order) => sum + order.grand_total, 0);
        let totalDue = grandTotal - totalPaid;

        res.json({
          success: true,
          message: 'Payment deleted successfully!',
          redirectUrl: `/admin/customer/detail/${customerId}`, 
          paymentData: {
              totalPaid: totalPaid.toFixed(2),
              totalDue: totalDue.toFixed(2),
              grandTotal: grandTotal.toFixed(2),
          },
      });
    } catch (err) {
        console.error('Error deleting payment:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },


  getCustomerAddress : async (req, res) => {
    try {
        const customerId = req.query.customer_id;
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        console.log("Fetching address with ID:", customerId);

        const addresses = await models.UserModel.Address.find({ user_id: customerId });

        console.log("customer addresses",addresses);

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ error: "No addresses found for this customer" });
        }

        return res.status(200).json({ success : true ,addresses : addresses });
    } catch (err) {
      console.error('Error deleting payment:', err.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

}



