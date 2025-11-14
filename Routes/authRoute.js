const express = require("express");
const {
 LoginUser,
  register,
  getProfile,
  updateUserProfile
} = require("../controller/authController");

const protect  = require("../middleWare/authmiddleware");

const Router = express.Router();

Router.post("/login", LoginUser);
Router.post("/register", register);
Router.get("/profile", protect,getProfile);
Router.post("/updateprofile", protect,updateUserProfile);

module.exports = Router;