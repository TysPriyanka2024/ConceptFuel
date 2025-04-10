const router = require('express').Router();
const { AddressController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');




router.get('/state-lists', AddressController.getStateLists);
router.post('/city-lists', AddressController.getCityLists);
// Area Lists
router.post('/area-lists', AddressController.getAreaLists);
router.post('/district-lists', AddressController.getDistrictLists);

router.post('/add-address',AuthMiddleware.authenticateToken ,AddressController.addAddress);
router.post('/set-primary-address',AuthMiddleware.authenticateToken ,AddressController.setPrimaryAddress);
router.get('/get-address',AuthMiddleware.authenticateToken ,AddressController.getAddress);
router.post('/update-address',AuthMiddleware.authenticateToken ,AddressController.updateAddress);
router.delete('/delete-address',AuthMiddleware.authenticateToken ,AddressController.deleteAddress);


module.exports = router;