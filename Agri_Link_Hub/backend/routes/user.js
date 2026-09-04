const express = require("express");
const router = express.Router();
const { handleLogin, handleSignUp, handleLogout, handleGetUser } = require("../controllers/user");

router.post("/register", handleSignUp);
router.post("/login", handleLogin);
router.get("/logout", handleLogout); 
router.post("/get-user", handleGetUser);  
module.exports = router;
