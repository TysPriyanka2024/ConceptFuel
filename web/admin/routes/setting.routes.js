const router = require('express').Router();
const { SettingsControllers } = require('../controllers');
const { AuthMiddleware , MulterMiddleware } = require('../middlewares');

router.get('/notification', AuthMiddleware.authenticateToken() , SettingsControllers.getNotify);
router.get('/notification/add', AuthMiddleware.authenticateToken() , SettingsControllers.getAddNotify);
router.get('/notification/update/:id', AuthMiddleware.authenticateToken() , SettingsControllers.getUpdateNotify);

router.get('/vehicle-control', AuthMiddleware.authenticateToken() , SettingsControllers.getOtp);
router.post('/set-price/send', AuthMiddleware.authenticateToken() , SettingsControllers.setPrice);
router.post('/calibrate/send', AuthMiddleware.authenticateToken() , SettingsControllers.calibrate);

router.get('/company-lists', AuthMiddleware.authenticateToken() , SettingsControllers.getCompany);
router.post('/company-add', AuthMiddleware.authenticateToken() , SettingsControllers.postCompany);

router.get('/serving-states', AuthMiddleware.authenticateToken() , SettingsControllers.servingState);
router.post('/add-serving-states', AuthMiddleware.authenticateToken() , SettingsControllers.postStates);
router.get('/update-serving-states/:stateId', AuthMiddleware.authenticateToken(), SettingsControllers.updateState)
router.post('/update-serving-states/:stateId', AuthMiddleware.authenticateToken(), SettingsControllers.postupdateState)

router.get('/serving-cities', AuthMiddleware.authenticateToken() , SettingsControllers.servingCities);
router.post('/add-serving-cities', AuthMiddleware.authenticateToken() , SettingsControllers.postCity);
router.get('/update-serving-cities/:cityId', AuthMiddleware.authenticateToken(), SettingsControllers.updateCities)
router.post('/update-serving-cities/:cityId', AuthMiddleware.authenticateToken(), SettingsControllers.postupdateCities)

router.get('/serving-areas', AuthMiddleware.authenticateToken() , SettingsControllers.servingAreas);
router.post('/add-serving-areas', AuthMiddleware.authenticateToken() , SettingsControllers.postArea);
router.get('/update-serving-areas/:areaId', AuthMiddleware.authenticateToken(), SettingsControllers.updateArea);
router.post('/update-serving-areas/:areaId', AuthMiddleware.authenticateToken(), SettingsControllers.postupdateArea);
router.post('/update-area-price',SettingsControllers.updateAreaPrice)

router.get('/district-lists', SettingsControllers.getDistrictsList);
router.get('/city-lists', SettingsControllers.getCityList);
router.get('/area-lists', SettingsControllers.getAreaList);
router.get('/getDistricts', SettingsControllers.getDistricts);

router.get('/serving-districts', AuthMiddleware.authenticateToken() , SettingsControllers.servingDistricts);
router.post('/add-serving-districts', AuthMiddleware.authenticateToken() , SettingsControllers.postDistricts);
router.get('/update-serving-district/:districtId', AuthMiddleware.authenticateToken(), SettingsControllers.updateDistricts)
router.post('/update-serving-district/:districtId', AuthMiddleware.authenticateToken(), SettingsControllers.postupdateDistricts)

router.get('/users-image', AuthMiddleware.authenticateToken(), SettingsControllers.getCustomer);

router.post('/notification/add', 
    AuthMiddleware.authenticateToken() , 
    MulterMiddleware.upload.fields([
        { name: 'image', maxCount: 1 },
    ]),
    SettingsControllers.postAddNotify
  );

router.post('/notification/update/:id', 
    AuthMiddleware.authenticateToken() , 
    MulterMiddleware.upload.fields([
        { name: 'image', maxCount: 1 },
    ]),
    SettingsControllers.postUpdateNotify
);

router.get('/notification/send/:id', AuthMiddleware.authenticateToken(), SettingsControllers.sendNotification)

router.get('/general-settings', AuthMiddleware.authenticateToken(), SettingsControllers.setup);
router.post('/general-settings', AuthMiddleware.authenticateToken(),MulterMiddleware.upload.fields([{ name: 'image', maxCount: 1 },]), SettingsControllers.postSetup);

router.get('/customer-care', AuthMiddleware.authenticateToken(), SettingsControllers.getCustomerCare);
router.post('/add-customer-care', AuthMiddleware.authenticateToken(), SettingsControllers.postCustomerCare);

router.get('/update-customer-care/:care_id', AuthMiddleware.authenticateToken(), SettingsControllers.getUpdateCustomerCare);
router.post('/update-customer-care/:care_id', AuthMiddleware.authenticateToken(), SettingsControllers.updateCustomerCare);

module.exports = router;
