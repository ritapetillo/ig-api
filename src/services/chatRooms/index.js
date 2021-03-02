const express = require("express");
const { authenticate } = require("passport");
const ChatRoom = require("../../Models/ChatRoom");
const roomRouter = express.Router();
const { findChatsByPartecipants } = require("../../Lib/socket");

//get all chats where user is partecipant
roomRouter.get("/", authorizeUser, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const chats = await findChatsByPartecipants(_id);
    
  } catch (err) {
    const error = new Error(" No chat rooms available");
    error.code = 404;
    next(error);
  }
});

//create a new chat
roomRouter.post("/", authorizeUser, async (req, res, next) => {
  try {
    const chatDetails = {
      ...req.body,
      users: [req.user._id],
    };
    const newChat = new ChatRoom(chatDetails);
    const savedChat = await newChat.save();
    return savedChat();
  } catch (err) {
    const error = new Error(" There was a problem creating the chat");
    error.code = 404;
    next(error);
  }
});

//current user unsubscribe from chat
roomRouter.put("/:chatId/unsubscribe", authorizeUser, async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chatRoom = await ChatRoom.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: req.user._id },
      },
      { runValidators: true }
    );
    res.status(200).send({ chatRoom });
  } catch (err) {
    const error = new Error(" There was a problem adding the user to the chat");
    error.code = 404;
    next(error);
  }
});

//add a user to the chat
roomRouter.put("/:chatId/add/:userId", authorizeUser, async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;
    const chatRoom = await ChatRoom.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { runValidators: true }
    );
    res.status(200).send({ chatRoom });
  } catch (err) {
    const error = new Error(" There was a problem adding the user to the chat");
    error.code = 404;
    next(error);
  }
});

//remove user from chat
roomRouter.put("/:chatId/remove/:userId", authorizeUser, async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;
    const chatRoom = await ChatRoom.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { runValidators: true }
    );
    res.status(200).send({ chatRoom });
  } catch (err) {
    const error = new Error(" There was a problem adding the user to the chat");
    error.code = 404;
    next(error);
  }
});



module.exports = roomRouter;
