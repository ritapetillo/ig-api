const express = require("express");
// const { isAuthorized } = require("../../middlewares/authorization");

const commentRoutes = express.Router();

commentRoutes.get("/");
commentRoutes.get("/:commentId");
commentRoutes.post("/");
commentRoutes.put("/:commentId");
commentRoutes.delete("/:commentId");

module.exports = commentRoutes;
