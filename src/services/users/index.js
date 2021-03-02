const express = require("express");
const UserRouter = express.Router();
const mongoose = require("mongoose");
const cloudinaryParser = require("../../Lib/cloudinary/users");
const q2m = require("query-to-mongo");

//model
const UserModel = require("../../Models/User");

//auth
const { generateTokens, refresh } = require("../../Lib/auth/tokens");

//middlewares
const { authorizeUser } = require("../../Middlewares/auth");

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
    console.log(email, password);
    const user = await UserModel.findByCredentials(email, password);
    console.log(user);
    if (!user) {
      res.status(404).send("No user found");
    } else {
      //GENERATE TOKEN
      const { accessToken, refreshToken } = await generateTokens(user);

      //send back tokens
      res.send({ accessToken, refreshToken });

      //*send cookies
      //   res.cookie("accessToken", tokens.access, {
      //     httpOnly: true,
      //     path: "/authors/refreshToken",
      //   });
      //   res.cookie("refreshToken", tokens.refresh, {
      //     httpOnly: true,
      //     path: "/authors/refreshToken",
      //   });

      //SEND BACK TOKEN
      res.status(200).send({ accessToken, refreshToken });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

UserRouter.post("/refreshToken", async (req, res, next) => {
  try {
    //todo: Grab refresh token
    const oldRefreshToken = req.body.refreshToken;
    //todo: verify the token

    //todo: IF it's ok generate new access token and new refresh token
    const { accessToken, refreshToken } = await refresh(oldRefreshToken);
    //todo: SEND them back
    res.send({ accessToken, refreshToken });
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

UserRouter.get(
  "/:username/followers",
  //   authorizeUser,
  async (req, res, next) => {
    try {
      if (req.user) {
        const user = await (
          await UserModel.findOne({ username: req.params.username })
        ).populate("followers");
        if (user.private) {
          if (req.user.following.includes(user._id)) {
            res.send(user.followers);
          } else {
            const error = new Error();
            error.httpStatusCode = 401;
            next(error);
          }
        } else {
          res.send(user.followers);
        }
      } else {
        const err = new Error();
        err.httpStatusCode = 401;
        next(err);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

UserRouter.get(
  "/:username/following",
  //   authorizeUser,
  async (req, res, next) => {
    try {
      if (req.user) {
        const user = await (
          await UserModel.findOne({ username: req.params.username })
        ).populated("following");
        if (user.private) {
          if (req.user.following.includes(user._id)) {
            res.send(user.following);
          } else {
            const error = new Error();
            error.httpStatusCode = 401;
            next(error);
          }
        } else {
          res.send(user.following);
        }
      } else {
        const err = new Error();
        error.httpStatusCdoe = 401;
        next(error);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = UserRouter;
