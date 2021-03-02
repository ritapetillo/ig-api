const express = require("express");
const authRoutes = require("./auth");
const postRouter = require("./post");
const router = express.Router();
const commentRoutes = require("./comments");
const chatRoomsRoutes = require("./chatRooms");

const userRouter = require("./users");

router.use("/users", userRouter);
router.use("/comments", commentRoutes);
router.use("/post", postRouter);
router.use("/auth", authRoutes);
router.use("/chat", chatRoomsRoutes);

module.exports = router;
