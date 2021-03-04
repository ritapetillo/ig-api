const ChatRoom = require("../../Models/ChatRoom");
const Message = require("../../Models/Message");
const User = require("../../Models/User");

const saveMessage = async (message) => {
  try {
    const currentRoom = await ChatRoom.findById(message.roomId);
    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();
    currentRoom.messages.push(savedMessage._id);
    await currentRoom.save();
    return savedMessage;
    // if (!currentRoom) {
    //     const newRoom = new ChatRoom({
    //         name:
    //     })
    // }
  } catch (err) {
    return null;
  }
};

const disconnectUser = async (user) => {
  try {
    const disconnectedUser = await User.findByIdAndUpdate(
      user._id,
      { socketId: "" },
      {
        runValidators: true,
        new: true,
      }
    );
    console.log(disconnectedUser);
    return disconnectedUser;
  } catch (err) {
    return null;
  }
};

const findChatsByPartecipants = async (id) => {
  try {
    const chats = await ChatRoom.find({ users: { $in: [id] } }).populate({
      path: "users messages",
    });
    return chats;
  } catch (err) {
    return null;
  }
};

module.exports = { saveMessage, disconnectUser, findChatsByPartecipants };
