const AuthController = require('./auth.Controllers');
const AddonController = require('./addon.Controllers');
const ProductController = require('./products.Controllers');
const OrderControllers = require('./order.Controllers');
const CatalogueControllers = require('./catalogue.Controllers');
const VehicleControllers = require('./vehicle.controllers');

module.exports = {
    AuthController,
    AddonController,
    ProductController,
    OrderControllers,
    CatalogueControllers,
    VehicleControllers
}