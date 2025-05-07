const router = require('express').Router();
const customer = require('./customer');
const deliveryman = require('./deliveryman');

router.use('/auth', customer);
router.use('/auth/deliveryman', deliveryman);

module.exports = router;