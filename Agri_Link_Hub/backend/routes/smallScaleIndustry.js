const express = require('express');
const router = express.Router();
const { handleBuyProduct, handleCancelProduct, getOrders } = require('../controllers/smallScaleIndustry');
const auth = require('../middleware/auth');
// Orders / buy endpoints
router.post('/buy', handleBuyProduct);
router.post('/cancel', handleCancelProduct);
router.get('/orders', getOrders);
// router.post('/orders/book-logistics',);

module.exports = router;
