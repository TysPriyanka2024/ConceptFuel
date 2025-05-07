require("dotenv").config();
const jwt = require('jsonwebtoken');
const exceljs = require('exceljs');
const bcrypt = require('bcrypt');
const {NumberHelper} = require('../../../managers/helpers')
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const {
  MessageConstants,
  StatusCodesConstants,
  NotificationConstants,
} = require('../../../managers/notify');
const { generateAccessToken} = require('../middlewares/auth.middleware');
const models = require('../../../managers/models');
const {PushNotification } = require('../../../managers/notifications')
// This would be your token blacklist storage
const tokenBlacklist = new Set();
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const minify = require('html-minifier').minify;
const { s3Client,PRIVATE_BUCKET } = require("../../../managers/utils/s3Client");
const { Mailer } = require('../../../mailer');
const ejs = require('ejs');
const puppeteer = require("puppeteer-core")
const fs = require('fs'); // Import the 'fs' module for file operations
const path = require("path");  
const { promisify } = require('util');  
const options = { day: '2-digit', weekday: 'long', month: 'short', year: 'numeric' };
const options2 = { timeZone: 'UTC', };
const { Whatsapp } = require('../../../managers/whatsapp');
const { AuthHelper, OtpHelper } = require('../../../managers/helpers');

const parseExcel = (filePath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(filePath); // Read the Excel file
      const worksheet = workbook.worksheets[0]; // Assuming the first sheet

      let orders = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          orders.push({
            customer_id: row.getCell(1).value,
            product_id: row.getCell(2).value,
            quantity: row.getCell(3).value,
          });
        }
      });
      resolve(orders);
    } catch (error) {
      reject(error);
    }
  });
};

// Parse CSV file for customers
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    let orders = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        orders.push({
          customer_id: row['customer_id'],
          product_id: row['product_id'],
          quantity: row['quantity'],
        });
      })
      .on('end', () => resolve(customers))
      .on('error', (err) => reject(err));
  });
};

