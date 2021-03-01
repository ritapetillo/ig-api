const express = require("express");
const router = express.Router();
const commentRoutes = require("./comments")


router.use("/comments", commentRoutes)

module.exports = router;
