const { Schema, model } = require("mongoose");
const CommentSchema = new Schema(
    {
      comment: {
        type: String,
        required: true,
      },
      userId: {
        type: String,
        required: false,
      },
      postId:{
        type: String,
        required: false,
      }
    },
    {
      timestamps: true,
    }
  );

const CommentModel = model("comments", CommentSchema);
module.exports = CommentModel;
