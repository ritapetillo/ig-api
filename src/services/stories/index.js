//Initial set-up
const express = require("express");
const storiesRoutes = express.Router();
const commentRoutes = require("../comments");

//Models
const StoryModel = require("../../Models/Stroy");
const UserModel = require("../../Models/User");

//query to mongo
const q2m = require("query-to-mongo");

//middlewares
const upload = require("../../Lib/cloudinary/stories");
const authorizeUser = require("../../Middlewares/auth");

//error
const ApiError = require("../../Lib/ApiError");

storiesRoutes.get("/", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    if (req.user) {
      const user = await UserModel.findById(req.user._id);
      console.log("user", user);
      // const posts = await PostModel.find().populate({path : 'comments', populate: {path: 'userId'}});
      const stories = await StoryModel.find()
        .populate({ path: "comments authorId" })
        .sort({ createdAt: -1 });
      const followingStories = stories.filter((story) =>
        user.following.includes(story.authorId._id)
      );
      console.log("followingPosts", followingPosts);

      res.status(200).send(followingStories);
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

storiesRoutes.get("/me", authorizeUser, async (req, res, next) => {
  //gets all posts
  try {
    console.log("req.user", req.user);
    if (req.user) {
      const stories = await StorytModel.find({ authorId: req.user._id })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "authorId",
        });

      res.status(200).send(stories);
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//gets posts from single user (user feed)
storiesRoutes.get("/user/all/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    if (username) {
      const user = await UserModel.findOne({ username: username }).populate({
        path: "authorId",
      });
      if (!user) throw new ApiError(404, "no user found");
      {
        const stories = await StoryModel.find({ authorId: user._id }).sort({
          createdAt: -1,
        });

        res.status(200).send(stories);
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

storiesRoutes.post(
  "/upload",
  authorizeUser,
  upload.array("media"),
  async (req, res, next) => {
    try {
      const user = req.user._id;
      if (user) {
        const { files } = req;
        const media = files.map((file) => file.path);
        const newMedia = await new StoryModel({
          media,
          authorId: user,
        });
        const { _id } = await newMedia.save();
        res.status(200).send({ _id });
      } else throw new ApiError(401, "You are unauthorized.");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// storiesRoutes.get("/story/:storyId", authorizeUser, async (req, res, next) => {
//   //delete post
//   try {
//     if (req.user.username) {
//       const delete_story = await StoryModel.findByIdAndDelete(
//         req.params.storyId
//       );
//       if (delete_story) res.status(200).send("Deleted");
//       else throw new ApiError(404, "No post found"); //no post was found
//     } else throw new ApiError(401, "You are unauthorized.");
//   } catch (e) {
//     next(e);
//   }
// });

// storiesRoutes.put(
//   "/:postId",
//   authorizeUser,
//   validationMiddleware(schemas.PostSchema),
//   async (req, res, next) => {
//     //edit post
//     try {
//       if (req.user.username) {
//         const edited_post = await PostModel.findByIdAndUpdate(
//           req.params.postId,
//           req.body,
//           { runValidators: true }
//         );
//         if (edited_post) {
//           res.status(200).send(edited_post);
//         }
//       } else throw new ApiError(401, "You are unauthorized.");
//     } catch (e) {
//       next(e);
//     }
//   }
// );

storiesRoutes.delete("/:storyId", authorizeUser, async (req, res, next) => {
  //delete post
  try {
    if (req.user.username) {
      const delete_story = await StoryModel.findByIdAndDelete(req.params.storyId);
      if (delete_story) res.status(200).send("Deleted");
      else throw new ApiError(404, "No post found"); //no post was found
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (e) {
    next(e);
  }
});



module.exports = storiesRoutes;
