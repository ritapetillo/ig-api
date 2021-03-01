const { error } = require("console");
const express = require("express");
const { generateCookies } = require("../../Lib/auth/cookies");
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../Lib/auth/tokens");
const authorizeUser = require("../../Middlewares/auth");
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
      const tokens = await generateTokens(user);
      //send cookies
      if (!tokens) throw error;
      else {
        const cookies = await generateCookies(tokens);
        res.send(tokens);
      }
    }
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

authRoutes.post("/refresh", authorizeUser, async (req, res, next) => {
  try {
    //validate and deode refreh token
    const user = await verifyRefreshToken(req);
    if (!user) throw error;
    //if there is a user, re-generate tokens and cookies
    const tokens = await generateTokens(user);
    //send cookies
    if (!tokens) throw error;
    else {
      const cookies = await generateCookies(tokens);
      res.send(tokens);
    }
  } catch (err) {
    const error = new Error("User not authorized. Please login in");
    error.code = 401;
    next(error);
  }
});

authRoutes.post("/logout", authorizeUser, async (req, res, next) => {
  try {
    const clearCookies = await clearCookies(res);
    res.send("Logout");
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

module.exports = authRoutes;
