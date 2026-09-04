const { Farmer, Industry, LogisticService } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//SIGN UP (Farmer / Industry / Logistic)

const handleSignUp = async (req, res) => {
  try {
    const { role, email, password, ...others } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: "Role, email, and password are required" });
    }

    // Select model based on role
    let Model;
    if (role === "farmer") Model = Farmer;
    else if (role === "industry") Model = Industry;
    else if (role === "logistic") Model = LogisticService;
    else return res.status(400).json({ message: "Invalid role type" });

    const userFound = await Model.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await Model.create({
      email,
      password: hash,
      ...others,
    });

    let token = jwt.sign({ email, role }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.status(200).json({
      message: `${role} account created successfully`,
      user: createdUser,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//LOGIN (Farmer / Industry / Logistic)

const handleLogin = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: "Role, email, and password required" });
    }

    let Model;
    if (role === "farmer") Model = Farmer;
    else if (role === "industry") Model = Industry;
    else if (role === "logistic") Model = LogisticService;
    else return res.status(400).json({ message: "Invalid role type" });

    const userFound = await Model.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email or password is incorrect" });
    }

    let token = jwt.sign({ email, role }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.status(200).json({
      message: `${role} logged in successfully!`,
      user: userFound,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//LOGOUT
const handleLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  res.status(200).json({ message: "Logged out successfully!" });
};

//GET USER INFO (Based on token)

const handleGetUser = async (req, res) => {
  try {
    const { email, role } = req.user;

    let Model;
    if (role === "farmer") Model = Farmer;
    else if (role === "industry") Model = Industry;
    else if (role === "logistic") Model = LogisticService;
    else return res.status(400).json({ message: "Invalid role type" });

    const userInfo = await Model.findOne({ email });
    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      userDetails: {
        id: userInfo._id,
        role,
        email: userInfo.email,
        ...userInfo._doc,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { handleSignUp, handleLogin, handleLogout, handleGetUser };
