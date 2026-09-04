const express = require("express");
const { farmerLogin, industryLogin, logisticLogin } = require("../controllers/login");

const router = express.Router();

router.post("/farmer", farmerLogin);
router.post("/industry", industryLogin);
router.post("/logistic", logisticLogin);

module.exports = router;
