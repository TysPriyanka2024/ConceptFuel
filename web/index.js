const router = require('express').Router();
const admin = require('./admin');
const branch = require('./branch');
const customer = require('./location')

router.use('/admin', admin);
router.use('/branch', branch);
router.use('/customer', customer);


module.exports = router;