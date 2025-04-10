const router = require('express').Router();
const { AuthController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


router.get('/test', (req, res) => {
  res.send('About birds');
});

router.get('/getProfile',AuthMiddleware.authenticateToken , AuthController.getProfile);
router.get('/company-lists', AuthController.getCompanyLists);
router.post('/updateProfile',AuthMiddleware.authenticateToken , AuthController.updateProfile);
router.post('/login', AuthController.login);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register',AuthController.register);
router.post('/send-email', AuthMiddleware.authenticateToken, AuthController.sendEmail);
// router.post('/add-address',AuthMiddleware.authenticateToken ,AuthController.addAddress);
router.post('/add-device',AuthMiddleware.authenticateToken ,AuthController.addDevice);
router.get('/userdata',AuthMiddleware.authenticateToken,AuthController.getUser);
router.post('/logout', AuthMiddleware.authenticateToken ,AuthController.logout);
router.post('/add-whatsapp-data', AuthMiddleware.authenticateToken ,AuthController.storeMobileandToken);
router.post('/whatsappLogin', AuthController.verifyMobileAndGenerateToken);
router.post('/updatePhoto', MulterMiddleware.upload.fields([
  { name: 'profile', maxCount: 1 }
]),AuthMiddleware.authenticateToken , AuthController.updatePhoto);

router.get('/notifications', AuthMiddleware.authenticateToken ,AuthController.getNotification);
router.get('/get-unread-count', AuthMiddleware.authenticateToken ,AuthController.getUnreadCount);
router.post('/mark-read/:notification_id', AuthMiddleware.authenticateToken ,AuthController.markRead);
router.post('/mark-unread/:notification_id', AuthMiddleware.authenticateToken ,AuthController.markUnread);

module.exports = router;
