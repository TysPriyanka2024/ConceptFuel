const router = require('express').Router();
const { AuthController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');


router.get('/login', AuthController.getLogin, (req, res) => {
    res.render('a-login',{title: "admin" , redirect : "branch" ,route : finalRoute.baseUrL, error: "Welcome to Login"})
});
router.post('/login', AuthController.verifyLogin);

router.get('/dashboard', AuthMiddleware.authenticateToken() ,AuthController.getdashboard );

router.post('/logout', AuthMiddleware.authenticateToken() ,AuthController.logout );

module.exports = router;
