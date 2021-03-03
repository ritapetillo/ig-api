const mongoose = require("mongoose")
const { Schema, model } = require("mongoose");
const CommentSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
      },
      author: 
        { type: String },
    
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