module.exports = {

  // Get Product List
    list : async (req, res) => {
      try{
        const user = req.user;
        const page = req.query.page ? parseInt(req.query.page) : 0; // Start from page 0
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10; // Items per page

        if(!user){
          return res.redirect('/admin/auth/login')
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        console.log(today)

        const orders = await models.BranchModel.Order
        .find()
        .populate('user_id')
        .populate('branch_id')
        .populate('address_id')
        .populate('delivery_id') // Populate the delivery information if applicable
        .sort({ created_date: -1 })
    
      const customers = await models.UserModel.User.find({ usertype: "Customer" });
      const branches = await models.BranchModel.Branch.find();
      const ordersCount = orders.length;
    
      res.render("admin/order/all", {user, branches, ordersCount, customers, orders, options, error: "List of Orders"});
      }catch(err){
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    // Get Product List
    dailylist : async (req, res) => {
      try{
        const user = req.user;
        const page = req.query.page ? parseInt(req.query.page) : 0; // Start from page 0
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10; // Items per page

        if(!user){
          return res.redirect('/admin/auth/login')
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        console.log(today)

        const orders = await models.BranchModel.Order
        .find({created_date : { $gte: today } })
        .populate('user_id')
        .populate('branch_id')
        .populate('address_id')
        .populate('delivery_id') // Populate the delivery information if applicable
        .sort({ created_date: -1 })
    
      const customers = await models.UserModel.User.find({ usertype: "Customer" });
      const branches = await models.BranchModel.Branch.find();
      const ordersCount = orders.length;
    
      res.render("admin/order/all", {user, branches, ordersCount, customers, orders, options, error: "List of Orders"});
      }catch(err){
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    getCount : async ( req, res ) =>{
      try {
        const orderInfo = await models.BranchModel.Order.find();
        const allCount = orderInfo.length;

        const pending = orderInfo.filter(order => order.status === "Pending");
        const pendingCount = pending.length;

        const confirmed = orderInfo.filter(order => order.status === "Confirmed");
        const confirmCount = confirmed.length;

        // const processing = orderInfo.filter(order => order.status === "Processing");
        // const processCount = processing.length;

        const outForDelivery = orderInfo.filter(order => order.status === "Out for delivery");
        const deliveryCount = outForDelivery.length;

        const delivered = orderInfo.filter(order => order.status === "Delivered");
        const deliveredCount = delivered.length;

        // const failed = orderInfo.filter(order => order.status === "Failed");
        // const failedCount = failed.length;

        const cancelled = orderInfo.filter(order => order.status === "Cancelled");
        const cancelledCount = cancelled.length;
        
        // const returned = orderInfo.filter(order => order.status === "Returned");
        // const returnCount = returned.length;

        const scheduled = orderInfo.filter(order => order.status === "Scheduled");
        const schedludedCount = scheduled.length;

        const rejected = orderInfo.filter(order => order.status === "Rejected");
        const rejectedCount = scheduled.length;

        const payload = {
          all:allCount,
          pending:pendingCount,
          confirmed:confirmCount,
          // processing:processCount,
          out:deliveryCount,
          delivered:deliveredCount,
          // returned:returnCount,
          // failed:failedCount,
          cancelled:cancelledCount,
          scheduled:schedludedCount,
          rejected:rejectedCount,
        };

        res.json(payload);
      } catch (error) {
          console.error(error);
          res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error:MessageConstants.INTERNAL_SERVER_ERROR});
      }
    },

    getDailyCount : async ( req, res ) =>{
      try {

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        console.log("todays date----",today)
        const orderInfo = await models.BranchModel.Order.find({created_date : { $gte: today } });
        console.log("order details :",orderInfo);
        const allCount = orderInfo.length;


        const pending = orderInfo.filter(order => order.status === "Pending");
        const pendingCount = pending.length;

        const confirmed = orderInfo.filter(order => order.status === "Confirmed");
        const confirmCount = confirmed.length;

        // const processing = orderInfo.filter(order => order.status === "Processing");
        // const processCount = processing.length;

        const outForDelivery = orderInfo.filter(order => order.status === "Out for delivery");
        const deliveryCount = outForDelivery.length;

        const delivered = orderInfo.filter(order => order.status === "Delivered");
        const deliveredCount = delivered.length;

        // const failed = orderInfo.filter(order => order.status === "Failed");
        // const failedCount = failed.length;

        const cancelled = orderInfo.filter(order => order.status === "Cancelled");
        const cancelledCount = cancelled.length;
        
        // const returned = orderInfo.filter(order => order.status === "Returned");
        // const returnCount = returned.length;

        const scheduled = orderInfo.filter(order => order.status === "Scheduled");
        const schedludedCount = scheduled.length;

        const rejected = orderInfo.filter(order => order.status === "Rejected");
        const rejectedCount = rejected.length;

        const payload = {
          all:allCount,
          pending:pendingCount,
          confirmed:confirmCount,
          // processing:processCount,
          out:deliveryCount,
          delivered:deliveredCount,
          // returned:returnCount,
          // failed:failedCount,
          cancelled:cancelledCount,
          scheduled:schedludedCount,
          rejected:rejectedCount,
        };

        res.json(payload);
      } catch (error) {
          console.error(error);
          res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error:MessageConstants.INTERNAL_SERVER_ERROR});
      }
    },

    getDetails : async (req, res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');;
        const deliveryman = await models.BranchModel.Vehicle.find();
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        if(order.status == "Out for delivery"){
          const custom_css = "Out_For_Delivery";

          const error =  `Order ${order.order_id} Details`
          res.render('admin/order/detail', { user,order, custom_css, options , error, deliveryman});
        }
        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`
        res.render('admin/order/detail', { user,order, custom_css, options , error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    listByStatus: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        const { statuses } = req.params; // Extract the status from the URL parameters

        let status = statuses;


        if (statuses === "out_for_delivery") {
          status = "Out for delivery";
        } 
        
        console.log(status)

        // Define a mapping of status values to user-friendly error messages
        const statusMessages = {
          pending: "List of Pending Orders",
          confirmed: "List of Confirm Orders",
          // processing: "List of Processing Orders",
          out_for_delivery: "List of Out For Delivery",
          delivered: "List of Delivered Orders",
          // returned: "List of Return Orders",
          // failed: "List of Failed Orders",
          cancelled: "List of Cancelled Orders",
          scheduled: "List of Scheduled Orders",
          rejected: "List of Scheduled Orders",
        };
    
        // Validate if the provided status is in the mapping
        if (!statusMessages[statuses]) {
          return res.status(400).send('Invalid status');
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        console.log(today)

        // Fetch orders based on the provided status
        const orders = await models.BranchModel.Order
          .find({ status: status.charAt(0).toUpperCase() + status.slice(1), created_date : { $gte: today }}) // Capitalize the status
          .populate('user_id')
          .populate('branch_id')
          .populate('address_id')
          .populate('delivery_id') // Populate the delivery information if applicable
          .sort({ created_date: -1 })
    
        console.log(status.charAt(0).toUpperCase() + status.slice(1))
        // console.log(orders)
        const branches = await models.BranchModel.Branch.find();  

        const ordersCount = orders.length;
    
        console.log(orders)
        // Render the view with filtered orders and the appropriate error message
        res.render("admin/order/all", {
          user,
          ordersCount,
          orders,
          options,
          branches,
          error: statusMessages[status], // Use the error message from the mapping
        });
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    reportlistByStatus: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        const { statuses } = req.params; // Extract the status from the URL parameters

        let status = statuses;


        if (statuses === "out_for_delivery") {
          status = "Out for delivery";
        } 
        
        console.log(status)

        // Define a mapping of status values to user-friendly error messages
        const statusMessages = {
          pending: "List of Pending Orders",
          confirmed: "List of Confirm Orders",
          // processing: "List of Processing Orders",
          out_for_delivery: "List of Out For Delivery",
          delivered: "List of Delivered Orders",
          // returned: "List of Return Orders",
          // failed: "List of Failed Orders",
          cancelled: "List of Cancelled Orders",
          scheduled: "List of Scheduled Orders",
          rejected: "List of Scheduled Orders",
        };
    
        // Validate if the provided status is in the mapping
        if (!statusMessages[statuses]) {
          return res.status(400).send('Invalid status');
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        console.log(today)

        // Fetch orders based on the provided status
        const orders = await models.BranchModel.Order
          .find({ status: status.charAt(0).toUpperCase() + status.slice(1)}) // Capitalize the status
          .populate('user_id')
          .populate('branch_id')
          .populate('address_id')
          .populate('delivery_id') // Populate the delivery information if applicable
          .sort({ created_date: -1 })
    
        console.log(status.charAt(0).toUpperCase() + status.slice(1))
        // console.log(orders)
        const branches = await models.BranchModel.Branch.find();  

        const ordersCount = orders.length;
    
        console.log(orders)
        // Render the view with filtered orders and the appropriate error message
        res.render("admin/order/all", {
          user,
          ordersCount,
          orders,
          options,
          branches,
          error: statusMessages[status], // Use the error message from the mapping
        });
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
    
    updateDeliveryStatus: async (req, res) => {
      try {
        // Extract data from the request
        const orderId = req.body.orderId;
        const newStatus = req.body.selectedStatus;
        const reason = req.body.rejectionReason;
        let response = false
        // Define flags for is_delivered and is_cancelled
        let isDelivered = false;
        let isCancelled = false;

        const updatedOrder = await models.BranchModel.Order.findOne({order_id:orderId}).populate('user_id');     

        // Update flags based on newStatus
        if (newStatus === 'Delivered') {
          isDelivered = true;
        } else if (newStatus === 'Cancelled') {
          isCancelled = true;
        }

        // Update the order using async/await
        updatedOrder.reason = reason;
        updatedOrder.status = newStatus;
        updatedOrder.is_delivered = isDelivered;
        updatedOrder.is_cancelled = isCancelled;
        updatedOrder.updated_date = new Date();

        await updatedOrder.save();

        const order_id = updatedOrder.order_id;
        const userId = updatedOrder.user_id._id;

        const phone = `+91${updatedOrder.user_id.phone}`;

        let description = {
          type : "Status",
          status : "Status",
          name : "John Doe",
          order_id : order_id,
        }
<<<<<<< HEAD
=======
        let Name = `${updatedOrder.user_id.first_name} ${updatedOrder.user_id.last_name}`; 
>>>>>>> 50bc8428eba644b356898945a2134b8590826159

        // Send email notification
        if (updatedOrder.is_delivered === true) {
          const order = await models.BranchModel.Order.findOne({ order_id: order_id }).populate('product_items').populate('branch_id').populate('address_id').populate('billing_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
          const bank = await models.BranchModel.Bank.findOne({ user_id: order.branch_id });
          console.log(bank);
          const vehicle = await models.BranchModel.Vehicle.findOne({ deliveryman_id: order.delivery_id });
          const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);

        
          const recipientEmail = order.user_id.email;
          const subject = `Order #${order_id} confirmed | Thank you for placing your order!`;
          const templateFilePath = path.join(__dirname, Mailer.invoiceEmail);
          const invoiceName = `invoice_${order_id}.pdf`;
          const invoiceLocations = path.join(__dirname, '../../../mailer/invoices',invoiceName);
          console.log(recipientEmail);
        
          // Read the email template file
          const emailTemplateContent = await promisify(fs.readFile)(templateFilePath, 'utf8');

          const renderedEmailContent = ejs.render(emailTemplateContent, { order, options, bank, vehicle, totalPriceInWords });
          const minifiedHtml = minify(renderedEmailContent, {
              removeAttributeQuotes: true,
              collapseWhitespace: true,
          });

          // Generate PDF using Puppeteer
          const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', // adjust the path based on your system
            headless: true,
            args: ['--no-sandbox'],
          });
          const page = await browser.newPage();
          await page.setContent(minifiedHtml);
<<<<<<< HEAD
          const pdfBuffer = await page.pdf({ format: 'A4' });
=======
          // const pdfBuffer = await page.pdf({ format: 'A4' });
          const pdfBuffer = await page.pdf({width: '800px',height: `1200px`, printBackground: true});
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
          await browser.close();

          console.log(`PDF uploaded to S3 bucket`);

          let upload = false;
          try {
              // Save the PDF locally (optional)
              fs.writeFileSync(invoiceLocations, pdfBuffer);
              upload = true;
              console.log('File write successful');
          } catch (error) {
              console.error('File write failed:', error);
          }
<<<<<<< HEAD

=======
          
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
          if (upload === true) {
              console.log("Location which sending",invoiceLocations)
              const emailResult = await Mailer.sendCustomMail(recipientEmail, subject, renderedEmailContent, invoiceLocations, invoiceName);
              console.log(emailResult);

<<<<<<< HEAD
=======
              const serverBaseUrl = process.env.SERVER_BASE_URL || 'https://doorstepservices.joshfuels.com';
              const invoiceURL = `${serverBaseUrl}/invoice/${invoiceName}`;
              if(invoiceURL){
              console.log("Invoice URL", invoiceURL)
                  let params = {
                      type : "Invoice",
                      name : Name,
                      order_id : order_id,
                      invoiceURL : invoiceURL,
                  }
                  const response = await Whatsapp.elseCase(params, phone);
              }
              
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
              if (emailResult.success === true) {
                  console.log('Email sent successfully');

                  // If email is successful, remove the file
                  try {
                      // fs.unlinkSync(invoiceLocations);
                      response = true
                      console.log('File removed successfully');
                  } catch (unlinkError) {
                      console.error('Error removing file:', unlinkError);
                  }
              } else {
                  console.error('Email sending failed:', emailResult);
              }
          }

        }
        let messageNotify = {
          title: "Hello World",
          body: "This is a sample template for message"
        }
        let userIds = [];
<<<<<<< HEAD
        let Name = `${updatedOrder.user_id.first_name} ${updatedOrder.user_id.last_name}`; 
=======
        // let Name = `${updatedOrder.user_id.first_name} ${updatedOrder.user_id.last_name}`; 
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
        let status = "Status";
        let trackingLink = "---";
        description.name = Name;
        description.order_id = order_id;
        userIds.push(updatedOrder.user_id._id); 

        if (updatedOrder.status === "Cancelled"){ 
          messageNotify = NotificationConstants.OrderCancelledNotfiy(order_id, newStatus, Name)
          description.status = "Cancelled";          
        }else if(updatedOrder.status === "Delivered"){
          messageNotify = NotificationConstants.OrderDeliveredNotify(order_id,newStatus, Name)
          description.status = "Delivered";
          console.log("Order Delivered",description)
        }else if(updatedOrder.status === "Out for delivery"){
          const check_otp = await models.BranchModel.DeliveryOtp.findOne({ user_id : updatedOrder.user_id })
          console.log(check_otp)
          if(check_otp){
            let params = {
              type : "Otp Sent",
              otp : check_otp.otp
            }
    
            const response = await Whatsapp.elseCase(params, phone);
            
            if (response.status === 200) {
            console.log('OTP sent successfully');
            } else {
                console.error('Failed to send OTP:', response.statusText);
            }
          }else{
            const otp = OtpHelper.generateOTP();
            OtpHelper.sendOTPToUser(updatedOrder.user_id.phone  , otp);
            const otpData = new models.BranchModel.DeliveryOtp({ user_id : updatedOrder.user_id , otp : otp})
            const result = await otpData.save();
            // const apiUrl = `https://smspanel.tysindia.com/smsapi/index?key=365FBFC8358994&campaign=2913&routeid=1&type=text&contacts=${phone}&senderid=JOSHAC&msg=Dear%20User,%0A%0APlease%20use%20this%20OTP:%20${otp}%20for%20Delivery%20Verification.%0A%0ARegards,%0AJosh%20Fuel%20App`
            // console.log("Dataa ---- ",otpData)
            // const response = await axios.post(apiUrl);
            let params = {
              type : "Otp Sent",
              otp : otp
            }
    
            const response = await Whatsapp.elseCase(params, existingOrder.user_id.phone);
            
            if (response.status === 200) {
              console.log('OTP sent successfully');
            } else {
                console.error('Failed to send OTP:', response.statusText);
            }
            console.log(response)
          }
          const delivery_link = await models.BranchModel.VehicleLocation.findOne({ vehicle_id: updatedOrder.delivery_id });
          trackingLink = `https://doorstepservices.joshfuels.com/customer/auth/track-order/${order_id}`;
          messageNotify = NotificationConstants.TrackOrderNotify(order_id, Name, trackingLink)
          description.status = "Track";
          const order = await models.BranchModel.Order.findOne({ order_id: order_id });
          const currentDate = new Date();

          const formattedDate = currentDate.getFullYear() + '-' +
                                  String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
                                  String(currentDate.getDate()).padStart(2, '0');
          order.delivery_date = formattedDate;  // Corrected line
          await order.save();  // Ensure you use await to properly save the order

        }else if(updatedOrder.status === "Rejected"){
          messageNotify = NotificationConstants.OrderCancelledNotfiy(order_id, newStatus, Name)
          description.status = "Rejected";
        }else {
          messageNotify = NotificationConstants.OrderStatusNotify(order_id, newStatus, Name)
          description.status = newStatus;
          description.type = "Status";
        }
        
        const messageData = {
          delivery_id : updatedOrder.user_id._id,
          order_id : orderId,
          title : messageNotify.title,
          message : messageNotify.body,
          link : trackingLink,
        }

        const whatsappSend = await Whatsapp.elseCase(description , phone)
        if (whatsappSend.success) {
          console.log('Message sent successfully:', whatsappSend.data);
        } else {
          console.error('Failed to send message:', whatsappSend.data || whatsappSend.error);
        }

        const notify = new models.NotifyModel.Notify(messageData)
        const newNotify = await notify.save()

        await PushNotification.sendPushNotification(userIds, messageData)

        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error:MessageConstants.INTERNAL_SERVER_ERROR});
      }
    },
    
    updatePaymentStatus: async (req, res) => {
      try {
        // Extract data from the request
        const orderId = req.body.orderId;
        const newStatus = req.body.selectedPaymentStatus;
        const dateTime =  new Date();

        console.log(dateTime)

        console.log("body ---",req.body)
        console.log("Status ---",newStatus)
        // Define flags for is_delivered and is_cancelled
        let payment_status = false;
        let message = "Payment Message";
        let name = "John Doe"
    
        // Update flags based on newStatus
        const updatedOrder = await models.BranchModel.Order.findOne({order_id:orderId}).populate('user_id');
        const phone = `+91${updatedOrder.user_id.phone}`;

        let description = {
          type : "Payment",
          status : "Status",
          name : "John Doe",
          order_id : orderId,
        }

        if (newStatus === 'True') {
          payment_status = true;
          name = `${updatedOrder.user_id.first_name} ${updatedOrder.user_id.last_name}`
          message = await NotificationConstants.PaymentSuccessNotify(orderId, "Successfull", name);
          description.status = "Successfull";
          description.name = name
        } else if (newStatus === 'False') {
          payment_status = false;
          name = `${updatedOrder.user_id.first_name} ${updatedOrder.user_id.last_name}`
          message = await NotificationConstants.PaymentFailedNotify(orderId, "Failed", name);
          description.status = "Failed";
          description.name = name
        }

        console.log("Contact Number",phone)

        // Update the order using async/await
        updatedOrder.payment_status = payment_status;
        updatedOrder.updated_date = dateTime
    
        await updatedOrder.save();

        const whatsappSend = await Whatsapp.elseCase(description, phone)
        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Payment Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error:MessageConstants.INTERNAL_SERVER_ERROR});
      }
    },

    assginDeliveryMan: async (req, res) => {
      try {
        // Extract data from the request
        const orderId = req.body.orderId;
        const assignDelivery = req.body.selectedDeliveryMan;

        console.log("body ---",req.body)
        console.log("Status ---",assignDelivery)
        // Define flags for is_delivered and is_cancelled

        const updatedOrder = await models.BranchModel.Order.findOne({order_id:orderId}).populate('delivery_id');

        // Update the order using async/await
        updatedOrder.delivery_id = assignDelivery;
        updatedOrder.delivery_man = "Assigned";
        updatedOrder.is_delivery_man_assigned = true;

        const deliveryData  = await models.BranchModel.Vehicle.findById(updatedOrder.delivery_id);
        const phone = `+91${deliveryData.phone}`;
        console.log(phone)
        const name = `${deliveryData.deliveryman_id}`
        console.log(name)

        let description = {
          type : "DeliveryMan",
          status : "Assigned",
          name : name,
          order_id : orderId,
        }

        const userIds = [];
        userIds.push(deliveryData._id); 
        const messageData = {
          delivery_id : deliveryData._id,
          order_id : orderId,
          title : `${orderId} - Order Assigned !`,
          message : `Order ${orderId} is assigned to you. Ensure a smooth delivery experience!`,
        }

        const notify = new models.NotifyModel.Notify(messageData)
        const newNotify = await notify.save()

        await PushNotification.sendPushNotification(userIds, messageData)
        
        const whatsappSend = await Whatsapp.elseCase(description, phone);
        console.log(whatsappSend)
        await updatedOrder.save();
        console.log(updatedOrder);

        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Payment Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error:MessageConstants.INTERNAL_SERVER_ERROR});
      }
    },

    getInvoice : async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('billing_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
        const bank = await models.BranchModel.Bank.findOne({user_id : order.branch_id});
        console.log(order)
        const vehicle = await models.BranchModel.Vehicle.findOne({deliveryman_id: order.delivery_id})
        const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);
        const deliveryman = await models.BranchModel.Vehicle.find();
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        if(order.status == "Out for delivery"){
          const custom_css = "Out_For_Delivery";

          const error =  `Order ${order.order_id} Details`
          res.render('partials/invoice', { user,order, custom_css, options, bank, vehicle , totalPriceInWords,error, deliveryman});
        }
        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`
        res.render('partials/invoice', { user,order, custom_css, options, bank, vehicle , totalPriceInWords,error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
    
    editInvoice : async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('billing_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
        const bank = await models.BranchModel.Bank.findOne({user_id : order.branch_id});
        console.log(bank)
        const vehicle = await models.BranchModel.Vehicle.findOne({deliveryman_id: order.delivery_id})
        const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);
        const deliveryman = await models.BranchModel.Vehicle.find();
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        if(order.status == "Out for delivery"){
          const custom_css = "Out_For_Delivery";

          const error =  `Order ${order.order_id} Details`
          res.render('admin/order/edit-invoice', { user,order, custom_css, options, bank, vehicle , totalPriceInWords,error, deliveryman});
        }
        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`
        res.render('admin/order/edit-invoice', { user,order, custom_css, options, bank, vehicle , totalPriceInWords,error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

        updateInvoice : async (req,res) => {
      try {
        // Extract data from the request
        const orderId = req.params.orderId;
        console.log("hey i am updating ");

        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        
        const {organsation_name , first_name , last_name , email, phone , shipping_address_1 , shipping_address_2 , shipping_address_city , shipping_address_state , shipping_address_area , shipping_address_pincode , shipping_address_country , billing_address_1 , billing_address_2 , billing_address_city , billing_address_state , billing_address_area , billing_address_pincode , billing_address_country, product_id, price , quantity , discount, delivery_fee, payment_method} = req.body
        console.log(payment_method)
        const orderToUpdate = await models.BranchModel.Order.findById(orderId);

        if (!orderToUpdate) {
          return res.status(404).send('Order not found');
        }

        const productIndex = orderToUpdate.product_items.findIndex((item) => {
          return item.product_id.toString() === product_id.toString();
        });

        if (productIndex !== -1) {
           // Update product details
          orderToUpdate.product_items[productIndex].quantity = quantity;
          orderToUpdate.product_items[productIndex].price = price;
          orderToUpdate.discount = discount;
          orderToUpdate.payment_method = payment_method;

          // Update delivery fee
          orderToUpdate.delivery_fee = delivery_fee;

          // Calculate total and grand total
          orderToUpdate.total_price = (price * quantity);
          orderToUpdate.grand_total = (orderToUpdate.total_price - orderToUpdate.discount + orderToUpdate.delivery_fee);
        } else {
            console.log(`Product not found in the order`);
        }

        const customer = await models.UserModel.User.findById(orderToUpdate.user_id);

        if (!customer) {
          return res.status(404).send('Customer not found');
        }

        customer.first_name = first_name;
        customer.last_name = last_name;
        customer.company = organsation_name;
        customer.phone = phone;
        customer.email = email;

        const shipping_address = await models.UserModel.Address.findOne({ _id : orderToUpdate.address_id});
        console.log("hey i am in shipping ");
        if (!shipping_address) {
          console.log("shipping Not found");
          const address = new models.UserModel.Address({
            user_id : orderToUpdate.user_id,
            address1 : shipping_address_1,
            address2 : shipping_address_2,
            city : shipping_address_city,
            state : shipping_address_state,
            area : shipping_address_area,
            pincode : shipping_address_pincode,
            country : shipping_address_country,
            primary : false
          })
          
          await address.save();
        }
        console.log("shipping found");
        shipping_address.address_1 = shipping_address_1;
        shipping_address.address_2 = shipping_address_2;
        shipping_address.city = shipping_address_city;
        shipping_address.area = shipping_address_area;
        shipping_address.pincode = shipping_address_pincode;
        console.log("Billing Pincode",billing_address_pincode);
        console.log("Shipping Pincode",shipping_address_pincode);
        shipping_address.country = shipping_address_country;
        shipping_address.state = shipping_address_state;

        const billing_address = await models.UserModel.Address.findOne({ _id : orderToUpdate.billing_id});
        console.log("billing enterred");
        if (!billing_address) {
          console.log("billing not Found");
          const address = new models.UserModel.Address({
            user_id : orderToUpdate.user_id,
            address1 : billing_address_1,
            address2 : billing_address_2,
            city : billing_address_city,
            state : billing_address_state,
            area : billing_address_area,
            pincode : billing_address_pincode,
            country : billing_address_country,
            primary : false
          })

          await address.save();
        }

        console.log("billing Found");
        billing_address.address_1 = billing_address_1;
        billing_address.address_2 = billing_address_2;
        billing_address.city = billing_address_city;
        billing_address.area = billing_address_area;
        billing_address.pincode = billing_address_pincode;
        billing_address.country = billing_address_country;
        billing_address.state = billing_address_state;

        await orderToUpdate.save();
        await customer.save();
        await shipping_address.save();
        
        await billing_address.save();
        
        return res.redirect(`/admin/orders/generate-invoice/${orderId}`);
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    sendInvoice : async (req,res) =>{
      try {
        const order_id = req.body.order_id;
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
          const order = await models.BranchModel.Order.findOne({ order_id: order_id }).populate('product_items').populate('branch_id').populate('address_id').populate('billing_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
          const bank = await models.BranchModel.Bank.findOne({ user_id: order.branch_id });
          console.log(bank);
          const vehicle = await models.BranchModel.Vehicle.findOne({ deliveryman_id: order.delivery_id });
          const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);

        
          const recipientEmail = order.user_id.email;
          const subject = `Order #${order_id} confirmed | Thank you for placing your order!`;
          const templateFilePath = path.join(__dirname, Mailer.invoiceEmail);
          const invoiceName = `invoice_${order_id}.pdf`;
          const invoiceLocations = path.join(__dirname, '../../../mailer/invoices',invoiceName);
          console.log(recipientEmail);
        
          // Read the email template file
          const emailTemplateContent = await promisify(fs.readFile)(templateFilePath, 'utf8');

          const renderedEmailContent = ejs.render(emailTemplateContent, { order, options, bank, vehicle, totalPriceInWords });
          const minifiedHtml = minify(renderedEmailContent, {
              removeAttributeQuotes: true,
              collapseWhitespace: true,
          });

          // Generate PDF using Puppeteer
          const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', // adjust the path based on your system
            headless: true,
            args: ['--no-sandbox'],
          });
          const page = await browser.newPage();
          await page.setContent(minifiedHtml);
          const pdfBuffer = await page.pdf({ format: 'A4' });
          await browser.close();

                  
          let upload = false;
          try {
              // Save the PDF locally (optional)
              fs.writeFileSync(invoiceLocations, pdfBuffer);
              upload = true;
              console.log('File write successful');
          } catch (error) {
              console.error('File write failed:', error);
          }

          if (upload === true) {
              console.log("Location which sending",invoiceLocations)
              const emailResult = await Mailer.sendCustomMail(recipientEmail, subject, renderedEmailContent, invoiceLocations, invoiceName);
              console.log(emailResult);

              if (emailResult.success === true) {
                  console.log('Email sent successfully');

                  // If email is successful, remove the file
                  try {
                      // fs.unlinkSync(invoiceLocations);
                      response = true
                      return res.json({ message: 'Email Sent successfully', response });
                  } catch (unlinkError) {
                      console.error('Error removing file:', unlinkError);
                  }
              } else {
                  console.error('Email sending failed:', emailResult);
              }
          }
      } catch (error) {
        console.log(error);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },

    trackOrder :  async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_man');;
        console.log(order)
        const deliveryman = await models.BranchModel.Vehicle.find();
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`

        res.render('admin/order/track', { user, order, custom_css, options, options2 , error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
    
    getStatus :  async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_man');;
        console.log(order)
        const deliveryman = await models.BranchModel.Vehicle.find();
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`

        res.render('admin/order/track', { user, order, custom_css, options, options2 , error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
    
    deleteOrder : async (req, res) => {
      try {
          const session = req.user;
          user_id = session.userId;

          console.log(`User ${session.first_name} Fetching Order Data`)

          if(!user_id){
              return res.status(StatusCodesConstants.ACCESS_DENIED).json({
              status: false,
              status_code: StatusCodesConstants.ACCESS_DENIED,
              message: MessageConstants.NOT_LOGGED_IN,
              })
          }


          const orderId = req.params.order_id;
      
          console.log(orderId)
          // Locate the order by its ID
          const order = await models.BranchModel.Order.findOne(
              { 
                  order_id: orderId,
              });
      
            console.log(order)
          if (!order) {
            const errorMessage = "Didn't Find Any order";
            return res.redirect(`/admin/orders/list/all?error=${encodeURIComponent(errorMessage)}`);
          }
      
          if (order.status === "Cancelled") {
              // Condition 2: If the order status is "Cancelled"                
              const errorMessage = 'Order is Already Cancelled';
            return res.redirect(`/admin/orders/list/all?error=${encodeURIComponent(errorMessage)}`);
          } else if (order.status === "Returned" || order.status === "Failed" || order.status === "Delivered" || order.status === "Out For Delivery") {                
              const message = `${MessageConstants.ORDER_NOT_DELETE} --- cause ${order.status} `
              return res.redirect(`/admin/orders/list/all?error=${encodeURIComponent(message)}`);
          } else {
              // Update the order's status to "cancel" (or any desired status)
              order.status = 'Cancelled'; // Update to your desired status
              order.is_cancelled = true
            
              console.log("I am here ")
              // Save the updated order
              await order.save();
              
              const message = NotificationConstants.OrderCancelled(order.order_id);

              PushNotification.sendPushNotification(user_id, message)

              console.log(`Order ${orderId} has been canceled by ${session.first_name, session.last_name}.`);
              return res.redirect(`/admin/orders/list/all?error=${encodeURIComponent(message)}`);
          }
        } catch (error) {
          console.error('Error canceling order:', error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
            status: false,
            status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
            message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
        }
  },


    getAddOrder : async (req, res) => {
      try {
          const user = req.user;

          if (!user) {
              return res.redirect('/admin/auth/login');
          }

          const products = await models.BranchModel.BranchProduct.find({})
          const usersList = await models.UserModel.User.find({});
          
          res.render('admin/order/add', { user, usersList, products, error: "Add New Order" });
      } catch (error) {
        console.error('Internal Server Error', error);
        return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
          status: false,
          status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
          message: MessageConstants.INTERNAL_SERVER_ERROR,
        });
      }
    },

    postOrder: async (req, res) => {
      try {
          const file = req.file;
          const user = req.user;
          const user_id = user ? user.userId : null;

          if (!user_id) {
              return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                  status: false,
                  status_code: StatusCodesConstants.ACCESS_DENIED,
                  message: MessageConstants.NOT_LOGGED_IN,
              });
          }

          let orders = [];
          if (!file) {
              const { customer_id, billing_id, address_id, quantity ,delivery_date , delivery_time} = req.body;
              if (customer_id && billing_id && address_id && quantity && delivery_date && delivery_time) {
                  orders = [{ customer_id, billing_id, address_id , quantity ,delivery_date , delivery_time}];
              } else {
                  return res.status(StatusCodesConstants.BAD_REQUEST).json({
                      status: false,
                      status_code: StatusCodesConstants.BAD_REQUEST,
                      message: 'Customer ID, product ID, and quantity are required.',
                  });
              }
          } else {
              const fileExtension = path.extname(file.originalname).toLowerCase();
              if (fileExtension === '.csv') {
                  orders = await parseCSV(file.path);
              } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                  orders = await parseExcel(file.path);
              } else {
                  return res.status(StatusCodesConstants.BAD_REQUEST).json({
                      status: false,
                      status_code: StatusCodesConstants.BAD_REQUEST,
                      message: 'Invalid file type. Please upload an Excel or CSV file.',
                  });
              }
          }

          if (!orders || orders.length === 0) {
              return res.status(StatusCodesConstants.BAD_REQUEST).json({
                  status: false,
                  status_code: StatusCodesConstants.BAD_REQUEST,
                  message: 'Orders data is required and must be an array.',
              });
          }

          console.log(`User ${user?.first_name} is creating orders.`);
          const createdOrders = [];
          let grand_total = 0;

          for (const order of orders) {
              const { customer_id, billing_id, address_id , quantity , delivery_date , delivery_time} = order;

              if (!customer_id || !billing_id || !address_id || !quantity || !delivery_date || !delivery_time) {
                  return res.status(StatusCodesConstants.BAD_REQUEST).json({
                      status: false,
                      status_code: StatusCodesConstants.BAD_REQUEST,
                      message: 'Vehicle number, product ID, and quantity are required.',
                  });
              }

              const user_data = await models.UserModel.User.findOne({ _id : customer_id });
              if (!user_data) {
                  return res.status(StatusCodesConstants.NOT_FOUND).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message: 'User not found for the provided Customer ID.',
                  });
              }

              const user_city = await models.UserModel.Address.findOne({ user_id: user_data._id, _id: address_id }); 
              console.log("User's City ----- ",user_city.area);
              const user_address = await models.UserModel.Address.find({ user_id: user_data._id });
              console.log("user all address",user_address)

              // Update primary address using a for loop
              for (let i = 0; i < user_address.length; i++) {
                const address = user_address[i];
                const isPrimary = address._id.toString() === address_id.toString();

                await models.UserModel.Address.updateOne(
                    { _id: address._id },
                    { $set: { primary: isPrimary } }
                );
              }
              console.log("Primary address updated successfully.");

              if (!user_city) {
                  return res.status(StatusCodesConstants.SUCCESS).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message:  MessageConstants.ADDRESS_NOT_PRESENT,
                      data : []
                  });
              }

              const district_of_city = await models.SettingModel.Area.find({ name: user_city.area }).populate('district_id');
              console.log("District of City ----- ",district_of_city[0].district_id);

              if(!district_of_city || district_of_city.length === 0){
                return res.status(StatusCodesConstants.SUCCESS).json({ 
                  status: false,
                  status_code: StatusCodesConstants.NOT_FOUND,
                  message: MessageConstants.BRANCH_NOT_IN_AREA,
                  data : {}
                 });
              }

              const district = district_of_city[0].district_id.name;

              const branchesInDistrict = await models.BranchModel.Branch.find({ district :  district});
              console.log("Branches in District ----- ",branchesInDistrict);

              const branchIds = branchesInDistrict.map(branch => branch._id);
              console.log("This is Branch Ids",branchIds)

              const productsData = await models.BranchModel.BranchProduct.find({ branch: branchIds[0] , is_selling : true});
              console.log("Products Data ----- ",productsData);

              if (!productsData) {
                  return res.status(StatusCodesConstants.NOT_FOUND).json({
                      status: false,
                      status_code: StatusCodesConstants.NOT_FOUND,
                      message: 'Product not found for the provided product ID.',
                  });
              }

              var customer_price = 0;
              const modifiedProductsData = productsData.map(product => {
                if (district_of_city[0].price > 0) {
                  product.branch_price = district_of_city[0].price;
                  customer_price = parseFloat(district_of_city[0].price);
                }
                return product;
              });

              var overall_discount = 0;
              const branchInfo = await models.BranchModel.Branch.findOne({ city: user_city.city });
              if(user_data.is_privilaged === true){
                overall_discount = (user_data.discount + user_data.volume_discount + user_data.card_discount).toFixed(2);
                console.log("total discount ",overall_discount)
                console.log("customer rate ",customer_price)
                customer_price = (customer_price + parseFloat(overall_discount));
              }
              

              const product_detail = {
                  product_id : productsData[0]._id,
                  name: productsData[0].name,
                  image: productsData[0].image,
                  quantity,
                  price: customer_price,
                  discount : overall_discount,
              };

              console.log("Product Detail -----1 ",product_detail);
              const total_discount = quantity * overall_discount;
              const total_price = quantity * customer_price ;
              let grand_total = total_price + user_data.delivery_fee;

              const vehicle = await models.BranchModel.Vehicle.find({ branch_id : branchInfo._id });
              console.log(vehicle)
              
              const lastOrder = await models.BranchModel.Order.find({ branch_id : branchInfo._id});
              const lastOrder_length = lastOrder.length;
                                  
              const vehicle_number = vehicle[0].vehicle_number.slice(-4);
              console.log(vehicle_number)
              
              console.log(lastOrder_length)
              let order_number = "0001";
                                  
              if (lastOrder) {
                order_number = String(Number.parseInt(lastOrder_length) + 1).padStart(4, '0');
              }
                  
              let addressState;
              let addressDistrict;
              
              if(branchInfo.state == "Maharashtra"){ addressState = "MH"
              } else if (branchInfo.state == "Goa"){ addressState = "GA"
              } else if (branchInfo.state == "Karnataka"){ addressState = "KA"
              } else { addressState = branchInfo.state.substring(0, 2); }
              
              if(branchInfo.district == "North Goa"){ addressDistrict = "NOG"
              } else if (branchInfo.district == "South Goa"){ addressDistrict = "SOG"
              } else if (branchInfo.district == "Thane"){ addressDistrict = "THA"
              } else if (branchInfo.district == "Mumbai"){ addressDistrict = "MUM"
              } else if (branchInfo.district == "Karad"){ addressDistrict = "KAR"
              } else if (branchInfo.district == "Sawantwadi"){ addressDistrict = "SAW"
              } else if (branchInfo.district == "Kolhapur"){ addressDistrict = "KOL"
              } else if (branchInfo.district == "Belagavi"){ addressDistrict = "BEL"
              } else { addressDistrict = branchInfo.district.substring(0, 3);
              }
              
