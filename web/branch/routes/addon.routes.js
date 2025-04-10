const router = require('express').Router();
const { AddonController } = require('../controllers');
const { AuthMiddleware, MulterMiddleware } = require('../middlewares');


router.get('/lists', AuthMiddleware.authenticateToken() ,AddonController.getList);
router.get('/add', AuthMiddleware.authenticateToken() ,AddonController.getAdd);
router.get('/update/:addonId', AuthMiddleware.authenticateToken() ,AddonController.getUpdate);


router.post('/add', AuthMiddleware.authenticateToken() ,AddonController.postAdd);
router.post('/update/:addonId', AuthMiddleware.authenticateToken() ,AddonController.postUpdate);

router.delete('/delete/:addonId', AuthMiddleware.authenticateToken(), AddonController.delete)

module.exports = router;
