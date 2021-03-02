const router = require("express").Router();
const commentRoutes = require("../comments");

//schemas
const schemas = require("../../Lib/validation/validationSchema");
const postModel = require("../../Models/Post");
const userModel = require("../../Models/User");
//query to mongo
const q2m = require("query-to-mongo");
//middlewares
const upload = require("../../Lib/cloudinary/posts");
const validate = require("../../Lib/validation/validationMiddleware");
const authorizeUser = require("../../Middlewares/auth");
//error
const ApiError = require("../../Lib/ApiError");

router.use("/comments", commentRoutes);

router.get("/", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    if (req.user) {
      const user = await userModel.findById(req.user._id);
      const posts = await postModel.find();
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

router.get("/me", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    console.log("req.user", req.user);
    if (req.user) {
      const posts = await postModel.find({ authorId: req.user._id });
      if (posts.length > 0) {
        res.status(200).send(posts);
      } else res.status(200).json({ message: "no content" });
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//gets posts from single user (user feed)

router.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    if (username) {
      const user = await userModel.findOne({ username: username });
      const posts = await postModel.find({ authorId: user._id });
      if (posts.length > 0) {
        res.status(200).send(posts);
      } else res.status(200).json({ message: "no content" });
    } else throw new ApiError(404, "no user found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/upload",
  authorizeUser,
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const user = req.user;
      console.log("user", user);
      if (user) {
        const image = req.file && req.file.path;
        console.log("image", image);
        const newPost = await new postModel({
          ...req.body,
          image,
          authorId: user._id,
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

router.put("/:postId", authorizeUser, async (req, res, next) => {
  //edit post
  try {
    if (req.user.username) {
      const edited_post = await postModel.findByIdAndUpdate(
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

router.delete("/:postId", authorizeUser, async (req, res, next) => {
  //delete post
  try {
    if (req.user.username) {
      const delete_post = await postModel.findByIdAndDelete(req.params.postId);
      if (delete_post) res.status(200).send("Deleted");
      else throw new ApiError(404, "No post found"); //no post was found
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (e) {
    next(e);
  }
});
module.exports = router;
