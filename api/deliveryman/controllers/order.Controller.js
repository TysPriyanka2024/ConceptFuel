const { MessageConstants, StatusCodesConstants } = require('../constants');
const { Validator } = require('../../../managers/utils');
const models = require('../../../managers/models');
const { s3Client,PRIVATE_BUCKET } = require("../../../managers/utils/s3Client");
const { NotificationConstants } = require("../../../managers/notify");
const minify = require('html-minifier').minify;
const { Mailer } = require('../../../mailer');
const ejs = require('ejs');
const fs = require('fs'); // Import the 'fs' module for file operations
const path = require("path");  
const puppeteer = require('puppeteer-core');
<<<<<<< HEAD
const { NumberHelper } = require("../../../managers/helpers");
=======
const { NumberHelper , OtpHelper } = require("../../../managers/helpers");
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
const { promisify } = require('util');  
const options = { day: '2-digit', month: 'short', year: 'numeric' };
const options2 = { timeZone: 'UTC' }
const axios = require('axios');
const url = 'https://graph.facebook.com/v17.0/155621414308796/messages';
const accessToken = 'EAAVOmhbOBCABOzqEoVWApgi6VrILRPDpgU9BZBss2AJ4DC0ZBZCk3S2xIikXyIH9hiOMZADxpHaZAf68YFEWZB5PMKN8Nfxc9nZCfZCeGKJkcFsTLAaMzAh280matbrk9IZBEptZB3p4PkaZATcqgHVxEzZCBybzumC7UlQ6gVdlUv5NE9Ol2qqHzNkAZB2fB2OZA4MLaRrZAZBF3h9G4Pchd4ke';
const { Whatsapp } = require('../../../managers/whatsapp');
const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
};  

