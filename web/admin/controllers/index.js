const AuthController = require('./auth.Controllers');
const CategoryController = require('./category.Controllers');
const SubCategoryController = require('./subCategory.Controllers');
// const AddonController = require('./addon.Controllers');
const ProductController = require('./products.Controllers');
const BranchControllers = require('./branch.Controllers');
const CustomerControllers = require('./customer.Controllers');
const OrderControllers = require('./order.Controllers');
const VehicleControllers = require('./vehicle.Controllers');
const SettingsControllers = require('./settings.Controllers');
const WalletControllers = require('./wallet.Controllers');

module.exports = {
    AuthController,
    CategoryController,
    SubCategoryController,
    // AddonController,
    ProductController,
    BranchControllers,
    CustomerControllers,
    OrderControllers,
    VehicleControllers,
    SettingsControllers,
    WalletControllers
}