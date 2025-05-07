const router = require('express').Router();
const { AuthController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');


router.get('/login', AuthController.getLogin, (req, res) => {
    res.render('a-login',{title: "admin" , redirect : "branch" ,route : finalRoute.baseUrL, error: "Welcome to Login"})
});
router.post('/login', AuthController.verifyLogin);

router.get('/dashboard', AuthMiddleware.authenticateToken() ,AuthController.getdashboard );

router.get('/sales-data', AuthMiddleware.authenticateToken() ,AuthController.getSalesData );

router.post('/logout', AuthMiddleware.authenticateToken() ,AuthController.logout );

router.get('/change-password', AuthMiddleware.authenticateToken() ,AuthController.getChangePass );

router.post('/change-password', AuthMiddleware.authenticateToken() ,AuthController.postChangePass );
module.exports = router;
