const express = require("express");
const authRoutes = require("./auth");
const postRouter = require("./post")
const router = express.Router();


router.use("/post", postRouter)
router.use("/auth", authRoutes);

module.exports = router;
