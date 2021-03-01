const express = require("express");
const authRoutes = express.Router();
const User = require('../../Models/User')

authRoutes.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ username })
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

module.exports = authRoutes;
