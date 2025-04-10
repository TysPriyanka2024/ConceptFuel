const { v4: uuidv4 } = require('uuid');
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
} = require('../constants');
const models = require('../../../managers/models');

const options = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false // Set to true for 12-hour format
};

module.exports = {

  // Get Product List
    myWallet : async (req, res) => {
        try {
            const user = req.user;
            user_id = user.userId;

            if(!user_id){
                return res.status(StatusCodesConstants.BAD_REQUEST).json({
                    status: false,
                    status_code: StatusCodesConstants.BAD_REQUEST,
                    message: MessageConstants.NOT_LOGGED_IN
                });
            }
        
            // Filter customers with user_type = "customer"
            const wallets = await models.UserModel.Wallet.findOne({user_id : user_id }).populate('user_id');            

            if(!wallets){
                return res.status(StatusCodesConstants.SUCCESS).json({
                    status: false,
                    status_code: StatusCodesConstants.NOT_FOUND,
                    message: MessageConstants.NO_WALLET_FOUND,
                    data : {}
                });
            }

            const balance  = wallets.total_credit;

            console.log(balance)

            const walletData = {    
                amount : wallets.total_credit
            };

            return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.SUCCESS,
                message: MessageConstants.WALLET_AMOUNT_FETCHED,
                data : walletData
            });
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

    transactions : async ( req, res) => {
      try {
        const user = req.user;
        user_id = user.userId;

        if(!user_id){
            return res.status(StatusCodesConstants.BAD_REQUEST).json({
                status: false,
                status_code: StatusCodesConstants.BAD_REQUEST,
                message: MessageConstants.NOT_LOGGED_IN
            });
        }
    
    
        // Find the customer in the database by ID
        const wallet = await models.UserModel.Wallet.findOne({ user_id : user_id });

            if(!wallet){
                return res.status(StatusCodesConstants.SUCCESS).json({
                    status: false,
                    status_code: StatusCodesConstants.NOT_FOUND,
                    message: MessageConstants.NO_WALLET_FOUND,
                    data : []
                });
            }

        const transactions = await models.UserModel.Transaction.find({ wallet_id : wallet._id });
        
            if(!transactions){
                return res.status(StatusCodesConstants.SUCCESS).json({
                    status: true,
                    status_code: StatusCodesConstants.SUCCESS,
                    message: MessageConstants.NO_TRANSACTION_FOUND,
                    data : []
                });
            }

            console.log(transactions)
        
            return res.status(StatusCodesConstants.SUCCESS).json({
                status: true,
                status_code: StatusCodesConstants.SUCCESS,
                message: MessageConstants.TRANSACTION_FOUND,
                data : transactions
            });
 
      }  catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },
}



