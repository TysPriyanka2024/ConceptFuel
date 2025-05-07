const router = require('express').Router();
const { ProductController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware , S3bucketCloudMiddleware } = require('../middlewares');

router.get('/lists', AuthMiddleware.authenticateToken() , ProductController.list);
router.get('/add', AuthMiddleware.authenticateToken() , ProductController.getAdd);
router.get('/getSubcategories',  ProductController.getSubcategories);
router.get('/update/:id', AuthMiddleware.authenticateToken() , ProductController.getUpdate);
router.get('/detail/:id', AuthMiddleware.authenticateToken() , ProductController.getDetail);

router.post('/updateBranchCatalogue', AuthMiddleware.authenticateToken() , ProductController.updateCatalogueStatus);

router.post('/add', 
  AuthMiddleware.authenticateToken(),
  MulterMiddleware.upload.fields([{ name: 'image', maxCount: 1 },]),
  ProductController.postAdd);

router.post(
  '/update/:productId',
  AuthMiddleware.authenticateToken(),
  MulterMiddleware.upload.fields([
    { name: 'image', maxCount: 1 },
  ]),
  ProductController.postUpdate
);

router.delete('/delete/:productId', AuthMiddleware.authenticateToken(), ProductController.delete)

module.exports = router;
