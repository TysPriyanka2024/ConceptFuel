const router = require('express').Router();
const { WalletControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware} = require('../middlewares');


router.get('/list', AuthMiddleware.authenticateToken() , WalletControllers.list );
router.get('/details/:walletId', AuthMiddleware.authenticateToken() , WalletControllers.details );
router.get('/add', AuthMiddleware.authenticateToken() , WalletControllers.getAdd );

router.post('/add', AuthMiddleware.authenticateToken() , WalletControllers.postAdd );
router.post('/reload-wallet', AuthMiddleware.authenticateToken() , WalletControllers.reload );

module.exports = router;
