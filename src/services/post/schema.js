
const mongoose = require("mongoose")
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
        type: Array
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
