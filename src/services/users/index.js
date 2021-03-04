const express = require("express");
const UserRouter = require("express").Router();

const mongoose = require("mongoose");
const cloudinaryParser = require("../../Lib/cloudinary/users");

//model
const UserModel = require("../../Models/User");

//Middlewares
const schemas = require("../../Lib/validation/validationSchema");
const validationMiddleware = require("../../Lib/validation/validationMiddleware");
const authorizeUser = require("../../Middlewares/auth");

//Error Handling
const ApiError = require("../../Lib/ApiError");

UserRouter.post(
  "/register",
  validationMiddleware(schemas.userSchema),
  async (req, res, next) => {
    try {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send(_id);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

UserRouter.post(
  "/upload",
  authorizeUser,
  cloudinaryParser.single("image"),
  async (req, res, next) => {
    const { _id } = req.user;
    try {
      const image = req.file && req.file.path;
      const editedUser = await UserModel.findByIdAndUpdate(
        _id,
        { $set: { imageUrl: image } },
        { runValidators: true, new: true }
      );
      res.status(200).send({ editedUser });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

UserRouter.get("/me", authorizeUser, async (req, res, next) => {
  try {
    const { _id } = req.user;
    console.log("req.user", req.user)
    const currentUser = await UserModel.findById(_id);
    console.log(currentUser);
    if (!currentUser) throw error;
    res.status(200).send({ currentUser });
  } catch (error) {
    const err = new Error("Wrong Credentials. Please login again");
    err.code = 401;
    next(err);
  }
});

UserRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find();
    if (users) {
      res.status(200).send(users);
    } else throw new ApiError(404, "No users found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

UserRouter.put(
  "/me",
  authorizeUser,
  validationMiddleware(schemas.userSchema),
  async (req, res, next) => {
    const { _id } = req.user;
    const editedUser = await UserModel.findById(_id);
    try {
      if (editedUser._id != _id)
        throw new ApiError(401, `Only the owner of this profile can edit`);
      const updatedProfile = await UserModel.findByIdAndUpdate(_id, req.body, {
        runValidators: true,
        new: true,
      });
      res.status(200).json({ updatedProfile });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

UserRouter.delete("/me", authorizeUser, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const deletedUser = await UserModel.findByIdAndDelete(_id);
    if (deletedUser) res.status(200).send(` deleted ${deletedUser} account`);
    const err = new Error("User not found");
    err.httpStatusCode = 404;
    next(err);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//POST follow a user
UserRouter.post("/follow/:followId", authorizeUser, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user._id;
    if (!(await UserModel.findById(followId)))
      return next(
        new Error("The user you are trying to follow, does not exist")
      );

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follow = await UserModel.findByIdAndUpdate(followId, {
      $addToSet: { followers: userId },
    });
    res.status(201).send({ user });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//PUT //api/users/:userId/unfollow/:followId
//UNFOLLOW AN USER
UserRouter.put("/unfollow/:followId", authorizeUser, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user._id;

    const following = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follower = await UserModel.findByIdAndUpdate(followId, {
      $pull: { followers: userId },
    });
    res.status(201).send({ following });
  } catch (err) {
    const error = new Error("You cannot unfollow this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users
//GET specific user
UserRouter.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username })
      .select("-password")
      .populate({ path: "following followers" });

    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There is no user with this id");
  }
});
module.exports = UserRouter;
