const { MessageConstants, StatusCodesConstants } = require('../constants');
const { Validator } = require('../../../managers/utils');
const models = require('../../../managers/models');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const { PushNotification } = require("../../../managers/notifications");
const { NotificationConstants } = require("../../../managers/notify");
const axios = require('axios');
const { Whatsapp } = require('../../../managers/whatsapp');
const url = 'https://graph.facebook.com/v17.0/155621414308796/messages';
const accessToken = 'EAAVOmhbOBCABOzqEoVWApgi6VrILRPDpgU9BZBss2AJ4DC0ZBZCk3S2xIikXyIH9hiOMZADxpHaZAf68YFEWZB5PMKN8Nfxc9nZCfZCeGKJkcFsTLAaMzAh280matbrk9IZBEptZB3p4PkaZATcqgHVxEzZCBybzumC7UlQ6gVdlUv5NE9Ol2qqHzNkAZB2fB2OZA4MLaRrZAZBF3h9G4Pchd4ke';
const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
};


function createCreditTransactionId(type , number) {
    const uuid = uuidv4(); // Generate a Version 4 UUID
    const shortUuid = uuid.slice(0, 5); // Take the first 5 characters of the UUID
    const string = number;

    return `${type}-${shortUuid}-${string}`;
  }
  


module.exports = {
    // Get Order Data
        orderList: async (req, res) => {
            try {
                const session = req.user;
                const user_id = session.userId;
                const page = req.query.page ? parseInt(req.query.page) : 0; // Start from page 0
                const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10; // Items per page
                
                var quantity = 0;

                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                const orders = await models.BranchModel.Order.find({
                    user_id: user_id,
                })
                .sort({ updated_date: -1 })
                .skip(page * perPage) // Calculate the skip based on the current page
                .limit(perPage); // Limit the number of results per page
                
                console.log("order", orders)
                if (orders && orders.length > 0) {
                    const populatedOrder = [];
        
                    for (const order of orders) {
                        // Fetch product details for each order item
                        const productData = await Promise.all(order.product_items.map(async (product) => {
                            const productInfo = await models.BranchModel.BranchProduct.findOne({ _id: product.product_id });
                            if (productInfo) {
                                quantity = product.quantity;
                                return {
                                    "product_id": product.product_id,
                                    "product_name": productInfo.name,
                                    "product_img": productInfo.image,
                                    "quantity": product.quantity,
                                    "price": product.price,
                                };
                            }
                            return null;
                        }));
        
                        // Fetch branch, delivery, and address details
                        const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
                        const deliveryInfo = order.is_delivery_man_assigned
                            ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                            : null;
                        const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });
        
                        // Construct data objects
                        const addressData = {
                            address_id: addressInfo._id,
                            address_1: addressInfo.address_1,
                            area: addressInfo.area,
                            city: addressInfo.city,
                            state: addressInfo.state,
                        };
        
                        const branchData = {
                            branch_id: branchInfo._id,
                            branch_name: branchInfo.name,
                            branch_city: branchInfo.city,
                        };
        
                        const overallDisount = quantity * parseFloat(order.discount)
                        console.log("Overall Discount ---" , overallDisount)
                        const total_price = (parseFloat(order.total_price) - overallDisount).toFixed(2)
                        console.log("Total Price Discount ---" , total_price)

                        const orderData = {
                            order_id: order.order_id,
                            coupon_discount: order.coupon_discount,
                            delivery_fee: order.delivery_fee,
                            total_price: total_price,
                            discount: order.discount,
                            delivery_date: order.delivery_date,
                            delivery_time: order.delivery_time,
                            payment_method: order.payment_method,
                            note: order.note,
                            status: order.status,
                            grand_total: order.total_price,
                        };
        
                        const deliveryManData = order.is_delivery_man_assigned
                            ? {
                                deliveryMan_id: deliveryInfo._id,
                                deliveryMan_name: deliveryInfo.name,
                            }
                            : {
                                deliveryMan_name: order.delivery_man,
                            };
        
                        // Construct the order item data
                        const orderItemData = {
                            ordered_address: addressData,
                            ordered_branch: branchData,
                            ordered_products: productData,
                            order_detail: orderData,
                            assigned_deliveryMan: deliveryManData,
                        };
        
                        populatedOrder.push(orderItemData);
                    }
        
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_FETCHED_SUCCESSFULLY,
                        data: {
                            orders: populatedOrder,
                        },
                    });
                } else {
                    // No orders found for the user
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_NOT_FOUND,
                        data: {
                            orders: [],
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },
        
    // Get Order Data
        perOrder: async (req, res) => {
            try {
                // Extract user session information
                const session = req.user;
                const user_id = session.userId;
                const order_id = req.body.order_id;
        
                // Check if the user is logged in
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                // Query the database to fetch orders for the user
                const orders = await models.BranchModel.Order.find({
                    user_id: user_id,
                    order_id : order_id
                });
        
                // Check if any orders were found
                if (orders && orders.length > 0) {
                    const populatedOrder = [];
        
                    for (const order of orders) {
                        // Fetch product details for each order item
                        const productData = await Promise.all(order.product_items.map(async (product) => {
                            const productInfo = await models.BranchModel.BranchProduct.findOne({ _id: product.product_id });
                            if (productInfo) {
                                return {
                                    "product_id": product.product_id,
                                    "product_name": productInfo.name,
                                    "product_img": productInfo.image,
                                    "quantity": product.quantity,
                                    "discount": order.discount,
                                    "price": product.price,
                                };
                            }
                            return null;
                        }));
        
                        // Fetch branch, delivery, and address details
                        const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
                        const deliveryInfo = order.is_delivery_man_assigned
                            ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                            : null;
                        const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });
        
                        // Construct data objects
                        const addressData = {
                            address_id: addressInfo._id,
                            address_1: addressInfo.address_1,
                            area: addressInfo.area,
                            city: addressInfo.city,
                            state: addressInfo.state,
                        };
        
                        const branchData = {
                            branch_id: branchInfo._id,
                            branch_name: branchInfo.name,
                            branch_city: branchInfo.city,
                        };
        
                        console.log("discount --- ",order.discount,)
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
                        };
        
                        const deliveryManData = order.is_delivery_man_assigned
                            ? {
                                deliveryMan_id: deliveryInfo._id,
                                deliveryMan_name: deliveryInfo.name,
                            }
                            : {
                                deliveryMan_name: order.delivery_man,
                            };
        
                        // Construct the order item data
                        const orderItemData = {
                            ordered_address: addressData,
                            ordered_branch: branchData,
                            ordered_products: productData,
                            order_detail: orderData,
                            assigned_deliveryMan: deliveryManData,
                        };
        
                        populatedOrder.push(orderItemData);
                    }
        
                    console.log(`User ${session.first_name} ${MessageConstants.ORDER_FETCHED_SUCCESSFULLY}`);
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_FETCHED_SUCCESSFULLY,
                        data: {
                            orders: populatedOrder,
                        },
                    });
                } else {
                    // No orders found for the user
                    console.log("No orders found");
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_NOT_FOUND,
                        data: {
                            orders: [],
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },
    
    // Add Order Data
        addOrder : async (req, res) => {
            try {
                const user = req.user;
                user_id = user.userId;
    
                console.log(`User ${user.first_name} Fetching Order Data`)
    
                if(!user_id){
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                    status: false,
                    status_code: StatusCodesConstants.ACCESS_DENIED,
                    message: MessageConstants.NOT_LOGGED_IN,
                    })
                }

                const status = req.body.is_billing_id_available;

                if (status === false) {
                    billing_address = req.body.address_id;    
                } else {
                    billing_address = req.body.billing_id;
                    if (billing_address === null || billing_address === undefined) {
                        return res.status(StatusCodesConstants.NOT_FOUND).json({
                            status: false,
                            status_code: StatusCodesConstants.NOT_FOUND,
                            message: "Billing Address Not Found",
                        });
                    }
                }

                const user_data = await models.UserModel.User.findOne({ _id : user_id });
                
                console.log("userdata------",user_data);

                const orderData = {
                    user_id : user_id,
                    address_id : req.body.address_id,
                    billing_id : billing_address,
                    cart_id : req.body.cart_id,
                    coupon_discount : req.body.coupon_discount,
                    total_price : req.body.total_price,    
                    delivery_fee : req.body.delivery_fee,    
                    delivery_date : req.body.delivery_date,
                    delivery_time : req.body.delivery_time,
                    payment_method : user_data.payment_method,
                    note : req.body.note ,
                    grand_total : req.body.grand_total,
                        
                }

                console.log("orderdata --- ", orderData)
                const validationResult = Validator.validate(orderData, {
                    address_id: {
                      presence : {allowEmpty :false},
                    },
                    cart_id : {
                      presence : {allowEmpty : false }
                    },
                    total_price : {
                      presence : {allowEmpty : false }
                    },
                    coupon_discount : {
                      presence : {allowEmpty : false }
                    },
                    payment_method: {
                        presence: { allowEmpty: false }, 
                        length: { minimum: 3, maximum: 100 },
                    },
                    delivery_fee: {
                      presence: { allowEmpty: false },
                    },
                    delivery_date: {
                      presence: { allowEmpty: false },
                      length: { minimum: 3, maximum: 100 },
                    },
                    delivery_time: {
                      presence: { allowEmpty: false }, 
                      length: { minimum: 3, maximum: 100 },
                    },
                    grand_total: {
                      presence: { allowEmpty: false }, 
                    }
                });
              
                if (validationResult) {
                    return res.status(StatusCodesConstants.BAD_REQUEST).json({
                      status: false,
                      status_code: StatusCodesConstants.BAD_REQUEST,
                      message: validationResult,
                    });
                }

                const cartInfo = await models.BranchModel.Cart.findOne({
                    _id: orderData.cart_id,
                });
                console.log("cartInfo-------------",cartInfo);
                
                const orderprice = cartInfo.product_items[0].quantity * cartInfo.product_items[0].price;
                const user_wallet = await models.UserModel.Wallet.findOne({ user_id : user_id});

                available_balance = user_wallet.total_credit;

                console.log("availablebalance " ,available_balance)

                if(orderprice < available_balance){
                    const addressInfo = await models.UserModel.Address.findOne({
                        _id: orderData.address_id,
                        user_id: user_id,
                    });
                    
                    const branchInfo = await models.BranchModel.Branch.findOne({
                        _id: cartInfo.branch_id,
                    });
                    
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

                    if(branchInfo.state == "Maharashtra"){
                        addressState = "MH"
                    } else if (branchInfo.state == "Goa"){
                        addressState = "GA"
                    } else if (branchInfo.state == "Karnataka"){
                        addressState = "KA"
                    } else {
                        addressState = branchInfo.state.substring(0, 2);
                    }

                    if(branchInfo.district == "North Goa"){
                        addressDistrict = "NOG"
                    } else if (branchInfo.district == "South Goa"){
                        addressDistrict = "SOG"
                    } else if (branchInfo.district == "Thane"){
                        addressDistrict = "THA"
                    } else if (branchInfo.district == "Mumbai"){
                        addressDistrict = "MUM"
                    } else if (branchInfo.district == "Karad"){
                        addressDistrict = "KAR"
                    } else if (branchInfo.district == "Sawantwadi"){
                        addressDistrict = "SAW"
                    } else if (branchInfo.district == "Kolhapur"){
                        addressDistrict = "KOL"
                    } else if (branchInfo.district == "Belagavi"){
                        addressDistrict = "BEL"
                    } else {
                        addressDistrict = branchInfo.district.substring(0, 3);
                    }

                    // nextOrderId = `${addressState}-${addressDistrict}-${vehicle_number}-${order_number}`
                    nextOrderId = `${addressState}-${addressDistrict}-${order_number}`

                    console.log("nextorderid----",nextOrderId);
                    
                    const products = cartInfo.product_items;
                    
                    if (products && products.length !== 0) {
                        const populatedCart = [];
                    
                        // Iterate through each product item in the cart
                        for (const product of products) {
                            // Manually populate the product and branch details from the referenced models
                            const productInfo = await models.BranchModel.BranchProduct.findOne({ _id: product.product_id });
                            if (productInfo) {
                                const productData = {
                                    products: [
                                        {
                                            "product_id": product.product_id,
                                            "product_name": productInfo.name,
                                            "product_img": productInfo.image,
                                            "quantity": product.quantity,
                                            "price": product.price,
                                            "discount": cartInfo.discount,
                                            "_id": product._id,
                                        },
                                    ],
                                };
                    
                                populatedCart.push(productData);
                            }
                        }
    
                        const existingOrder = await models.BranchModel.Order.findOne({
                            user_id: user.userId,
                            branch_id: cartInfo.branch_id,
                            product_items: { $eq: cartInfo.product_items[0].product_id }, // Compare the product_items array
                            status: "Pending",
                        });
                
                        console.log(existingOrder)
                        if (existingOrder) {
                            // If an existing order is found, return an error response
                            console.log("iam here");
                            return res.status(StatusCodesConstants.SUCCESS).json({
                                status: true,
                                status_code: StatusCodesConstants.SUCCESS,
                                message: MessageConstants.ORDER_ALREADY_REGISTERED,
                                data : existingOrder,
                            });
                        }
    
                        const orderItem = {
                            order_id : nextOrderId,
                            user_id : user.userId,
                            branch_id : cartInfo.branch_id,    
                            product_items : cartInfo.product_items,
                            address_id: orderData.address_id,
                            billing_id : orderData.billing_id,
                            discount : cartInfo.discount,
                            coupon_discount : orderData.coupon_discount,    
                            delivery_fee : orderData.delivery_fee,    
                            total_price : orderData.total_price,    
                            delivery_date : orderData.delivery_date,
                            delivery_time : orderData.delivery_time,
                            payment_method : orderData.payment_method,
                            note : orderData.note,
                            status : "Pending",
                            delivery_man : "Not Assigned Yet",
                            grand_total : orderData.grand_total
                        };
                        const newOrder = new models.BranchModel.Order(orderItem);
                        await newOrder.save();

                        // Delete the cart after successfully adding the order
                        await models.BranchModel.Cart.deleteOne({ _id: orderData.cart_id });
    
                        const deliveryInfo = newOrder.is_delivery_man_assigned
                        ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                        : null;
    
                        const deliveryManData = newOrder.is_delivery_man_assigned
                        ? {
                            deliveryMan_id: deliveryInfo._id,
                            deliveryMan_name: deliveryInfo.fname + deliveryInfo.lname ,
                        }
                        : {
                            deliveryMan_name: orderData.delivery_man,
                        };
    
    
                        const orderDetails = {
                            order_id : nextOrderId,
                            coupon_discount : orderData.coupon_discount,    
                            delivery_fee : orderData.delivery_fee,    
                            total_price : orderData.total_price,    
                            delivery_date : orderData.delivery_date,
                            delivery_time : orderData.delivery_time,
                            payment_method : orderData.payment_method,
                            note : orderData.note,
                            grand_total : orderData.grand_total,
                            discount: cartInfo.discount,
                            status : orderItem.status,
                            delivery_man : orderItem.delivery_man,
                        }
                        
                        const addressInfo = await models.UserModel.Address.findOne({ _id: orderData.address_id });
            
                        // Construct data objects
                        const addressData = {
                            billing_id : orderItem.billing_id,
                            address_id: addressInfo._id,
                            address_1: addressInfo.address_1,
                            area: addressInfo.area,
                            city: addressInfo.city,
                            state: addressInfo.state,
                        };
        
                        const userData = {
                            first_name: user.first_name,
                            last_name: user.last_name,
                            phone: user.phone,
                            email: user.email,
                        };
        
                        const branchData = {
                            branch_id: branchInfo._id,
                            branch_name: branchInfo.name,
                            branch_city: branchInfo.city,
                        };
    
                        const orderItems = {
                            user: userData,
                            address: addressData,
                            branch: branchData,
                            userData : userData ,
                            cartData: populatedCart,
                            orderData : orderDetails,
                            deliveryInfo : deliveryManData
                        };
    
                        console.log("trouble --3 ")
    

                        const Name = `${user.first_name} ${user.last_name}`;
                        
                        let description = {
                            type : "Admin Alert",
                            status : "Order Placed",
                            organisation_name : user_data.company,
                            order_id : orderDetails.order_id,
                            quantity : populatedCart[0].products[0].quantity,
                            price : populatedCart[0].products[0].price,
                            discount : cartInfo.discount,
                            customer_phone : user.phone
                        }

                        let params = {
                            type : "Placed",
                            status : "Order Placed",
                            name : `${user.first_name} ${user.last_name}`,
                            order_id : orderDetails.order_id,
                        }


                        const phone = `+91${user.phone}`;
                        const adminPhone = `+91${branchInfo.phone}`;
                        // Transaction History
                        const remaining_balance = available_balance - orderData.grand_total;

                        const transaction = await models.UserModel.Wallet.find();
                        const walletLength = transaction.length;
                        const number = walletLength + 1;


                        const transactionData = {
                            transaction_id : createCreditTransactionId("DEB", number),
                            order_id : orderItem.order_id,
                            wallet_id : user_wallet._id,
                            debited : orderData.grand_total,
                            available : remaining_balance,
                            status : true
                        }

                        user_wallet.total_credit = remaining_balance;

                        const newTranscation = new models.UserModel.Transaction(transactionData)

                        await user_wallet.save();
                        await newTranscation.save();
                        
                        await Whatsapp.elseCase(params, phone);
                        await Whatsapp.elseCase(description, adminPhone);

                        console.log("User WhatsApp Params: ", params, "User Phone: ", phone);
                        console.log("Admin WhatsApp Params: ", description, "Admin Phone: ", adminPhone);


                        console.log(`User ${user.first_name} ${MessageConstants.ORDER_ADD_SUCCESSFULLY} and ${orderData.cart_id} Deleted SuccessFully`)
                        return res.status(StatusCodesConstants.SUCCESS).json({
                            status: true,
                            status_code: StatusCodesConstants.SUCCESS,
                            message: MessageConstants.ORDER_ADD_SUCCESSFULLY,
                            data: {
                                order : orderItems
                            },
                        });
                    }else{
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.CART_EMPTY,
                        data: {
                            cartData: [],
                        },
                    });
                    }
                }else{
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.WALLET_AMOUNT_EXCEED,
                        data : {},
                    });
                }
            }catch(error){
                console.error('Error fetching data:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },

    // Update Order Data
        updateOrder: async (req, res) => {
            try {
                const session = req.user;
                const user_id = session.userId;
        
                console.log(`User ${session.first_name} Fetching Order Data -- Update Order`);
        
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                const updateData = {
                    user_id: user_id,
                    order_id: req.body.order_id,
                    product_id: req.body.product_id,
                    quantity: req.body.quantity,
                    total_price: req.body.total_price,
                    grand_total: req.body.grand_total,
                };
        
                const validationResult = Validator.validate(updateData, {
                    order_id: {
                        presence: { allowEmpty: false },
                        length: { minimum: 3 }
                    },
                    product_id: {
                        presence: { allowEmpty: false }
                    },
                    quantity: {
                        presence: { allowEmpty: false },
                    },
                    total_price: {
                        presence: { allowEmpty: false },
                    },
                    grand_total: {
                        presence: { allowEmpty: false },
                    }
                });
        
                if (validationResult) {
                    return res.status(StatusCodesConstants.BAD_REQUEST).json({
                        status: false,
                        status_code: StatusCodesConstants.BAD_REQUEST,
                        message: validationResult,
                    });
                }
        
                const existingOrder = await models.BranchModel.Order.findOne({
                    order_id: updateData.order_id,
                    user_id: user_id
                });
        
                if (existingOrder) {
                    // Find the product index within the existing order
                    const productIndex = existingOrder.product_items.findIndex((item) => {
                        return item.product_id.toString() === updateData.product_id.toString();
                    });
        
                    if (productIndex !== -1) {
                        // Update product details
                        existingOrder.product_items[productIndex].quantity = updateData.quantity;
                        existingOrder.total_price = updateData.total_price;
                        existingOrder.product_items[productIndex].grand_total = updateData.grand_total;
                        existingOrder.grand_total = updateData.grand_total;
        
                        await existingOrder.save();


                        console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
                        return res.status(StatusCodesConstants.SUCCESS).json({
                            status: true,
                            status_code: StatusCodesConstants.SUCCESS,
                            message: MessageConstants.ORDER_UPDATE_SUCCESSFULLY,
                            data: existingOrder, // Return the updated order
                        });
                    } else {
                        console.log(`Product not found in the order`);
                        return res.status(StatusCodesConstants.NOT_FOUND).json({
                            status: false,
                            status_code: StatusCodesConstants.NOT_FOUND,
                            message: MessageConstants.PRODUCT_NOT_FOUND_IN_ORDER,
                        });
                    }
                } else {
                    console.log(`Order not found for the user`);
                    return res.status(StatusCodesConstants.NOT_FOUND).json({
                        status: false,
                        status_code: StatusCodesConstants.NOT_FOUND,
                        message: MessageConstants.ORDER_NOT_FOUND,
                    });
                }
            } catch (error) {
                console.error('Error updating order:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },
        
    // Delete API 
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


                const orderId = req.body.order_id;
            
                // Locate the order by its ID
                const order = await models.BranchModel.Order.findOne(
                    { 
                        order_id: orderId,
                        user_id : user_id,
                    });
            
                if (!order) {
                  return res.status(StatusCodesConstants.SUCCESS).json({
                    status: false,
                    status_code: StatusCodesConstants.SUCCESS,
                    message: MessageConstants.ORDER_NOT_FOUND,
                    data : []
                  });
                }
            
                if (order.status === "Cancelled") {
                    // Condition 2: If the order status is "Cancelled"                
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_ALREADY_Cancelled,
                        data : {
                            order : []
                        }
                    });
                } else if (order.status === "Returned" || order.status === "Failed" || order.status === "Delivered" || order.status === "Out For Delivery") {                
                    const message = `${MessageConstants.ORDER_NOT_DELETE} --- cause ${order.status} `
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_NOT_DELETE,
                        data : message
                    });
                } else {
                    // Update the order's status to "cancel" (or any desired status)
                    order.status = 'Cancelled'; // Update to your desired status
                    order.is_cancelled = true
                
                    // Save the updated order
                    await order.save();
                    
                    const message = NotificationConstants.OrderCancelled(order.order_id);

                    PushNotification.sendPushNotification(user_id, message)

                    console.log(`Order ${orderId} has been canceled by ${session.first_name, session.last_name}.`);
                
                    return res.status(StatusCodesConstants.SUCCESS).json({
                    status: true,
                    status_code: StatusCodesConstants.SUCCESS,
                    message: MessageConstants.ORDER_DELETED,
                    data : order
                    });
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

        singleOrder: async (req, res) => {
            try {
                // Extract user session information
                const session = req.user;
                const user_id = session.userId;
        
                // Check if the user is logged in
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                // Query the database to fetch orders for the user
                const orders = await models.BranchModel.Order.find({
                    user_id: user_id,
                }).sort({ updated_date: -1 });
        
                // Check if any orders were found
                if (orders && orders.length > 0) {
                    const order = orders[0]; // Get the first order

                    // Fetch product details for the first order item
                    const productData = await Promise.all(order.product_items.map(async (product) => {
                        const productInfo = await models.BranchModel.BranchProduct.findOne({ _id: product.product_id });
                        if (productInfo) {
                            return {
                                "product_id": product.product_id,
                                "product_name": productInfo.name,
                                "product_img": productInfo.image,
                                "quantity": product.quantity,
                                "price": product.price,
                            };
                        }
                        return null;
                    }));

                    // Fetch branch, delivery, and address details for the first order
                    const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
                    const deliveryInfo = order.is_delivery_man_assigned
                        ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                        : null;
                    const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });

                    // Construct data objects for the first order
                    const addressData = {
                        address_id: addressInfo._id,
                        address_1: addressInfo.address_1,
                        area: addressInfo.area,
                        city: addressInfo.city,
                        state: addressInfo.state,
                    };

                    const branchData = {
                        branch_id: branchInfo._id,
                        branch_name: branchInfo.name,
                        branch_city: branchInfo.city,
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
                    };

                    const deliveryManData = order.is_delivery_man_assigned
                        ? {
                            deliveryMan_id: deliveryInfo._id,
                            deliveryMan_name: deliveryInfo.name,
                        }
                        : {
                            deliveryMan_name: order.delivery_man,
                        };

                    // Construct the order item data for the first order
                    const orderItemData = {
                        ordered_address: addressData,
                        ordered_branch: branchData,
                        ordered_products: productData,
                        order_detail: orderData,
                        assigned_deliveryMan: deliveryManData,
                    };

                    console.log(`User ${session.first_name} ${MessageConstants.ORDER_FETCHED_SUCCESSFULLY}`);
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_FETCHED_SUCCESSFULLY,
                        data: {
                            orders: [orderItemData], // Return an array with only the data for the first order
                        },
                    });
                } else {
                    // No orders found for the user
                    console.log("No orders found");
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_NOT_FOUND,
                        data: {
                            orders: [],
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },

        getStatus : async ( req, res) => {
            try{
                // Extract user session information
                const session = req.user;
                const user_id = session.userId;
        
                // Check if the user is logged in
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                // Query the database to fetch orders for the user
                const orders = await models.BranchModel.Order.find({
                    user_id: user_id,
                }).sort({ updated_date: -1 });
        
                console.log(orders)
                // Check if any orders were found
                if (orders && orders.length > 0) {
                    const order = orders[0]; // Get the first order

                    // Fetch branch, delivery, and address details for the first order
                    const branchInfo = await models.BranchModel.Branch.findOne({ _id: order.branch_id });
                    const deliveryInfo = order.is_delivery_man_assigned
                        ? await models.BranchModel.Vehicle.findOne({ _id: order.delivery_id })
                        : null;

                        console.log(deliveryInfo)
                    const addressInfo = await models.UserModel.Address.findOne({ _id: order.address_id });
                    console.log(deliveryInfo !== null)
                    if(!deliveryInfo !== null){
                        // Construct data objects for the first order
                        const addressData = {
                            address_id: addressInfo._id,
                            address_1: addressInfo.address_1,
                            area: addressInfo.area,
                            city: addressInfo.city,
                            state: addressInfo.state,
                        };

                        const branchData = {
                            branch_id: branchInfo._id,
                            branch_name: branchInfo.name,
                            branch_city: branchInfo.city,
                        };
                        const vehicleLocation = await models.BranchModel.VehicleLocation.findOne({ vehicle_id : deliveryInfo._id });
                        const deliveryManData = order.is_delivery_man_assigned
                            ? {
                                deliveryMan_id: deliveryInfo._id,
                                deliveryMan_name: deliveryInfo.name,
                                latitude : vehicleLocation.latitude,
                                longitude : vehicleLocation.longitude,
                                link : vehicleLocation.link
                            }
                            : {
                                deliveryMan_name: order.delivery_man,
                                vehicle_id: vehicleLocation.vehicle_id,
                                latitude : vehicleLocation.latitude,
                                longitude : vehicleLocation.longitude,
                            };

                        // Construct the order item data for the first order
                        const orderItemData = {
                            ordered_address: addressData,
                            ordered_branch: branchData,
                            assigned_deliveryMan: deliveryManData,
                        };

                        console.log(`User ${session.first_name} ${MessageConstants.ORDER_FETCHED_SUCCESSFULLY}`);
                        return res.status(StatusCodesConstants.SUCCESS).json({
                            status: true,
                            status_code: StatusCodesConstants.SUCCESS,
                            message: MessageConstants.ORDER_FETCHED_SUCCESSFULLY,
                            data: {
                                orders: [orderItemData], // Return an array with only the data for the first order
                            },
                        });   
                    }else{
                        console.log("Not Out For Delivery");
                        return res.status(StatusCodesConstants.SUCCESS).json({
                            status: true,
                            status_code: StatusCodesConstants.SUCCESS,
                            message: "Order is not out for delivery yet",
                            data: {
                                orders: [],
                            },
                        });
                    }
                } else {
                    // No orders found for the user
                    console.log("No orders found");
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.ORDER_NOT_FOUND,
                        data: {
                            orders: [],
                        },
                    });
                }
            }catch (error) {
                console.error('Error fetching orders:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },

        lastOrder: async (req, res) => {
            try{
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

                const  lastOrder = await models.BranchModel.Order.findOne({ user_id : user_id })
                                    .populate("address_id")
                                    .sort({ updated_date: -1 });

                console.log(lastOrder)  
                return res.status(StatusCodesConstants.SUCCESS).json({
                    status: true,
                    status_code: StatusCodesConstants.SUCCESS,
                    message: "Last Order Fetched Successfully",
                    data:  lastOrder,
                });
            }
            catch(error){
                console.error('Error fetching orders:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });  
            }
        }
}  
  
  
  