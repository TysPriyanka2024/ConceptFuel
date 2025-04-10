const router = require('express').Router();
const { WalletController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');





router.get('/get-wallet-amount', AuthMiddleware.authenticateToken ,WalletController.myWallet);
router.get('/get-transaction-history', AuthMiddleware.authenticateToken ,WalletController.transactions);

module.exports = router;