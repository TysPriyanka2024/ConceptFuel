const router = require('express').Router();
const authRoutes = require('./auth.routes');
const AddonRoutes = require('./addon.routes');
const ProductRoutes = require('./product.route');
const VehicleRoutes = require('./vehicle.routes');
const OrderRoutes = require('./order.routes');
const CatalogueRoutes = require('./catalogue.routes');

router.use('/auth', authRoutes);
router.use('/addon', AddonRoutes);
router.use('/vehicle', VehicleRoutes);
router.use('/product', ProductRoutes);
router.use('/catalogue', CatalogueRoutes);
router.use('/order', OrderRoutes);


module.exports = router;
