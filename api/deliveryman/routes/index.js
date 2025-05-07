const router = require('express').Router();
const authRoutes = require('./auth.routes');
const orderRoutes = require('./orders.routes')
const dispenserRoutes = require('./dispenser.route')

router.use('/', authRoutes);
router.use('/order', orderRoutes);
router.use('/dispenser', dispenserRoutes);


module.exports = router;
