const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const axios  = require('axios');
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

async function reverseGeocode(address) {
  try {
      // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyCmv7mDVQYkq3euCTbIa6vI5NxU8iyOTb8`;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyCOSLNx2YesgpKBIckkEi_fGhjZQ_tyMo4`;

      const response = await axios.get(url);
      
      if (response.data.status === 'OK') {
          const location = response.data.results[0].geometry.location;
          const latitude = location.lat;
          const longitude = location.lng;
          return { latitude, longitude };
      } else {
          console.error('Geocoding failed. Status:', response.data.status);
          return null;
      }
  } catch (error) {
      console.error('Error occurred during geocoding:', error.message);
      return null;
  }
}


module.exports = {
    trackOrder :  async (req,res) => {
      try {
        const orderId = req.params.orderId;
        const orders = await models.BranchModel.Order.find({
          order_id : orderId
        }).sort({ updated_date: -1 });
        const user = {
          usertype : "Customer"
        }
        const order = orders[0]; // Get the first order
        console.log(order === undefined)
        if(order === undefined){
          return res.render('track', {orderItemData : "undefined" ,user , error : "Order Status" });
        }else{
          if(order.status === "Out for delivery"){
            // Fetch branch, delivery, and address details for the first order
            const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
            const deliveryInfo = order.is_delivery_man_assigned
                ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                : null;

            console.log(deliveryInfo)
            const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });

              const Fulladdress = `${addressInfo.address_1},${addressInfo.address_2}, ${addressInfo.pincode},${addressInfo.area}, ${addressInfo.city}, ${addressInfo.state}`
              var userLat;
              var userLong;
              await reverseGeocode(Fulladdress)
              .then(result => {
                if (result) {
                    console.log("Latitude:", result.latitude);
                    userLat = result.latitude;
                    console.log("Longitude:", result.longitude);
                    userLong = result.longitude;
                }})
              .catch(error => console.error("An error occurred:", error));
        
              // Construct data objects for the first order
              const addressData = {
                  address_id: addressInfo._id,
                  address_1: addressInfo.address_1,
                  area: addressInfo.area,
                  city: addressInfo.city,
                  state: addressInfo.state,
                  latitude : userLat,
                  longitude : userLong
              };

              const orderData = {
                order_id: order.order_id,
                coupon_discount: order.coupon_discount,
                delivery_fee: order.delivery_fee,
                total_price: order.total_price,
                discount: order.discount,
                delivery_date: order.delivery_date,
                delivery_time: order.delivery_time,
                payment_method: order.payment_method,
                note: order.note,
                status: order.status,
                grand_total: order.grand_total,
                delivered_date: order.delivered_date || "---",
            };

              const branchData = {
                  branch_id: branchInfo._id,
                  branch_name: branchInfo.name,
                  branch_city: branchInfo.city,
              };
              const vehicleLocation = await models.BranchModel.VehicleLocation.findOne({ vehicle_id : deliveryInfo.id });
              console.log(vehicleLocation)
              const deliveryManData = order.is_delivery_man_assigned
                  ? {
                      deliveryMan_id: deliveryInfo._id,
                      deliveryMan_name: deliveryInfo.deliveryman_id,
                      latitude : vehicleLocation.latitude,
                      longitude : vehicleLocation.longitude,
                      link : vehicleLocation.maps_link
                  }
                  : {
                      deliveryMan_name: order.delivery_man,
                      vehicle_id: vehicleLocation.vehicle_id,
                      latitude : vehicleLocation.latitude,
                      longitude : vehicleLocation.longitude,
                  };

              // Construct the order item data for the first order
              const orderItemData = {
                  orderData : orderData,
                  ordered_address: addressData,
                  ordered_branch: branchData,
                  assigned_deliveryMan: deliveryManData,
              };

              console.log(orderItemData);
              return res.render('track', { orderItemData , user , error : "Order Status" });
          } else if (typeof order === 'undefined' || order.status !== "Out for delivery"){
            return res.render('track', {orderItemData : "null" ,user , error : "Order Status" });
          } else {
            return res.render('track', {orderItemData : "null" ,user , error : "Order Status" });
          }
        }
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
    
    trackOrderApi :  async (req,res) => {
      try {
        console.log('this hitted')
        const orderId = req.params.orderId;
        const orders = await models.BranchModel.Order.find({
          order_id : orderId,
        }).sort({ updated_date: -1 });

        const order = orders[0]; // Get the first order

        // Fetch branch, delivery, and address details for the first order
        const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
        const deliveryInfo = order.is_delivery_man_assigned
            ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
            : null;

        console.log(deliveryInfo)
        const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });

          const Fulladdress = `${addressInfo.address_1},${addressInfo.address_2}, ${addressInfo.pincode},${addressInfo.area}, ${addressInfo.city}, ${addressInfo.state}`
          var userLat;
          var userLong;
          await reverseGeocode(Fulladdress)
          .then(result => {
            if (result) {
                console.log("Latitude:", result.latitude);
                userLat = result.latitude;
                console.log("Longitude:", result.longitude);
                userLong = result.longitude;
            }})
          .catch(error => console.error("An error occurred:", error));
    
          // Construct data objects for the first order
          const addressData = {
              address_id: addressInfo._id,
              address_1: addressInfo.address_1,
              area: addressInfo.area,
              city: addressInfo.city,
              state: addressInfo.state,
              latitude : userLat,
              longitude : userLong
          };

          const vehicleLocation = await models.BranchModel.VehicleLocation.findOne({ vehicle_id : deliveryInfo.id });
          const deliveryManData = order.is_delivery_man_assigned
              ? {
                  deliveryMan_id: deliveryInfo._id,
                  deliveryMan_name: deliveryInfo.deliveryman_id,
                  latitude : parseFloat(vehicleLocation.latitude),
                  longitude :parseFloat(vehicleLocation.longitude),
                  link : vehicleLocation.maps_link
              }
              : {
                  deliveryMan_name: order.delivery_man,
                  vehicle_id: vehicleLocation.vehicle_id,
                  latitude : parseFloat(vehicleLocation.latitude),
                  longitude : parseFloat(vehicleLocation.longitude)
              };

          // Construct the order item data for the first order
          const orderItemData = {
              ordered_address: addressData,
              assigned_deliveryMan: deliveryManData,
          };
          return res.json({ message: 'Location Fetched Successfully', orderItemData });
      } catch (err) {
        console.log(err);
        res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).send(MessageConstants.INTERNAL_SERVER_ERROR);
      }
    },
}

