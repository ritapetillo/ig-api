
const mongoose = require("mongoose");
const CommentModel = require("./Comment");
const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        //max char validation added with joi 
    },
    image: {
        type: String,
        required: true
    },
    comments: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }]
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users", 
        required: true
    },
    likes: [{type: String}]},
{timestamps: true}
);
const PostModel = mongoose.model("posts", PostSchema);
module.exports = PostModel;
