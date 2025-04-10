const router = require('express').Router();
const { VehicleControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/list', AuthMiddleware.authenticateToken() , VehicleControllers.list);
router.get('/add', AuthMiddleware.authenticateToken() , VehicleControllers.getAdd);
router.get('/update/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.getUpdate);
router.get('/vehicle-stats', AuthMiddleware.authenticateToken() ,  VehicleControllers.vehicleStats);

router.get('/vehicle-connection/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.getVehicleConnection);

// router.get('/vehicle-stats/:vehicleId', AuthMiddleware.authenticateToken() ,  VehicleControllers.detailedStats);
// router.get('/getOrder', AuthMiddleware.authenticateToken() ,  VehicleControllers.getOrders);


// router.post('/post-stats', AuthMiddleware.authenticateToken() ,  VehicleControllers.postStats);
router.post('/add', AuthMiddleware.authenticateToken() , VehicleControllers.postAdd);

router.post('/delete', AuthMiddleware.authenticateToken() , VehicleControllers.updateStatus);

router.post('/update/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.postUpdate);

router.get('/getallstats/:vehicleId', AuthMiddleware.authenticateToken(), VehicleControllers.getStats)

module.exports = router;
