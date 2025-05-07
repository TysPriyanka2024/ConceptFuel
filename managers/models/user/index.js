const User = require('./user');
const Address = require('./address');
const Device = require('./device');
const Otp = require('./otpmodels');
const RevokedTokens = require('./revokedTokens');
const Wallet = require('./wallet');
const Transaction = require('./transaction');
const VehicleOtp = require('./vehicle_otp');
const Payment = require('./payment');


module.exports = {
    User,
    Address,
    Device,
    Otp,
    RevokedTokens,
    Wallet,
    Transaction,
    VehicleOtp,
    Payment
}