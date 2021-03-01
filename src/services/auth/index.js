const { error } = require("console");
const express = require("express");
const authRoutes = express.Router();
const User = require("../../Models/User");

authRoutes.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw error;
    if (user) {
        const isValid = user.comparePass(password);
        //if it's valid, generate jwt
        //send cookies
    }
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

module.exports = authRoutes;
