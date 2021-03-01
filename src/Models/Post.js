
const mongoose = require("mongoose");
const CommentModel = require("./Comment");
const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        //max char validation added with joi 
    },
    post: {
        type: String,
        required: true
    },
    comments: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }]
    },
    authorId: {
        type: String,
        required: true
    }
},
{timestamps: true}
);
const PostModel = mongoose.model("post", PostSchema);
module.exports = PostModel;
