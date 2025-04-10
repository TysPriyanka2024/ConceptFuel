const router = require('express').Router();
const { CategoryController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


router.get('/all', AuthMiddleware.authenticateToken() ,CategoryController.getCategory);

router.get('/add', AuthMiddleware.authenticateToken() ,CategoryController.addCategory);

router.get('/update/:categoryId', AuthMiddleware.authenticateToken() ,CategoryController.getEditCategory);

router.post('/add', 
    AuthMiddleware.authenticateToken() ,
    MulterMiddleware.upload.fields([
      { name: 'image', maxCount: 1 },
    ]),
    CategoryController.postCategory
  );

router.post('/update-status', AuthMiddleware.authenticateToken() , CategoryController.updateStatus);

router.post('/update/:categoryId', 
    AuthMiddleware.authenticateToken(),
    MulterMiddleware.upload.fields([
      { name: 'image', maxCount: 1 },
    ]),
    CategoryController.updateCategory
  );

router.delete('/delete/:categoryId', AuthMiddleware.authenticateToken(), CategoryController.deleteCategory)


module.exports = router;
