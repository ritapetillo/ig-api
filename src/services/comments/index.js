//Initial set-up
const express = require("express");
const commentRoutes = express.Router();
const mongoose = require("mongoose");
const q2m = require("query-to-mongo");

//Model
const CommentModel = require("../../Models/Comment");
const PostModel = require("../../Models/Post");
const UserModel = require("../../Models/User");

//Middlewares
const schemas = require("../../Lib/validation/validationSchema");
const validationMiddleware = require("../../Lib/validation/validationMiddleware");
const authorizeUser = require("../../Middlewares/auth");

//Error Handling
const ApiError = require("../../Lib/ApiError");

//post new comment
commentRoutes.post(
  "/:postId",
  authorizeUser,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user.username;
    try {
      if (!(await PostModel.findById(postId)))
        throw new ApiError(404, `post not found`);
      const newComment = new CommentModel(req.body);
      newComment.author = user;
      const { _id } = await newComment.save();
      const comment = await PostModel.findByIdAndUpdate(
        postId,
        { $addToSet: { comments: _id } },
        { runValidators: true, new: true }
      );
      res.status(200).send({ _id });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//retrieve all comments for a specific post
commentRoutes.get("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (postId) {
      const post = await PostModel.findOne({ _id: postId }).populate({
        path: "comments",
      });
      console.log("XX Post", post);
      if (post) {
        res.status(200).send(post);
      } else res.status(200).json({ message: "no comments for this post" });
    } else throw new ApiError(404, "no post found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//owner to edit their own comment on a specific post
commentRoutes.put(
  "/:commentId",
  authorizeUser,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    const { commentId } = req.params;
    const user = req.user;
    const commentToEdit = await CommentModel.findById(commentId);
    try {
      if (commentToEdit.author != user.username)
        throw new ApiError(401, `Only the owner of this comment can edit`);
      const updatedComment = await CommentModel.findByIdAndUpdate(
        commentId,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).json({ updatedComment });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//owner to delete their own comment on a specific post
commentRoutes.delete(
  "/:postId/:commentId",
  authorizeUser,
  async (req, res, next) => {
    const { commentId, postId } = req.params;
    const user = req.user;
    const commentToEdit = await CommentModel.findById(commentId);
    try {
      if (commentToEdit.author != user.username)
        throw new ApiError(401, `Only the owner of this comment can edit`);
      if (!(await CommentModel.findById(commentId)))
        throw new ApiError(404, `Comment not found`);
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { runValidators: true, new: true }
      );
      const deletedComment = await CommentModel.findByIdAndDelete(commentId);
      res.status(200).send("Deleted");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//Like a post
commentRoutes.post(
  "/:commentId/like",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;
      if (!(await CommentModel.findById(commentId)))
        throw new ApiError(404, `Comment not found`);
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { likedComments: commentId } },
        { runValidators: true, new: true }
      );
      const likedPost = await CommentModel.findByIdAndUpdate(commentId, {
        $addToSet: { likes: req.user.username },
      });
      res.status(200).send({ commentId });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//Unlike a comment
commentRoutes.put(
  "/:commentId/unlike",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;
      if (!(await CommentModel.findById(commentId)))
        throw new ApiError(404, `Comment not found`);
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { likedComments: commentId } },
        { runValidators: true, new: true }
      );
      const unlikedComment = await CommentModel.findByIdAndUpdate(commentId, {
        $pull: { likes: req.user.username },
      });
      res.status(200).send({ commentId });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = commentRoutes;
