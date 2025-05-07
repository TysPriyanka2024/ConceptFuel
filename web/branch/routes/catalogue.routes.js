const router = require('express').Router();
const { CatalogueControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/products', AuthMiddleware.authenticateToken() , CatalogueControllers.list);
router.post('/update-status', AuthMiddleware.authenticateToken(), CatalogueControllers.updateStatus)

module.exports = router;