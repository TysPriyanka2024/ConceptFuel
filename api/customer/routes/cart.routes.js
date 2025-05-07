const router = require('express').Router();
const { CartController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');


router.get('/cart-test', (req, res) => {
  res.send('Cart test');
});

router.get('/get', AuthMiddleware.authenticateToken ,CartController.cartList);
router.post('/add', AuthMiddleware.authenticateToken ,CartController.addCartData);
router.post('/update', AuthMiddleware.authenticateToken ,CartController.updateCartData);
router.delete('/delete', AuthMiddleware.authenticateToken ,CartController.deleteCart);
router.post('/delete-item', AuthMiddleware.authenticateToken ,CartController.deleteCartItem);
router.post('/cart-delete', AuthMiddleware.authenticateToken ,CartController.deleteCartAxios);

module.exports = router;