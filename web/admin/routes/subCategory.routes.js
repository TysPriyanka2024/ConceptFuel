const router = require('express').Router();
const { SubCategoryController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


router.get('/sub-category', AuthMiddleware.authenticateToken() ,SubCategoryController.getList);
router.get('/sub-category/add', AuthMiddleware.authenticateToken() ,SubCategoryController.addSub);
router.get('/sub/update/:categoryId', AuthMiddleware.authenticateToken() ,SubCategoryController.getEditCategory);


router.post('/sub-category/add', AuthMiddleware.authenticateToken() ,SubCategoryController.postSubCategory);
router.post('/sub/update-status', AuthMiddleware.authenticateToken() , SubCategoryController.updateStatus);
router.post('/sub/update/:categoryId', AuthMiddleware.authenticateToken() ,SubCategoryController.updateSubCategory);

router.delete('/sub/delete/:subCategoryId', AuthMiddleware.authenticateToken(), SubCategoryController.deleteCategory)

module.exports = router;
