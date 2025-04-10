const { v4: uuidv4 } = require('uuid');
const {
  MessageConstants,
  StatusCodesConstants,
  ParamsConstants,
} = require('../../../managers/notify');
const models = require('../../../managers/models');


// Function to generate a credit transaction ID
function createCreditTransactionId(type ,serialNumber) {
  const uuid = uuidv4(); // Generate a Version 4 UUID
  const shortUuid = uuid.slice(0, 5); // Take the first 5 characters of the UUID
  const paddedSerialNumber = String(serialNumber).padStart(3, '0'); // Ensure serial number is three digits
  return `${type}-${shortUuid}-${paddedSerialNumber}`;
}

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
    list : async (req, res) => {
        try {
            const user = req.user;
        
            if (!user) {
              return res.redirect('/admin/auth/login');
            }
        
            // Filter customers with user_type = "customer"
            const wallets = await models.UserModel.Wallet.find().populate('user_id');
            const walletCount = wallets.length;
            

            console.log(walletCount)
            const error = "Wallet's Lists";

            res.render('admin/wallet/lists', {
              Title: "All Customers Wallet",
              user,
              wallets,
              walletCount,
              error,
            });
          } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
    },

    details : async ( req, res) => {
      try {
        const walletId = req.params.walletId;
        const user = req.user;

        if (!user) {
          return res.redirect('/admin/auth/login');
        }
        console.log("Fetching Wallet with ID:", walletId);
    
        // Find the customer in the database by ID
        const wallet = await models.UserModel.Wallet.findById(walletId).populate('user_id');
        const transactions = await models.UserModel.Transaction.find({ wallet_id : wallet._id });
        

        const error = `${wallet.user_id.first_name} ${wallet.user_id.last_name}'s Wallet`;
        res.render('admin/wallet/details', { wallet, options, transactions, user, error }); // Assuming you are using a template engine like EJS
 
      } catch {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    },

    getAdd : async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }

        // Filter customers with user_type = "customer"
        const customers = await models.UserModel.User.find({
          usertype : "Customer"  
        });
        
        const error = `Add new Wallet`;
        res.render('admin/wallet/add', { customers, user, error }); // Assuming you are using a template engine like EJS

      } catch (error) {
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
    },

    postAdd: async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        const { user_id, amount } = req.body;
    
        // Check if the user_id already has a wallet
        const existingWallet = await models.UserModel.Wallet.findOne({ user_id });
        if (existingWallet) {
          // User already has a wallet, handle accordingly (e.g., redirect or show an error message)
          const error = 'User already has a wallet';
          return res.render('admin/wallet/add', { customers: [], user, error });
        }
    
        // Filter customers with user_type = "customer"
        const customers = await models.UserModel.User.find({
          usertype: "Customer"
        });
    
        const walletData = {
          user_id: user_id,
          total_credit: amount
        };
    
        const newWallet = new models.UserModel.Wallet(walletData);
    
        const transaction = await models.UserModel.Wallet.find();
        
        const walletLength = transaction.length;
    
        const number = walletLength + 1;
        const transactionData = {
          transaction_id: createCreditTransactionId("CRED", number),
          wallet_id: newWallet._id,
          credited: newWallet.total_credit,
          available: newWallet.total_credit,
          status: true
        };
    
        const newTranscation = new models.UserModel.Transaction(transactionData);
    
        await newWallet.save();
        await newTranscation.save();
    
        await models.UserModel.User.findOneAndUpdate(
          { _id: user_id },
          { has_wallet: true }
        );
  
        res.redirect('/admin/customer/wallets/list?error=Wallet Data Added Successfully');
    
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      }
    },
    
    reload: async (req, res) => {
      try {
        const user = req.user;
        const walletId = req.body.walletId;
        const amount = parseInt(req.body.amount);

        console.log(req.body);
        if (!user) {
          return res.redirect('/admin/auth/login');
        }
    
        // Retrieve the wallet
        const wallet = await models.UserModel.Wallet.findById(walletId).populate('user_id');
        const customer = await models.UserModel.User.findById(wallet.user_id);
        console.log(`wallet for user : ${customer.first_name}  is : `,wallet);
        if (!wallet) {
          // Handle the case where the wallet is not found
          return res.status(404).send('Wallet not found');
        }

        let total_credit = parseInt(wallet.total_credit);

    
        // Check if the wallet balance is already 100,000        
        wallet.total_credit = total_credit + amount;
        await wallet.save();
    
        const walletLength = await models.UserModel.Transaction.countDocuments({ wallet_id: wallet.id });
        const number = walletLength + 1;
        // Create a new transaction record
        const transactionData = {
          transaction_id: createCreditTransactionId("CRED", number),
          wallet_id: wallet.id,
          credited: amount,
          available: wallet.total_credit,
          status: true,
          createdAt: new Date() // Ensure createdAt is properly recorded
        };
    
        console.log("Transaction Data:", transactionData);
        const newTransaction = new models.UserModel.Transaction(transactionData);
        await newTransaction.save();
    
        res.redirect(req.get('referer') + '?message=Wallet reloaded successfully');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    }
    
}