const {
  MessageConstants,
  StatusCodesConstants,
  
} = require('../constants');
const { Validator} = require('../../../managers/utils');
const models = require('../../../managers/models');



module.exports = {
  // Get Cart Data
  cartList: async (req, res) => {
    try {
      const session = req.user;
      user_id = session.userId;
  
      console.log(`User ${session.first_name} Fetching Cart Data`);
  
      if (!user_id) {
        return res.status(StatusCodesConstants.ACCESS_DENIED).json({
          status: false,
          status_code: StatusCodesConstants.ACCESS_DENIED,
          message: MessageConstants.NOT_LOGGED_IN,
        });
      }
  

      const user_city = await models.UserModel.Address.findOne({ user_id: user_id, primary : true});
      
      console.log("User's City ----- ",user_city);
      if(!user_city){
        return res.status(StatusCodesConstants.SUCCESS).json({ 
          status: false,
          status_code: StatusCodesConstants.NOT_FOUND,
          message: MessageConstants.ADDRESS_NOT_PRESENT,
          data : []
         });
      }

      const district_of_city = await models.SettingModel.Area.find({ name : user_city.area}).populate('district_id');
      console.log(district_of_city)

      // Fetch user's city based on the sessions user_id
      const cart = await models.BranchModel.Cart.find({ user_id: session.userId });
      const user = await models.UserModel.User.findOne({ _id: session.userId });
      const cartCount = cart.length;
      const discount = (user.discount + user.volume_discount + user.card_discount).toFixed(2);
      var customer_price = 0;
      console.log(user);
  
      if (!cart || cart.length === 0) {
        console.log(
          `User ${session.first_name} ${MessageConstants.CART_FETCHED_SUCCESSFULLY} ${MessageConstants.CART_EMPTY}`
        );
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.CART_EMPTY,
          data: {
            cartCount: cartCount,
            cartData: {},
          },
        });
      } else {
        const products = cart[0].product_items;
        console.log("Products CART DATA", products);
        if (products && products.length !== 0) {
          let populatedCartObject = {};
  
          // Iterate through each cart item
          for (const cartItem of cart) {
            // Manually populate the product and branch details from the referenced models
            const productData = products.map(async (product) => {
              const productInfo = await models.BranchModel.BranchProduct.find({
                _id: product.product_id,
              });
              

              const modifiedProductsData = productInfo.map(product => {
                // Update the price field based on the condition
                if (district_of_city[0].price > 0) {
                  // Set branch_price to district price if it's greater than or equal to 0
                  product.branch_price = district_of_city[0].price;
                  customer_price = parseFloat(product.branch_price);
                  
              }
                return product;
              });

              if (modifiedProductsData) {
                console.log(user.is_privilaged == true)
                if(user.is_privilaged == true ){
                  return {
                    product_id: product.product_id,
                    product_name: modifiedProductsData[0].name,
                    product_img: modifiedProductsData[0].image,
                    quantity: product.quantity,
                    price: product.price,
                    discount : cart[0].discount,
                    branch_price: modifiedProductsData[0].branch_price,
                    customer_price : 0.0,
                    _id: product._id,
                  };
                }
                return {
                  product_id: product.product_id,
                  product_name: modifiedProductsData[0].name,
                  product_img: modifiedProductsData[0].image,
                  quantity: product.quantity,
                  price: product.price,
                  _id: product._id,
                };
              }
  
              return null;
            });
  
            const branchInfo = await models.BranchModel.Branch.find({
              _id: cartItem.branch_id,
            });
  
            if (productData && branchInfo) {
              const cartItemData = {
                user_id: session.userId,
                cart_id: cartItem._id,
                products: await Promise.all(productData), // Await the resolution of all productData promises
                branch: {
                  branch_id: cartItem.branch_id,
                  branch_name: branchInfo[0].name,
                },
              };
  
              populatedCartObject = cartItemData; // Directly assign cart data
            }
          }
  
          console.log(populatedCartObject);
  
          console.log(
            `User ${session.first_name} ${MessageConstants.CART_FETCHED_SUCCESSFULLY}`
          );
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: true,
            status_code: StatusCodesConstants.SUCCESS,
            message: MessageConstants.CART_FETCHED_SUCCESSFULLY,
            data: {
              cartCount: cartCount,
              cartData: populatedCartObject,
            },
          });
        } else {
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: true,
            status_code: StatusCodesConstants.SUCCESS,
            message: MessageConstants.CART_EMPTY,
            data: {
              cartData: {},
            },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return res
        .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
        .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
    }
  },
  
  // Add Cart Data 
    addCartData: async (req, res) => {
      try {
        const session = req.user;
        const user_id = session.userId;
    
        const user_city = await models.UserModel.Address.findOne({ user_id: user_id , primary : true});

        console.log("User's City ----- ",user_city.area);

        const district_of_city = await models.SettingModel.Area.find({ name : user_city.area}).populate('district_id');
        console.log("User's City ----- ", district_of_city)
        console.log(`User ${session.first_name} Adding Data to Cart`);
    
        if (!user_id) {
          return res.status(StatusCodesConstants.ACCESS_DENIED).json({
            status: false,
            status_code: StatusCodesConstants.ACCESS_DENIED,
            message: MessageConstants.NOT_LOGGED_IN,
          });
        }
    
        const cartData = {
          user_id: session.userId,
          product_id: req.body.product,
          quantity: req.body.quantity,
        };
    
        const validationResult = Validator.validate(cartData, {
          product_id: {
            presence: { allowEmpty: false },
          },
          quantity: {
            presence: { allowEmpty: false },
            length: { minimum: 1, maximum: 100 },
          },
        });
    
        if (validationResult) {
          return res.status(StatusCodesConstants.BAD_REQUEST).json({
            status: false,
            status_code: StatusCodesConstants.BAD_REQUEST,
            message: validationResult,
          });
        }
    
        // Convert quantity to a number using parseInt
        const quantityAsNumber = parseInt(cartData.quantity, 10);

        if (!isNaN(quantityAsNumber) && quantityAsNumber < 200) {
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: false,
            status_code: StatusCodesConstants.SUCCESS,
            message: "We only accept orders more than 200 liters.",
            data: [],
          });
        }

        const productInfo = await models.BranchModel.BranchProduct.find({
          _id: cartData.product_id,
        });

        const modifiedProductsData = productInfo.map(product => {
          // Update the price field based on the condition
          if (district_of_city[0].price > 0) {
            // Set branch_price to district price if it's greater than or equal to 0
            product.branch_price = district_of_city[0].price;
        }
          return product;
        });
    
        const userInfo = await models.UserModel.User.findOne({
          _id: user_id,
        });

        var after_price = 0;        

        if(userInfo.is_privilaged == true){
          after_price = userInfo.discount + userInfo.volume_discount + userInfo.card_discount;
        }

        if (modifiedProductsData) {
          // Step 3: Extract the price from the retrieved product information
          const branchInfo = await models.BranchModel.Branch.findOne({
            _id: modifiedProductsData[0].branch,
          });
    
          const product_detail = {
            product_id: cartData.product_id,
            quantity: cartData.quantity,
            price: modifiedProductsData[0].branch_price + after_price,
            discount : after_price,
          };

          console.log(product_detail);
          console.log(userInfo);
          console.log(userInfo.is_privilaged);
    
          const existingCart = await models.BranchModel.Cart.findOne({
            user_id: cartData.user_id,
            branch_id: modifiedProductsData[0].branch,
          });
    
          if (existingCart) {
            const productExists = existingCart.product_items.some((item) => {
              return item.product_id.toString() === cartData.product_id.toString();
            });
    
            if (productExists) {
              return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.SUCCESS,
                message: MessageConstants.CART_ALREADY_EXIST,
                data: [],
              });
            } else {
              console.log('Product with the same product_id does not exist in the array');
              existingCart.product_items.push(product_detail);
              await existingCart.save();
    
              const responseData = {
                user: {
                  user_id: session.userId,
                  first_name: session.first_name,
                  last_name: session.last_name,
                },
                product: existingCart.product_items, // Use the existingCart.product_items
                product_name: modifiedProductsData[0].name,
                branch_price: modifiedProductsData[0].branch_price,
                product_img: modifiedProductsData[0].image,
                discount : product_detail.discount,
                branch: {
                  branch_id: branchInfo._id,
                  branch_name: branchInfo.name,
                },
              };
    
              console.log("This is response Data", responseData);
              console.log(`User ${session.first_name} ${MessageConstants.CART_ADD_SUCCESSFULLY}`);
              return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.ACCESS_DENIED,
                message: MessageConstants.CART_ADD_SUCCESSFULLY,
                data: responseData,
              });
            }
          } else {
            // Step 4: Store the price and other cart data in the database
            const cartItem = {
              user_id: cartData.user_id,
              branch_id: modifiedProductsData[0].branch,
              discount : product_detail.discount,
              product_items: [product_detail], // Store the price in the cart item as an array
            };
    
            const newCart = new models.BranchModel.Cart(cartItem);
            await newCart.save();
    
            // Create a new object with specific fields from product and branch
            const responseData = {
              user: {
                user_id: cartData.user_id,
                first_name: session.first_name,
                last_name: session.last_name,
              },
              product: newCart.product_items,
              product_name: modifiedProductsData[0].name,
              product_img: modifiedProductsData[0].image,
              branch_price: modifiedProductsData[0].branch_price,
              discount : product_detail.discount,
              branch: {
                branch_id: branchInfo._id,
                branch_name: branchInfo.name,
              },
            };
            console.log(`User ${session.first_name} ${MessageConstants.CART_ADD_SUCCESSFULLY}`);
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: MessageConstants.CART_ADD_SUCCESSFULLY,
              data: responseData,
            });
          }
        } else {
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.PRODUCT_NOT_PRESENT,
            data: [],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return res
          .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
          .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
      }
    },
  
  // Update Cart Data
    updateCartData: async (req, res) => {
      try {
        const session = req.user;
        const user_id = session.userId;
    
        console.log(`User ${session.first_name} updating Cart`);
    
        if (!user_id) {
          return res.status(StatusCodesConstants.ACCESS_DENIED).json({
            status: false,
            status_code: StatusCodesConstants.ACCESS_DENIED,
            message: MessageConstants.NOT_LOGGED_IN,
          });
        }
    
        const user_city = await models.UserModel.Address.findOne({ user_id: user_id, primary : true});

        console.log("User's City ----- ",user_city.area);

        const district_of_city = await models.SettingModel.Area.find({ name : user_city.area}).populate('district_id');
        console.log(district_of_city)

        const cartData = {
          user_id: session.userId,
          cart_id: req.body.cart_id,
          product_id: req.body.product_id,
          quantity: req.body.quantity,
        };
    
        const validationResult = Validator.validate(cartData, {
          product_id: {
            presence: { allowEmpty: false },
          },
          cart_id: {
            presence: { allowEmpty: false },
          },
          quantity: {
            presence: { allowEmpty: false },
          },
        });
    
        if (validationResult) {
          return res.status(StatusCodesConstants.BAD_REQUEST).json({
            status: false,
            status_code: StatusCodesConstants.BAD_REQUEST,
            message: validationResult,
          });
        }
    
        const productInfo = await models.BranchModel.BranchProduct.find({
          _id: cartData.product_id,
        });

        const modifiedProductsData = productInfo.map(product => {
          // Update the price field based on the condition
          if (district_of_city[0].price > 0) {
            // Set branch_price to district price if it's greater than or equal to 0
            product.branch_price = district_of_city[0].price;
        }
          return product;
        });
    
        const userInfo = await models.UserModel.User.findOne({
          _id: user_id,
        });
    
        var after_price = 0;        

        if(userInfo.is_privilaged == true){
          after_price = userInfo.discount + userInfo.volume_discount + userInfo.card_discount;
        }

        if (modifiedProductsData[0]) {
          const branchInfo = await models.BranchModel.Branch.findOne({
            _id: modifiedProductsData[0].branch,
          });
    
          const product_detail = {
            product_id: cartData.product_id,
            quantity: cartData.quantity,
            price: modifiedProductsData[0].branch_price + after_price,
            discount : after_price,
            branch_price: modifiedProductsData[0].branch_price,
          };
    
          console.log(product_detail);
    
          // Step 1: Check if there is already a cart item with the same user_id, branch_id, and product_id
          const existingCart = await models.BranchModel.Cart.findOne({
            user_id: cartData.user_id,
            branch_id: modifiedProductsData[0].branch,
          });
    
          console.log(existingCart);
    
          if (existingCart) {
            const productIndex = existingCart.product_items.findIndex((item) => {
              return item.product_id.toString() === cartData.product_id.toString();
            });
    
            if (productIndex !== -1) {
              // If the product exists, update its quantity and price
              existingCart.product_items[productIndex].quantity = cartData.quantity;
              existingCart.product_items[productIndex].price = product_detail.price;
            } else {
              // If the product doesn't exist, add it to the cart
              existingCart.product_items.push(product_detail);
            }
    
            // Recalculate total price based on the updated quantities and prices
    
            await existingCart.save();
    
            const responseData = {
              user: {
                user_id: cartData.user_id,
                first_name: session.first_name,
                last_name: session.last_name,
              },
              product: existingCart.product_items,
              product_name: modifiedProductsData[0].name,
              product_img: modifiedProductsData[0].image,
              branch_price: modifiedProductsData[0].branch_price,
              discount : after_price,
              branch: {
                branch_id: branchInfo._id,
                branch_name: branchInfo.name,
              },
            };
    
            console.log(`User ${session.first_name} ${MessageConstants.CART_UPDATE_SUCCESSFULLY}`);
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: MessageConstants.CART_UPDATE_SUCCESSFULLY,
              data: responseData,
            });
          } else {
            console.log(`User ${session.first_name} ${MessageConstants.CART_EMPTY}`);
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: MessageConstants.CART_EMPTY,
              data: [],
            });
          }
        } else {
          console.log(`User ${session.first_name} ${MessageConstants.PRODUCT_NOT_PRESENT}`);
          return res.status(StatusCodesConstants.NOT_FOUND).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.PRODUCT_NOT_PRESENT,
            data: [],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return res
          .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
          .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
      }
    },

    deleteCartItem: async (req, res) => {
      try {
        const session = req.user;
        const user_id = session.userId;
    
        console.log(`User ${session.first_name} updating Cart`);
    
        if (!user_id) {
          return res.status(StatusCodesConstants.ACCESS_DENIED).json({
            status: false,
            status_code: StatusCodesConstants.ACCESS_DENIED,
            message: MessageConstants.NOT_LOGGED_IN,
          });
        }
    
        const cartData = {
          user_id: session.userId,
          cart_id: req.body.cart_id,
          product_id: req.body.product_id,
        };
    
        const validationResult = Validator.validate(cartData, {
          product_id: {
            presence: { allowEmpty: false },
          },
          cart_id: {
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
    
        const productInfo = await models.BranchModel.BranchProduct.findOne({
          _id: cartData.product_id,
        });
    
        if (productInfo) {
          const branchInfo = await models.BranchModel.Branch.findOne({
            _id: productInfo.branch,
          });
    
          // Check if there is already a cart item with the same user_id, branch_id, and product_id
          const existingCart = await models.BranchModel.Cart.findOne({
            user_id: cartData.user_id,
            branch_id: productInfo.branch,
          });
    
          console.log(existingCart);
    
          if (existingCart) {
            const productIndex = existingCart.product_items.findIndex((item) => {
              return item.product_id.toString() === cartData.product_id.toString();
            });
    
            if (productIndex !== -1) {
              // If the product exists, remove it from the cart using $pull
              await models.BranchModel.Cart.updateOne(
                {
                  _id: existingCart._id,
                },
                {
                  $pull: {
                    product_items: { product_id: cartData.product_id },
                  },
                }
              );
    
              // Recalculate total price based on the updated quantities and prices
              existingCart.product_items.splice(productIndex, 1);
    
              const responseData = {
                user: {
                  user_id: cartData.user_id,
                  first_name: session.first_name,
                  last_name: session.last_name,
                },
                product: existingCart.product_items,
                product_name: productInfo.name,
                product_img: productInfo.image,
                branch: {
                  branch_id: branchInfo._id,
                  branch_name: branchInfo.name,
                },
              };
    
              console.log(`User ${session.first_name} ${MessageConstants.CART_DELETED}`);
              return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.SUCCESS,
                message: MessageConstants.CART_DELETED,
                data: responseData,
              });
            } else {
              console.log(`User ${session.first_name} ${MessageConstants.CART_NOT_PRESENT}`);
              return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.SUCCESS,
                message: MessageConstants.CART_NOT_PRESENT,
                data: [],
              });
            }
          } else {
            console.log(`User ${session.first_name} ${MessageConstants.CART_EMPTY}`);
            return res.status(StatusCodesConstants.SUCCESS).json({
              status: true,
              status_code: StatusCodesConstants.SUCCESS,
              message: MessageConstants.CART_EMPTY,
              data: [],
            });
          }
        } else {
          console.log(`User ${session.first_name} ${MessageConstants.PRODUCT_NOT_PRESENT}`);
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: true,
            status_code: StatusCodesConstants.SUCCESS,
            message: MessageConstants.PRODUCT_NOT_PRESENT,
            data: responseData,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return res
          .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
          .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
      }
    },
  // Delete Cart Data
    deleteCart: async (req, res) => {
      try {
        const session = req.user;
        const user_id = session.userId;
        console.log(`User ${session.first_name} Deleting Cart`)

        if (!user_id) {
          return res.status(StatusCodesConstants.ACCESS_DENIED).json({
            status: false,
            status_code: StatusCodesConstants.ACCESS_DENIED,
            message: MessageConstants.NOT_LOGGED_IN,
          });
        }
    
        const cartData = {
          user_id: session.userId,
          cart_id: req.body.cart_id,
        };
    
        // Step 1: Check if the cart item exists
        const existingCartItem = await models.BranchModel.Cart.findOne({
          user_id: cartData.user_id,
          _id : cartData.cart_id,
        });
    
        if (!existingCartItem) {
          return res.status(StatusCodesConstants.NOT_FOUND).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.CART_NOT_FOUND,
            data: {},
          });
        }
    
        // Step 2: Delete the cart item
        const deletedCartItem = await models.BranchModel.Cart.findOneAndDelete({
          user_id: cartData.user_id,
          _id: cartData.cart_id,
        });

        if (!deletedCartItem) {
          return res.status(StatusCodesConstants.NOT_FOUND).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.CART_NOT_FOUND,
            data: {},
          });
        }
        console.log(`User ${session.first_name} ${MessageConstants.CART_DELETED}`)
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.CART_DELETED,
          data: deletedCartItem,
        });
      } catch (error) {
        console.error('Error deleting cart item:', error);
        return res
          .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
          .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
      }
    },  

    // DeleteCArtAxios
    deleteCartAxios: async (req, res) => {
      try {
        const session = req.user;
        const user_id = session.userId;
    
        console.log(`User ${session.first_name} Deleting Cart`);
    
        if (!user_id) {
          return res.status(StatusCodesConstants.ACCESS_DENIED).json({
            status: false,
            status_code: StatusCodesConstants.ACCESS_DENIED,
            message: MessageConstants.NOT_LOGGED_IN,
          });
        }
    
        // Step 1: Check if the cart exists
        const existingCart = await models.BranchModel.Cart.findOne({
          user_id: user_id,
        });
    
        if (!existingCart) {
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.CART_NOT_FOUND,
            data: {},
          });
        }
    
        // Step 2: Delete the entire cart
        const deletedCart = await models.BranchModel.Cart.findOneAndDelete({
          user_id: user_id,
        });
    
        if (!deletedCart) {
          return res.status(StatusCodesConstants.SUCCESS).json({
            status: false,
            status_code: StatusCodesConstants.NOT_FOUND,
            message: MessageConstants.CART_NOT_FOUND,
            data: {},
          });
        }
    
        console.log(`User ${session.first_name} ${MessageConstants.CART_DELETED}`);
        return res.status(StatusCodesConstants.SUCCESS).json({
          status: true,
          status_code: StatusCodesConstants.SUCCESS,
          message: MessageConstants.CART_DELETED,
          data: deletedCart,
        });
      } catch (error) {
        console.error('Error deleting cart:', error);
        return res
          .status(StatusCodesConstants.INTERNAL_SERVER_ERROR)
          .json({ error: MessageConstants.INTERNAL_SERVER_ERROR });
      }
    },
    
}  