module.exports = {
    // Get Order Data
        orderList: async (req, res) => {
            try {
                // Extract user session information
                const session = req.user;
                const user_id = session.userId;
                const page = req.query.page ? parseInt(req.query.page) : 0; // Start from page 0
                const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10; // Items per page
        
                // Check if the user is logged in
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                console.log(user_id)
                // Query the database to fetch orders for the user
                const orders = await models.BranchModel.Order.find({
                    delivery_id: user_id,
                })
                .sort({ updated_date: -1 })
                .skip(page * perPage) // Calculate the skip based on the current page
                .limit(perPage); // Limit the number of results per page;

        
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
                        const customerInfo = await models.UserModel.User.findOne({ _id: order.user_id });


                        // Construct data objects

                        const userData = {
                            profile: customerInfo.profile,
                            first_name: customerInfo.first_name,
                            last_name: customerInfo.last_name,
                            email: customerInfo.email,
                            phone_number: customerInfo.phone,
                            company: customerInfo.company,
                          };

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
                            challan: order.challan_number,
                            coupon_discount: order.coupon_discount,
                            delivery_fee: order.delivery_fee,
                            total_price: order.total_price,
                            discount : order.discount,
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
                            order_detail: orderData,
                            ordered_products: productData,
                            ordered_branch: branchData,
                            ordered_user : userData,
                            ordered_address: addressData,
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
                    delivery_id: user_id,
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
        
                        const orderData = {
                            order_id: order.order_id,
                            challan : order.challan_number,
                            coupon_discount: order.coupon_discount,
                            delivery_fee: order.delivery_fee,
                            total_price: order.total_price,
                            discount : order.discount,
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

    // Get Previous Order Data        
        previousOrder: async (req, res) => {
            try {
                // Extract user session information
                const session = req.user;
                const user_id = session.userId;
        
                const page = req.query.page ? parseInt(req.query.page) : 0; // Start from page 0
                const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10; // Items per page

                // Check if the user is logged in
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }
        
                console.log(user_id)
                // Query the database to fetch orders for the user
                const orders = await models.BranchModel.Order.find({
                    delivery_id: user_id,
                    status: { $in: ["Delivered", "Cancelled"] },
                }).sort({ updated_date: -1 })
                .skip(page * perPage) // Calculate the skip based on the current page
                .limit(perPage); // Limit the number of results per page                

        
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
                        const customerInfo = await models.UserModel.User.findOne({ _id: order.user_id });


                        // Construct data objects

                        const userData = {
                            profile: customerInfo.profile,
                            first_name: customerInfo.first_name,
                            last_name: customerInfo.last_name,
                            email: customerInfo.email,
                            phone_number: customerInfo.phone,
                            company: customerInfo.company,
                        };

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
                            challan : order.challan_number,
                            coupon_discount: order.coupon_discount,
                            delivery_fee: order.delivery_fee,
                            total_price: order.total_price,
                            discount : order.discount,
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
                            order_detail: orderData,
                            ordered_products: productData,
                            ordered_branch: branchData,
                            ordered_user : userData,
                            ordered_address: addressData,
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

    // Update Order Data
        updateDeliveryStatus: async (req, res) => {
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
                    order_id: req.body.order_id,
                    status: req.body.status,
                };
        
                const validationResult = Validator.validate(updateData, {
                    order_id: {
                        presence: { allowEmpty: false },
                        length: { minimum: 3 }
                    },
                    status: {
                        presence: { allowEmpty: false }
                    },
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
                    delivery_id: user_id
                }).populate('user_id');
        
                let isDelivered = false;
                let isCancelled = false;
        
                // Update flags based on newStatus
                if (updateData.status === 'Delivered') {
                    isDelivered = true;
                } else if (updateData.status === 'Cancelled') {
                    isCancelled = true;
                }
        
                if (!existingOrder) {
                    console.log(`Order not found for the user`);
                    return res.status(StatusCodesConstants.NOT_FOUND).json({
                        status: false,
                        status_code: StatusCodesConstants.NOT_FOUND,
                        message: MessageConstants.ORDER_NOT_FOUND,
                    });
                }
        
                // Find the product index within the existing order
                existingOrder.status = updateData.status;
                existingOrder.is_delivered = isDelivered;
                existingOrder.is_cancelled = isCancelled;
        
                await existingOrder.save();
                
                const order_id = existingOrder.order_id;

                let description = {
                    type : "Status",
                    status : "Status",
                    name : "John Doe",
                    order_id : existingOrder.order_id,
                  }

                let messageNotify = {
                    title: "Hello World",
                    body: "This is a sample template for message"
                  }

                let userIds = [];
                let status = "Status";
                let trackingLink = "---";
                let Name = `${existingOrder.user_id.first_name} ${existingOrder.user_id.last_name}`; 
                description.name = Name;
                description.order_id = existingOrder.order_id;
                userIds.push(existingOrder.user_id._id); 
          

                console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
                let message = "Hello World";
                const phone = `+91${existingOrder.user_id.phone}`
                const newStatus = updateData.status
                
                if (existingOrder.status === "Cancelled"){ 
                    messageNotify = NotificationConstants.OrderCancelledNotfiy(order_id, newStatus, Name)
                    description.status = "Cancelled";          
                  }else if(existingOrder.status === "Delivered"){
                    messageNotify = NotificationConstants.OrderDeliveredNotify(order_id,newStatus, Name)
                    description.status = "Delivered";
                    console.log("delivered---------------",description)
                  }else if(existingOrder.status === "Out for delivery"){
                    const check_otp = await models.BranchModel.DeliveryOtp.findOne({ user_id : existingOrder.user_id })
                    console.log(check_otp)
                    if(check_otp){
                        let params = {
                            type : "Otp Sent",
                            otp : check_otp.otp
                        }
                
                        const response = await Whatsapp.elseCase(params, existingOrder.user_id.phone);
                        
                        if (response.status === 200) {
                        console.log('OTP sent successfully');
                        } else {
                            console.error('Failed to send OTP:', response.statusText);
                        }
                    }else{
                        const otp = OtpHelper.generateOTP();
                        OtpHelper.sendOTPToUser(existingOrder.user_id.phone  , otp);
                        const otpData = new models.BranchModel.DeliveryOtp({ user_id : existingOrder.user_id , otp : otp})
                        const result = await otpData.save();
                        //   const apiUrl = `https://smspanel.tysindia.com/smsapi/index?key=365FBFC8358994&campaign=2913&routeid=1&type=text&contacts=${phone}&senderid=JOSHAC&msg=Dear%20User,%0A%0APlease%20use%20this%20OTP:%20${otp}%20for%20Delivery%20Verification.%0A%0ARegards,%0AJosh%20Fuel%20App`
                        //   console.log("Dataa ---- ",otpData)
                        //   const response = await axios.post(apiUrl);
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
                    const delivery_link = await models.BranchModel.VehicleLocation.findOne({ vehicle_id: existingOrder.delivery_id });
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
                    
                  }else if(existingOrder.status === "Rejected"){
                    messageNotify = NotificationConstants.OrderCancelledNotfiy(order_id, newStatus, Name)
                    description.status = "Rejected";
                  }else {
                    messageNotify = NotificationConstants.OrderStatusNotify(order_id, newStatus, Name)
                    description.status = newStatus;
                    description.type = "Status";
                  }

                  const messageData = {
                    delivery_id : existingOrder.user_id._id,
                    order_id : order_id,
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
          

                if (existingOrder.status == "Delivered") {
                    const order = await models.BranchModel.Order.findOne({ order_id: existingOrder.order_id }).populate('product_items').populate('branch_id').populate('address_id').populate('billing_id').populate('user_id').populate('product_items.product_id').populate('delivery_id');
                    const bank = await models.BranchModel.Bank.findOne({ user_id: order.branch_id });
                    console.log(bank);
                    const vehicle = await models.BranchModel.Vehicle.findOne({ deliveryman_id: order.delivery_id });
                    const totalPriceInWords = NumberHelper.convertNumberToWords(order.grand_total);

        
                    const recipientEmail = order.user_id.email;
                    const subject = `Order #${existingOrder.order_id} confirmed | Thank you for placing your order!`;
                    const templateFilePath = path.join(__dirname, Mailer.invoiceEmail);
                    const invoiceName = `invoice_${existingOrder.order_id}.pdf`;
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
                            const response = await Whatsapp.elseCase(params, existingOrder.user_id.phone);
                        }
>>>>>>> 50bc8428eba644b356898945a2134b8590826159
        
                        if (emailResult.success === true) {
                            console.log('Email sent successfully');
        
                            // If email is successful, remove the file
                            try {
                                // fs.unlinkSync(invoiceLocations);
                                console.log('File removed successfully');
                                return res.status(StatusCodesConstants.SUCCESS).json({
                                    status: true,
                                    status_code: StatusCodesConstants.SUCCESS,
                                    message: MessageConstants.PRODUCT_UPDATE_SUCCESSFULLY,
                                    data: existingOrder, // Return the updated order
                                });
                            } catch (unlinkError) {
                                console.error('Error removing file:', unlinkError);
                                return res.status(StatusCodesConstants.BAD_REQUEST).json({
                                    status: false,
                                    status_code: StatusCodesConstants.BAD_REQUEST,
                                    message: "Error Removing File",
                                    data: existingOrder, // Return the updated order
                                });
                            }
                        } else {
                            console.error('Email sending failed:', emailResult);
                        }
                    }
                } else {
                    console.log(`Pending`);
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.PRODUCT_UPDATE_SUCCESSFULLY,
                        data: existingOrder, // Return the updated order
                    });
                }
        
            } catch (error) {
                console.error('Error updating order:', error);
                return res.status(StatusCodesConstants.INTERNAL_SERVER_ERROR).json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
            }
        },
      
    // Update Order Data
        updatePaymentStatus: async (req, res) => {
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
                    order_id: req.body.order_id,
                    status: req.body.status,
                };
        
                const validationResult = Validator.validate(updateData, {
                    order_id: {
                        presence: { allowEmpty: false },
                        length: { minimum: 3 }
                    },
                    status: {
                        presence: { allowEmpty: false }
                    },
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
                    delivery_id: user_id
                });

                // Define flags for is_delivered and is_cancelled
                let payment_status = false;
            
                // Update flags based on newStatus
                if (updateData.status === 'Paid') {
                    payment_status = true;
                } else if (updateData.status === 'Unpaid') {
                    payment_status = false;
                }
        
                if (existingOrder) {
                    // Find the product index within the existing order
                    existingOrder.payment_status = payment_status;
    
                    await existingOrder.save();


                    console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: MessageConstants.PRODUCT_UPDATE_SUCCESSFULLY,
                        data: existingOrder, // Return the updated order
                    });
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
                    delivery_id : user_id
                });
        
                if (existingOrder) {
                    console.log(existingOrder);
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
                            message: MessageConstants.PRODUCT_NOT_PRESENT,
                            data: {}, // Return the updated order
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

        updateChallan: async (req, res) => {
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
                    order_id: req.body.order_id,
                    challan: req.body.challan,
                };
        
                const validationResult = Validator.validate(updateData, {
                    order_id: {
                        presence: { allowEmpty: false },
                        length: { minimum: 3 }
                    },
                    challan: {
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
                });
        
                if (existingOrder) {
                    console.log(existingOrder);
                    existingOrder.challan_number = updateData.challan;
    
                    await existingOrder.save();


                    console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
                    return res.status(StatusCodesConstants.SUCCESS).json({
                        status: true,
                        status_code: StatusCodesConstants.SUCCESS,
                        message: "Challan Number Added Successfully",
                        data: existingOrder, // Return the updated order
                    });
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

        validChallanId : async (req, res) => {
            try{
                const session = req.user;
                const user_id = session.userId;
        
                if (!user_id) {
                    return res.status(StatusCodesConstants.ACCESS_DENIED).json({
                        status: false,
                        status_code: StatusCodesConstants.ACCESS_DENIED,
                        message: MessageConstants.NOT_LOGGED_IN,
                    });
                }

              const challan_number = req.params.challan_number.toUpperCase();
              console.log(challan_number.toUpperCase());
              const order = await models.BranchModel.Order.findOne({challan_number : challan_number});
              console.log(order);
              if(order){
                res.send({status : false, message : "Challan Number Already Exists"});
              }else{
                res.send({status : true, message : "Success"});
              }
              
            }catch(err){
              console.log(err)
              res.send({status : false, message : err});
            }
          },
}  
  
  
  