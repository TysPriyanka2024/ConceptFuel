const router = require('express').Router();
const { BranchControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware , S3bucketCloudMiddleware } = require('../middlewares');

router.get('/all', AuthMiddleware.authenticateToken() , BranchControllers.list);
router.get('/branch-products', AuthMiddleware.authenticateToken() , BranchControllers.listBranchProducts);
router.post('/branch-products/updatestatus', BranchControllers.updateBranchProductStatus);
router.post('/branch-products/update-price', BranchControllers.updateBranchProductPrice);
router.get('/add', AuthMiddleware.authenticateToken() , BranchControllers.getAdd);
router.get('/update/:branchId', AuthMiddleware.authenticateToken() , BranchControllers.getUpdate);



router.post('/add', 
    AuthMiddleware.authenticateToken() , 
    MulterMiddleware.upload.fields([
        { name: 'image', maxCount: 1 },
      ]),
    BranchControllers.postAdd);

router.post('/update-status', AuthMiddleware.authenticateToken() , BranchControllers.updateStatus);

router.post('/update/:branchId',   
    AuthMiddleware.authenticateToken() , 
    MulterMiddleware.upload.fields([
        { name: 'image', maxCount: 1 },
    ]),
    BranchControllers.postUpdate);

router.delete('/delete/:branchId', AuthMiddleware.authenticateToken(), BranchControllers.delete)

module.exports = router;
