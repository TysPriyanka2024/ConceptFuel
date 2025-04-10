const router = require('express').Router();
const { VehicleControllers } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');

router.get('/list', AuthMiddleware.authenticateToken() , VehicleControllers.list);
router.get('/add', AuthMiddleware.authenticateToken() , VehicleControllers.getAdd);
router.get('/update/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.getUpdate);

router.post('/add', AuthMiddleware.authenticateToken() , VehicleControllers.postAdd);

router.delete('/delete/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.deleteVehicle);

router.post('/update/:vehicleId', AuthMiddleware.authenticateToken() , VehicleControllers.postUpdate);


module.exports = router;
