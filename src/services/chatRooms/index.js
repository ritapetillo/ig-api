const express = require("express");
const ChatRoom = require("../../Models/ChatRoom");
const roomRouter = express.Router();
const { findChatsByPartecipants } = require("../../Lib/socket");
const authorizeUser = require("../../Middlewares/auth");

//get all chats where user is partecipant
roomRouter.get("/", authorizeUser, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const chats = await findChatsByPartecipants(_id);
    res.status(200).send({ chats });
  } catch (err) {
    const error = new Error(" No chat rooms available");
    error.code = 404;
    next(error);
  }
});

//create a new chat
roomRouter.post("/", authorizeUser, async (req, res, next) => {
  try {
    const { users } = req.body;
    console.log(users);
    if (users.length < 0) throw Error;
    console.log(users);
    const chatDetails = {
      users: [req.user._id, ...users],
    };
    console.log(chatDetails);
    const douplicateChat = await ChatRoom.find({
      users: { $size: chatDetails.users.length, $in: chatDetails.users },
    });
    console.log(douplicateChat);
    if (!douplicateChat.length) {
      const newChat = new ChatRoom(chatDetails);
      const savedChat = await newChat.save();
      console.log(savedChat);
      res.status(200).send({ chat: savedChat });
    } else {
      res.status(200).send({ chat: douplicateChat });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(" There was a problem creating the chat");
    error.code = 404;
    next(error);
  }
});

//current user unsubscribe from chat
roomRouter.put(
  "/:chatId/unsubscribe",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const chatRoom = await ChatRoom.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: req.user._id },
        },
        { runValidators: true, new: true }
      );
      res.status(200).send({ chatRoom });
    } catch (err) {
      const error = new Error(
        " There was a problem adding the user to the chat"
      );
      error.code = 404;
      next(error);
    }
  }
);

//add a user to the chat
roomRouter.put(
  "/:chatId/add/:userId",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { chatId, userId } = req.params;
      console.log(userId);
      const chatRoom = await ChatRoom.findByIdAndUpdate(
        chatId,
        {
          $addToSet: { users: userId },
        },
        { runValidators: true, new: true }
      );
      console.log(chatId);
      res.status(200).send({ chatRoom });
    } catch (err) {
      const error = new Error(
        " There was a problem adding the user to the chat"
      );
      error.code = 404;
      next(error);
    }
  }
);

//remove user from chat
roomRouter.put(
  "/:chatId/remove/:userId",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { chatId, userId } = req.params;
      const chatRoom = await ChatRoom.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        { runValidators: true, new: true }
      );
      res.status(200).send({ chatRoom });
    } catch (err) {
      const error = new Error(
        " There was a problem adding the user to the chat"
      );
      error.code = 404;
      next(error);
    }
  }
);

module.exports = roomRouter;
