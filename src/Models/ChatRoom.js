const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    name: String,
    partecipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "messages" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat-rooms", ChatRoomSchema);
