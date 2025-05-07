const router = require('express').Router();
const { OrderControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/list/all', AuthMiddleware.authenticateToken() , OrderControllers.list);
router.get('/details/:id', AuthMiddleware.authenticateToken() , OrderControllers.getDetails);
router.get('/counts', AuthMiddleware.authenticateToken() , OrderControllers.getCount);

router.get('/list/:statuses', AuthMiddleware.authenticateToken() , OrderControllers.listByStatus);

router.post('/assignDeliveryMan',AuthMiddleware.authenticateToken() , OrderControllers.assginDeliveryMan);

router.post('/updateStatus' ,AuthMiddleware.authenticateToken() , OrderControllers.updateDeliveryStatus);
router.post('/updatePaymentStatus' ,AuthMiddleware.authenticateToken() , OrderControllers.updatePaymentStatus);


router.get('/generate-invoice/:id', AuthMiddleware.authenticateToken() , OrderControllers.getInvoice);

router.get('/track-order/:id', AuthMiddleware.authenticateToken() , OrderControllers.trackOrder);

module.exports = router;