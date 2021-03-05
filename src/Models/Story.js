const mongoose = require("mongoose");
const StorySchema = new mongoose.Schema(
  {
    media: [String],

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);
const StoryModel = mongoose.model("stories", StorySchema);
module.exports = StoryModel;
