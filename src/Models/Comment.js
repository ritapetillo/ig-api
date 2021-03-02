const mongoose = require("mongoose")
const { Schema, model } = require("mongoose");
const CommentSchema = new Schema(
    {
      text: {
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
      },
      likes: [{type:String}], 
    },
    {timestamps: true}
  );
const CommentModel = model("comments", CommentSchema);
module.exports = CommentModel;
