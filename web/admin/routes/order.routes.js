const router = require('express').Router();
const { OrderControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/add-order',AuthMiddleware.authenticateToken(),OrderControllers.getAddOrder)
router.post('/add', AuthMiddleware.authenticateToken() ,MulterMiddleware.upload.single('file'),OrderControllers.postOrder)
router.get('/list/all', AuthMiddleware.authenticateToken() , OrderControllers.dailylist);
router.get('/reports/list/all', AuthMiddleware.authenticateToken() , OrderControllers.list);
router.get('/details/:id', AuthMiddleware.authenticateToken() , OrderControllers.getDetails);
router.get('/counts', AuthMiddleware.authenticateToken() , OrderControllers.getCount);
router.get('/daily-counts', AuthMiddleware.authenticateToken() , OrderControllers.getDailyCount);
// router.get('/split-bill/:orderId', AuthMiddleware.authenticateToken() , OrderControllers.getAddSplitBill);
router.get('/list/:statuses', AuthMiddleware.authenticateToken() , OrderControllers.listByStatus);
router.get('/reports/list/:statuses', AuthMiddleware.authenticateToken() , OrderControllers.reportlistByStatus);

router.post('/assignDeliveryMan',AuthMiddleware.authenticateToken() , OrderControllers.assginDeliveryMan);

router.post('/updateStatus' ,AuthMiddleware.authenticateToken() , OrderControllers.updateDeliveryStatus);
router.post('/updatePaymentStatus' ,AuthMiddleware.authenticateToken() , OrderControllers.updatePaymentStatus);


router.get('/generate-invoice/:id', AuthMiddleware.authenticateToken() , OrderControllers.getInvoice);
router.get('/update-invoice/:id', AuthMiddleware.authenticateToken() , OrderControllers.editInvoice);
router.post('/update-invoice/:orderId', AuthMiddleware.authenticateToken() , OrderControllers.updateInvoice);
router.post('/send-invoice', AuthMiddleware.authenticateToken(), OrderControllers.sendInvoice)

router.get('/track-order/:id', AuthMiddleware.authenticateToken() , OrderControllers.trackOrder);

router.post('/delete-order/:order_id', AuthMiddleware.authenticateToken(), OrderControllers.deleteOrder)
module.exports = router;