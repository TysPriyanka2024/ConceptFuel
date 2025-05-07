const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {NumberHelper} = require('../../../managers/helpers')
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
const options = { day: '2-digit', month: 'short', year: 'numeric' };
const options2 = { timeZone: 'UTC', };



module.exports = {

  // Get Product List
    list : async (req, res) => {
      try{
        const user = req.user;

        if(!user){
          return res.redirect('/branch/auth/login')
        }
      const orders = await models.BranchModel.Order
      .find({branch_id:user.userId})
      .populate('user_id')
      .populate('branch_id') 
      .populate('address_id')
      .populate('delivery_id')
      .sort({ created_date: -1 });
    
      const customers = await models.UserModel.User.find({ usertype: "Customer" });
      const branches = await models.BranchModel.Branch.find();
      const ordersCount = orders.length;
    
      res.render("branch/order/all", {user, branches, ordersCount, customers, orders, options, error: "List of Orders"});
      }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

    getCount : async ( req, res ) =>{
      try {
        const user = req.user;

        if(!user){
          return res.redirect('/branch/auth/login')
        }

        const orderInfo = await models.BranchModel.Order.find({branch_id : user.userId});
        const allCount = orderInfo.length;

        const pending = orderInfo.filter(order => order.status === "Pending");
        const pendingCount = pending.length;

        const confirmed = orderInfo.filter(order => order.status === "Confirmed");
        const confirmCount = confirmed.length;

        const processing = orderInfo.filter(order => order.status === "Processing");
        const processCount = processing.length;

        const outForDelivery = orderInfo.filter(order => order.status === "Out for delivery");
        const deliveryCount = outForDelivery.length;

        const delivered = orderInfo.filter(order => order.status === "Delivered");
        const deliveredCount = delivered.length;

        const failed = orderInfo.filter(order => order.status === "Failed");
        const failedCount = failed.length;

        const cancelled = orderInfo.filter(order => order.status === "Cancelled");
        const cancelledCount = cancelled.length;
        
        const returned = orderInfo.filter(order => order.status === "Returned");
        const returnCount = returned.length;
        
        const rejected = orderInfo.filter(order => order.status === "Rejected");
        const rejectedCount = returned.length;

        const scheduled = orderInfo.filter(order => order.status === "Scheduled");
        const schedludedCount = scheduled.length;

        const payload = {
          all:allCount,
          pending:pendingCount,
          confirmed:confirmCount,
          processing:processCount,
          out:deliveryCount,
          delivered:deliveredCount,
          returned:returnCount,
          failed:failedCount,
          cancelled:cancelledCount,
          scheduled:schedludedCount,
          rejected:rejectedCount
        };

        res.json(payload);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  },

    getDetails : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
        const vehicle = await models.BranchModel.Vehicle.find({branch_id:user.userId});
        if(order.status == "Out for delivery"){
          const custom_css = "Out_For_Delivery";

          const error =  `Order ${order.order_id} Details`
          res.render('branch/order/detail', { user,order, custom_css, options , error, vehicle});
        }
        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`
        res.render('branch/order/detail', { user,order, custom_css, options , error, vehicle});
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

    listByStatus: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }
    
        const { statuses } = req.params; // Extract the status from the URL parameters

        let status = statuses;


        if (statuses === "Out for delivery") {
          status = "out_for_delivery";
        } 
        
        console.log(status)

        // Define a mapping of status values to user-friendly error messages
        const statusMessages = {
          pending: "List of Pending Orders",
          confirmed: "List of Confirm Orders",
          processing: "List of Processing Orders",
          out_for_delivery: "List of Out For Delivery",
          delivered: "List of Delivered Orders",
          returned: "List of Return Orders",
          failed: "List of Failed Orders",
          cancelled: "List of Cancelled Orders",
          scheduled: "List of Scheduled Orders",
          rejected: "List of Rejected Orders",
        };
    
        // Validate if the provided status is in the mapping
        if (!statusMessages[status]) {
          return res.status(400).send('Invalid status');
        }
    
        // Fetch orders based on the provided status
        const orders = await models.BranchModel.Order
          .find({ 
            branch_id:user.userId,
            status: status.charAt(0).toUpperCase() + status.slice(1) 
          }) // Capitalize the status
          .populate('user_id')
          .populate('branch_id')
          .populate('address_id')
          .populate('address_id')
          .populate('delivery_id')
          .sort({ created_date: -1 });
    
        const branches = await models.BranchModel.Branch.find();  

        const customers = await models.UserModel.User.find({ usertype: "Customer" });
        const ordersCount = orders.length;
    
        // Render the view with filtered orders and the appropriate error message
        res.render("branch/order/all", {
          user,
          ordersCount,
          customers,
          orders,
          options,
          branches,
          error: statusMessages[status], // Use the error message from the mapping
        });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },
    
    updateDeliveryStatus: async (req, res) => {
      try {
        const user = req.user;
        // Extract data from the request
        const orderId = req.body.orderId;
        const reason = req.body.rejectionReason;
        console.log(orderId)
        const newStatus = req.body.selectedStatus;

        console.log("body ---",req.body)
        console.log("Status ---",newStatus)
        // Define flags for is_delivered and is_cancelled
        let isDelivered = false;
        let isCancelled = false;
    
        // Update flags based on newStatus
        if (newStatus === 'Delivered') {
          isDelivered = true;
        } else if (newStatus === 'Cancelled') {
          isCancelled = true;
        }
    
        const updatedOrder = await models.BranchModel.Order.findOne({
          order_id: orderId,
          branch_id: user.userId
        });

        console.log(updatedOrder);
        // Update the order using async/await
        updatedOrder.reason = reason;
        updatedOrder.status = newStatus;
        updatedOrder.is_delivered = isDelivered;
        updatedOrder.is_cancelled = isCancelled;
    
        await updatedOrder.save();

        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    
    updatePaymentStatus: async (req, res) => {
      try {
        const user = req.user;
        // Extract data from the request
        const orderId = req.body.orderId;
        const newStatus = req.body.selectedPaymentStatus;

        console.log("body ---",req.body)
        console.log("Status ---",newStatus)
        // Define flags for is_delivered and is_cancelled
        let payment_status = false;
    
        // Update flags based on newStatus
        if (newStatus === 'True') {
          payment_status = true;
        } else if (newStatus === 'False') {
          payment_status = false;
        }
    
        const updatedOrder = await models.BranchModel.Order.findOne({
          order_id:orderId,
          branch_id:user.userId
        });

        console.log(updatedOrder);
        // Update the order using async/await
        updatedOrder.payment_status = payment_status;
    
        await updatedOrder.save();

        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Payment Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    assginDeliveryMan: async (req, res) => {
      try {
        const user = req.user;
        // Extract data from the request
        const orderId = req.body.orderId;
        const assignDelivery = req.body.selectedDeliveryMan;

        console.log("body ---",req.body)
        console.log("Status ---",assignDelivery)
        // Define flags for is_delivered and is_cancelled

        const updatedOrder = await models.BranchModel.Order.findOne({
          order_id:orderId,
          branch_id:user.userId
        });

        // Update the order using async/await
        updatedOrder.delivery_id = assignDelivery;
        updatedOrder.delivery_man = "Assigned";
        updatedOrder.is_delivery_man_assigned = true;
    
        await updatedOrder.save();
        console.log(updatedOrder);

        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Send a response with the updated order
        return res.json({ message: 'Payment Status updated successfully', updatedOrder });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    getInvoice : async (req,res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
        const bank = await models.BranchModel.Bank.findOne({user_id : order.branch_id});
        console.log(bank)
        const deliveryman = await models.BranchModel.Vehicle.find({branch:user.userId});
        if(order.status == "Out for delivery"){
          const custom_css = "Out_For_Delivery";

          const error =  `Order ${order.order_id} Details`
          const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);
          res.render('partials/invoice', { user,order, custom_css, totalPriceInWords, options , bank, error, deliveryman});
        }
        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`
        const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);
        res.render('partials/invoice', { user,order, custom_css, totalPriceInWords, options , bank, error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

    trackOrder :  async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_man');;
        console.log(order)
        const deliveryman = await models.BranchModel.Vehicle.find({
          branch:user.userId
        });
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }

        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`

        res.render('branch/order/track', { user, order, custom_css, options, options2 , error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },
    
    getStatus :  async (req,res) => {
      try {
        const orderId = req.params.id;
        const order = await models.BranchModel.Order.findById(orderId).populate('product_items').populate('branch_id').populate('address_id').populate('user_id').populate('product_items.product_id').populate('delivery_man');;
        console.log(order)
        const deliveryman = await models.BranchModel.Vehicle.find({
          branch:user.userId
        });
        const user = req.user;
        if (!user) {
          return res.redirect('/branch/auth/login');
        }

        const custom_css = order.status;
        const error =  `Order ${order.order_id} Details`

        res.render('branch/order/track', { user, order, custom_css, options, options2 , error, deliveryman});
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
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
                  branch_id : user_id
              });
      
            console.log(order)
          if (!order) {
            const errorMessage = "Didn't Find Any order";
            return res.redirect(`/branch/order/list/all?error=${encodeURIComponent(errorMessage)}`);
          }
      
          if (order.status === "Cancelled") {
              // Condition 2: If the order status is "Cancelled"                
              const errorMessage = 'Order is Already Cancelled';
            return res.redirect(`/branch/order/list/all?error=${encodeURIComponent(errorMessage)}`);
          } else if (order.status === "Returned" || order.status === "Failed" || order.status === "Delivered" || order.status === "Out For Delivery") {                
              const message = `${MessageConstants.ORDER_NOT_DELETE} --- cause ${order.status} `
              return res.redirect(`/branch/order/list/all?error=${encodeURIComponent(message)}`);
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
              return res.redirect(`/branch/order/list/all?error=${encodeURIComponent(message)}`);
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
}



