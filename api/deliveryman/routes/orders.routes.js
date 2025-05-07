const router = require('express').Router();
const { OrderController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');


router.get('/get', AuthMiddleware.authenticateToken ,OrderController.orderList);
router.get('/get-order', AuthMiddleware.authenticateToken ,OrderController.perOrder);
router.get('/previous-order', AuthMiddleware.authenticateToken ,OrderController.previousOrder);
router.post('/delete', AuthMiddleware.authenticateToken ,OrderController.deleteOrder);
router.post('/update-challan', AuthMiddleware.authenticateToken ,OrderController.updateChallan);
router.post('/update-status', AuthMiddleware.authenticateToken ,OrderController.updateDeliveryStatus);
router.post('/update-order', AuthMiddleware.authenticateToken ,OrderController.updateOrder);
router.post('/update-payment', AuthMiddleware.authenticateToken ,OrderController.updatePaymentStatus);
router.post('/validate-challan/:challan_number', AuthMiddleware.authenticateToken ,OrderController.validChallanId);

module.exports = router;