<<<<<<< HEAD
              nextOrderId = `${addressState}-${addressDistrict}-${vehicle_number}-${order_number}`
=======
              // nextOrderId = `${addressState}-${addressDistrict}-${vehicle_number}-${order_number}`
              nextOrderId = `${addressState}-${addressDistrict}-${order_number}`
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
              
              console.log(nextOrderId);    

              const formatDate = (dateString) => {
                const [year, month, day] = dateString.split('-');
                return `${day}/${month}/${year}`;
              };
        
            // Reformat the delivery_date
              const formattedDate = formatDate(delivery_date);
              const orderData = {
                  order_id : nextOrderId,
                  user_id: user_data._id,
                  address_id: address_id,
                  billing_id:  billing_id,
                  branch_id: branchInfo._id,
                  product_items: [product_detail],
                  discount : overall_discount,
                  total_price : total_price,
                  grand_total : grand_total,
                  delivery_date : formattedDate,
                  delivery_time : delivery_time,
                  payment_method: user_data.payment_method,
                  delivery_fee: user_data.delivery_fee,
              };

              const newOrder = new models.BranchModel.Order(orderData);
              await newOrder.save();
              createdOrders.push(newOrder);

              // Handle transactions
              const user_wallet = await models.UserModel.Wallet.findOne({ user_id: user_data._id });
              const available_balance = user_wallet.total_credit
              console.log(user_wallet)
              const remaining_balance = available_balance - grand_total;
              if( grand_total >available_balance){
                return res.status(StatusCodesConstants.SUCCESS).json({
                  status: true,status_code: StatusCodesConstants.SUCCESS,
                  message: MessageConstants.WALLET_AMOUNT_EXCEED,
                  data : {},
                  });
              }
              const transaction = await models.UserModel.Wallet.find();
              const transaction_id = `DEB-${transaction.length + 1}`;

              const transactionData = {
                  transaction_id,
                  order_id: nextOrderId,
                  wallet_id: user_wallet._id,
                  debited: grand_total,
                  available: remaining_balance,
                  status: true,
              };

              const newTransaction = new models.UserModel.Transaction(transactionData);
              user_wallet.total_credit = remaining_balance;
              await user_wallet.save();
              await newTransaction.save();

              // WhatsApp flow
              const phone = `+91${user_data.phone}`;
              const adminPhone = `+91${branchInfo.phone}`;
              const params = {
                  type: 'Order Placed',
                  status: 'Order Placed',
                  name: `${user_data.first_name} ${user_data.last_name}`,
                  order_id: nextOrderId,
              };

              const description = {
                  type: 'Admin Alert',
                  status: 'Order Placed',
                  organisation_name: user_data.company,
                  order_id: nextOrderId,
                  quantity : quantity,
                  price: productsData[0].branch_price,
                  discount : overall_discount,
                  customer_phone : user_data.phone
              };

              console.log("admin Alert >>>>>>> -------------", description)
              console.log("Whatsapp Admin Phone -------------", adminPhone)
              console.log("customer alert >>>>>>>>>. -------------", params)
              console.log("Whatsapp Phone -------------", phone)

              await Whatsapp.elseCase(params, phone);
              await Whatsapp.elseCase(description, adminPhone);

              console.log('New Order Created:', newOrder);
          }

          return res.redirect('/admin/orders/list/all')
      } catch (error) {
          console.error('Error in postOrder:', error);
          return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({
              status: false,
              status_code: StatusCodesConstants.INTERNAL_SERVER_ERROR,
              message: MessageConstants.INTERNAL_SERVER_ERROR,
          });
      }
    },


    // getAddSplitBill : async (req, res) => {
    //   const orderId = req.params.orderId;
    //   try {

    //     const user = req.user;
    //     if (!user) {
    //       return res.redirect('/admin/auth/login');
    //     }

    //     const order = await models.BranchModel.Order.findById(orderId).populate('user_id').populate('address_id').populate('branch_id').populate('product_items.product_id').populate('delivery_id');
    //     console.log(order)

    //     const error =  `Spiltting Bill For Order ${order}`
    //     res.render('admin/order/add-split-bill', { user, order, error});

    //   } catch (err) {
    //     console.log(err);
    //     res.redirect(`/admin/orders/details/${orderId}?error=${encodeURIComponent(err)}`);
    //   }
    // },

    // postAddSplitBill : async (req, res) => {
    //   const orderId = req.params.orderId;
    //   const referer = req.get('Referer');
    //   try {
    //     const user = req.user;
    //     if (!user) {
    //       return res.redirect('/admin/auth/login');
    //     }

    //     const existingOrder = await models.BranchModel.Order.findById(orderId).populate('user_id').populate('address_id').populate('branch_id').populate('product_items.product_id').populate('delivery_id');
    //     console.log(existingOrder)
    //     const productId = existingOrder.product_items[0].product_id;

    //     if(existingOrder.is_splited == true){
    //       const error =  `Bill Already Spiltted For Order ${existingOrder.order_id}`
    //       return res.redirect(`${referer}?error=${encodeURIComponent(error)}`);
    //     }else{

    //       const updateData = {
    //         quantity: parseFloat(existingOrder.product_items[0].quantity) - parseFloat(server.split_quantity),
    //         total_price: parseFloat(existingOrder.product_items[0].total_price) - parseFloat(server.split_price),
    //       }

    //       existingOrder.is_splited = true
    //       const productIndex = existingOrder.product_items.findIndex((item) => {
    //         return item.product_id.toString() === productId.toString();
    //       });

    //       if (productIndex !== -1) {
    //         // Update product details
    //         existingOrder.product_items[productIndex].quantity = updateData.quantity;
    //         existingOrder.total_price = updateData.total_price;
    //         existingOrder.product_items[productIndex].grand_total = updateData.grand_total;
    //         existingOrder.grand_total = updateData.grand_total;

    //         await existingOrder.save();


    //         console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
    //         return res.status(StatusCodesConstants.SUCCESS).json({
    //             status: true,
    //             status_code: StatusCodesConstants.SUCCESS,
    //             message: MessageConstants.ORDER_UPDATE_SUCCESSFULLY,
    //             data: existingOrder, // Return the updated order
    //         });
    //       } else {
    //           console.log(`Product not found in the order`);
    //           return res.redirect(`${referer}?error=${encodeURIComponent('Product not found in the order')}`);
    //       }
    //     }

    //     const error =  `Spiltting Bill For Order ${order}`
    //     res.render('admin/order/add-split-bill', { user, order, error});

    //   } catch (err) {
    //     console.log(err);
    //     res.redirect(`/admin/orders/details/${orderId}?error=${encodeURIComponent(err)}`);
    //   }
    // },
}



