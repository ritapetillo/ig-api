const express = require("express");
const UserRouter = express.Router();
const mongoose = require("mongoose");
const cloudinaryParser = require("../../Lib/cloudinary/users");
//model
const UserModel = require("../../Models/User");

UserRouter.post(
  "/register",
  cloudinaryParser.single("profileImage"),
  async (req, res, next) => {
    try {
      const newUser = new UserModel(req.body);
      //   newUser.imageUrl = req.file.path;
      const { _id } = await newUser.save();
      res.status(201).send(_id);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

UserRouter.post("/login", async (req, res, next) => {
  try {
    //CHECK CREDENTIALS
    const { email, password } = req.body;
    const user = await UserModel.findByCredentials(email, password);

    if (!author) {
      res.status(404).send("No user found");
    } else {
      //GENERATE TOKEN
      const tokens = await authenticate(user);
      res.cookie("accessToken", tokens.access, {
        httpOnly: true,
        path: "/authors/refreshToken",
      });
      res.cookie("refreshToken", tokens.refresh, {
        httpOnly: true,
        path: "/authors/refreshToken",
      });

      //SEND BACK TOKEN
      await res.status(200).send({ tokens, message: "nice!" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

UserRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find();

    if (users) {
      res.status(200).send(users);
    } else {
      const err = new Error("Users Not Found");
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

UserRouter.get("/:ProfileId", async (req, res, next) => {
  try {
    const { ProfileId } = req.params;

    const foundUser = await (await UserModel.findById(ProfileId)).populated(
      "users"
    );

    if (foundUser) res.status(200).send(foundUser);

    const err = new Error("User not found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

UserRouter.put("/:ProfileId", async (req, res, next) => {
  try {
    const { ProfileId } = req.params;

    const editedUser = await UserModel.findByIdAndUpdate(
      { _id: profileId },
      {
        $set: { ...req.body },
      }
    );

    if (!editedUser) {
      const err = new Error("Author Not Found");
      err.httpStatusCode = 404;
      next(err);
    }

    res.status(201).send(editedUser);
  } catch (error) {
    console.log("there was an error during the changes", error.name);
    next(error);
  }
});

UserRouter.delete("/:ProfileId", async (req, res, next) => {
  try {
    const { ProfileId } = req.params;
    console.log(ProfileId);
    const deletedUser = await UserModel.findByIdAndDelete(ProfileId);

    if (deletdUser) res.status(200).send(` deleted ${deletedUser} account`);

    const err = new Error("User not found");
    err.httpStatusCode = 404;
    next(err);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// UserRouter.post("/:ProfileId/followers", async (req, res, next) => {
//   try {
//     //TODO: Add profile in the array of followers
//     //TODO: We need the person to follow
//     // const user = await UserModel.findOneAndUpdate(
//     //     {username: req.user.username}
//     // )
//     //TODO: We need to take that person who is following
//     const newFollower = await UserModel.findById(ProfileId);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

// UserRouter.get("/followers", async (req,res,next) =>{
//     try {
//         const followers = await UserModel.find(req.query)
//     } catch (error) {

//     }
// })

module.exports = UserRouter;
