const router = require('express').Router();
const { ProductController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/lists', AuthMiddleware.authenticateToken() , ProductController.list);
router.get('/update/:id', AuthMiddleware.authenticateToken() , ProductController.getUpdate);
router.get('/detail/:id', AuthMiddleware.authenticateToken() , ProductController.getDetail);


router.post('/update-status', AuthMiddleware.authenticateToken(), ProductController.updateStatus)

router.post(
    '/update/:productId',
    MulterMiddleware.upload.fields([{ name: 'image', maxCount: 1 }]),
    AuthMiddleware.authenticateToken(),
    MulterMiddleware.compressImage, // Add image compression middleware
    ProductController.postUpdate
);

router.delete('/delete/:productId', AuthMiddleware.authenticateToken(), ProductController.delete)

module.exports = router;
