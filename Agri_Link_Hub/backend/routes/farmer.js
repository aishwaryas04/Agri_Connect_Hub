const express = require('express');
const { handleListings, getListings, handleDeleteProduct } = require('../controllers/farmer');

const router = express.Router();

//add auth middleware here 
router.post('/listing', handleListings);
router.get('/get-listings', getListings);
router.delete("/delete-listing/:id", handleDeleteProduct);

module.exports = router;
