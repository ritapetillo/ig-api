//Initial set-up
const express = require("express");
const postRoutes = express.Router();
const commentRoutes = require("../comments");

//Models
const PostModel = require("../../Models/Post");
const UserModel = require("../../Models/User");

//query to mongo
const q2m = require("query-to-mongo");

//middlewares
const upload = require("../../Lib/cloudinary/posts");
const schemas = require("../../Lib/validation/validationSchema");
const validationMiddleware = require("../../Lib/validation/validationMiddleware");
const authorizeUser = require("../../Middlewares/auth");

//error
const ApiError = require("../../Lib/ApiError");

//imported routes
postRoutes.use("/comments", commentRoutes);

postRoutes.get("/", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    if (req.user) {
      const user = await UserModel.findById(req.user._id);
      const posts = await PostModel.find();
      const followingPosts = posts.filter(post =>
        user.following.some(following => following === post.authorId)
      );
      if (followingPosts.length > 0) {
        res.status(200).send(followingPosts);
      } else res.status(200).json({ message: "no content" });
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postRoutes.get("/me", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    console.log("req.user", req.user);
    if (req.user) {
      const posts = await PostModel.find({ authorId: req.user._id });
      if (posts.length > 0) {
        res.status(200).send(posts);
      } else res.status(200).json({ message: "no content" });
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postRoutes.get("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (postId) {
      const post = await PostModel.findOne({ _id: postId });
      if (post) {
        res.status(200).send(post);
      } else res.status(200).json({ message: "no content" });
    } else throw new ApiError(404, "no post found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//gets posts from single user (user feed)
postRoutes.get("/user/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    if (username) {
      const user = await UserModel.findOne({ username: username });
      console.log("userXXXXX", user);
      if (!user) throw new ApiError(404, "no user found");
      {
        const posts = await PostModel.find({ authorId: user._id });
        if (posts.length > 0) {
          res.status(200).send(posts);
        } else res.status(200).json({ message: "no posts from this user" });
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postRoutes.post(
  "/upload",
  authorizeUser, validationMiddleware(schemas.PostSchema),
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const user = req.user._id;
      console.log("user", user);
      if (user) {
        const image = req.file && req.file.path;
        console.log("image", image);
        const newPost = await new PostModel({
          ...req.body,
          image,
          authorId: user,
        });
        const { _id } = await newPost.save();
        res.status(200).send({ newPost });
      } else throw new ApiError(401, "You are unauthorized.");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

postRoutes.put("/:postId", authorizeUser, validationMiddleware(schemas.PostSchema), async (req, res, next) => {
  //edit post
  try {
    if (req.user.username) {
      const edited_post = await PostModel.findByIdAndUpdate(
        req.params.postId,
        req.body,
        { runValidators: true }
      );
      if (edited_post) {
        res.status(200).send(edited_post);
      }
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (e) {
    next(e);
  }
});

postRoutes.delete("/:postId", authorizeUser, async (req, res, next) => {
  //delete post
  try {
    if (req.user.username) {
      const delete_post = await PostModel.findByIdAndDelete(req.params.postId);
      if (delete_post) res.status(200).send("Deleted");
      else throw new ApiError(404, "No post found"); //no post was found
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (e) {
    next(e);
  }
});

//Like a post
postRoutes.post("/:postId/like", authorizeUser, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    if (!(await PostModel.findById(postId)))
      throw new ApiError(404, `Post not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likedPosts: postId } },
      { runValidators: true, new: true }
    );
    const likedPost = await PostModel.findByIdAndUpdate(postId, {
      $addToSet: { likes: req.user.username },
    });
    res.status(200).send({ postId });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Unlike a post
postRoutes.put("/:postId/unlike", authorizeUser, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    if (!(await PostModel.findById(postId)))
      throw new ApiError(404, `Comment not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { likedPosts: postId } },
      { runValidators: true, new: true }
    );
    const unlikedPost = await PostModel.findByIdAndUpdate(postId, {
      $pull: { likes: req.user.username },
    });
    res.status(200).send({ postId });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = postRoutes;
