const router = require('express').Router();
const { AuthController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');

router.get('/track-order/:orderId',AuthController.trackOrder)
router.get('/track-order-api/:orderId',AuthController.trackOrderApi)

module.exports = router;
