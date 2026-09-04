const { Farmer, Industry, LogisticService } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ---------------- FARMER LOGIN ----------------
const farmerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(400).json({ message: "Email or password is incorrect" });

    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

    const token = jwt.sign({ email, role: "farmer" }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax" });

    res.status(200).json({ message: "Farmer logged in successfully!", user: "farmer" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ---------------- INDUSTRY LOGIN ----------------
const industryLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const industry = await Industry.findOne({ email });
    if (!industry) return res.status(400).json({ message: "Email or password is incorrect" });

    const isMatch = await bcrypt.compare(password, industry.password);
    if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

    const token = jwt.sign({ email, role: "industry" }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax" });

    res.status(200).json({ message: "Industry logged in successfully!", user: "industry" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ---------------- LOGISTIC LOGIN ----------------
const logisticLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const logistic = await LogisticService.findOne({ email });
    if (!logistic) return res.status(400).json({ message: "Email or password is incorrect" });

    const isMatch = await bcrypt.compare(password, logistic.password);
    if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

    const token = jwt.sign({ email, role: "logistic" }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax" });

    res.status(200).json({ message: "Logistic service logged in successfully!", user: "logistic" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { farmerLogin, industryLogin, logisticLogin };
