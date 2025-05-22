const router = require('express').Router();
const { CustomerControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware , S3bucketCloudMiddleware} = require('../middlewares');


router.get('/list', AuthMiddleware.authenticateToken() ,CustomerControllers.list );
router.get('/detail/:customerId', AuthMiddleware.authenticateToken() ,CustomerControllers.getCustomer );
router.get("/getCustomerAddresses",AuthMiddleware.authenticateToken(),CustomerControllers.getCustomerAddress);
router.get('/ledger/:customerId', AuthMiddleware.authenticateToken() ,CustomerControllers.getCustomerLedger );
router.get('/add', AuthMiddleware.authenticateToken() ,CustomerControllers.getAdd);
router.get('/getCityList', AuthMiddleware.authenticateToken() ,CustomerControllers.getCityList);
router.get('/getAreaList', AuthMiddleware.authenticateToken() ,CustomerControllers.getAreaList);
router.get('/update/:customerId', AuthMiddleware.authenticateToken() ,CustomerControllers.getUpdate);

router.post('/payment-in/:customer_id', AuthMiddleware.authenticateToken() ,CustomerControllers.getPaymentIN);
router.delete('/:paymentId/deletePayment/:customerId', CustomerControllers.deletePayment);

router.post('/add', 
  AuthMiddleware.authenticateToken() ,
  MulterMiddleware.upload.fields([
    { name: 'image', maxCount: 1 },
  ]),
  CustomerControllers.postAdd);

router.post('/update/:customerId', 
  AuthMiddleware.authenticateToken() ,
  MulterMiddleware.upload.fields([
    { name: 'image', maxCount: 1 },
  ]),
  CustomerControllers.postUpdate);


router.delete('/delete/:customerId', AuthMiddleware.authenticateToken(), CustomerControllers.delete)

router.get('/export-customer-payments', AuthMiddleware.authenticateToken(), CustomerControllers.exportCustomerPayments);
router.get('/customer-sheet', AuthMiddleware.authenticateToken(), CustomerControllers.getCustomerPayment);
router.post('/customer-sheet/export', AuthMiddleware.authenticateToken(), CustomerControllers.updateCustomerPayments);

module.exports = router;
