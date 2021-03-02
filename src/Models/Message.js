const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    text: { type: String, require: true },
    media: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "chat-rooms" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("messages", MessageSchema);
