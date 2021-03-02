const express = require("express");
const authRoutes = require("./auth");
const router = express.Router();
const postRouter = require("./post");
const chatRoomsRoutes = require("./chatRooms");
const userRouter = require("./users");

router.use("/users", userRouter);
router.use("/post", postRouter)
router.use("/auth", authRoutes);
router.use("/chat", chatRoomsRoutes);

module.exports = router;
