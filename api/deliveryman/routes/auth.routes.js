const router = require('express').Router();
const { AuthController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


router.get('/getProfile',AuthMiddleware.authenticateToken , AuthController.getProfile);
router.post('/login', AuthController.login);
router.get('/userdata',AuthMiddleware.authenticateToken ,AuthController.getUser);
router.post('/logout', AuthMiddleware.authenticateToken ,AuthController.logout);
router.post('/add-location', AuthMiddleware.authenticateToken , AuthController.addLocation);
router.get('/get-location', AuthMiddleware.authenticateToken , AuthController.getlocation);
router.post('/add-device',AuthMiddleware.authenticateToken ,AuthController.addDevice);
router.get('/notifications', AuthMiddleware.authenticateToken ,AuthController.getNotification);
router.get('/get-unread-count', AuthMiddleware.authenticateToken ,AuthController.getUnreadCount);
router.post('/mark-read/:notification_id', AuthMiddleware.authenticateToken ,AuthController.markRead);
router.post('/mark-unread/:notification_id', AuthMiddleware.authenticateToken ,AuthController.markUnread);


module.exports = router;