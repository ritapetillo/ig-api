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
const passport = require("passport");

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
        const cookies = await generateCookies(tokens, res);
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
      const cookies = await generateCookies(tokens, res);
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

//GOOGLE AUTH

//LOGIN GOOGLE
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res, next) => {
    try {
      console.log(req.user);
      const { tokens } = req.user;
      const cookies = await generateCookies(tokens, res);
      //verify credentials
      res.redirect("http://localhost:3000");
    } catch (err) {
      next(err);
    }
  }
);

//LOGIN FACEBOOK
authRoutes.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

authRoutes.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  async (req, res, next) => {
    try {
      console.log("this is a user", req.user);
      const { tokens } = req.user;
      const cookies = await generateCookies(tokens, res);
      //verify credentials
      res.redirect("http://localhost:3000");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = authRoutes;
