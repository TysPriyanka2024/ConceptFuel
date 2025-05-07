const router = require('express').Router();
const { DispenserController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


// router.get('/set-price/:order_id',AuthMiddleware.authenticateToken , DispenserController.setPrice);
// router.get('/refuel-amount/:order_id',AuthMiddleware.authenticateToken , DispenserController.setRefulingAmount);
// router.get('/refuel-quantity/:order_id',AuthMiddleware.authenticateToken , DispenserController.setRefulingQuantity);
// router.get('/fetchDispensedData/:order_id',AuthMiddleware.authenticateToken , DispenserController.getRecord);
router.get('/getRecord/:order_id',AuthMiddleware.authenticateToken , DispenserController.getRecord);
router.post('/resend-delivery-otp',AuthMiddleware.authenticateToken , DispenserController.resendOtp);
router.post('/test-api/', DispenserController.testApi);
router.post('/dispense-verify', AuthMiddleware.authenticateToken, DispenserController.verifyOtp);
module.exports = router;