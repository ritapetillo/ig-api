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
      const user = await User.findById(req.user._id);
      const posts = await Post.find();
      const followingPosts = posts.filter(post =>
        user.following.some(following => following === post.authorId)
      );
      if (posts.length > 0) {
        res.status(200).send(followingPosts);
      } else res.status(204).json({ message: "no content" });
    } 
    else throw new ApiError(401, "You are unauthorized.");
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
      } else res.status(204).json({ message: "no content" }); //no content}
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  //didn't make this endpoint reserved because you don't need to be logged in to see public profiles
  //gets posts from single user (user feed)
  try {
    const check_user = await userModel.findById(req.params.userId);
    if (check_user) {
      //if a user is found, search for their feed
      const user_feed = await postModel
        .find({ authorId: req.params.userId })
        .sort({ createdAt: -1 });
      if (user_feed.length > 0) {
        //if there are posts
        res.status(200).send(user_feed);
      } else res.send(204); //if there are no posts
    } else throw new ApiError(404, "No user found"); //if there is no user
  } catch (e) {
    next(e);
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
