const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    tags: [{type: String}],
    image: {type: String},
    createdBy: {type: mongoose.Types.ObjectId, ref: "user", required: true}
}, {timestamps: true});

const Post = mongoose.model("post", postSchema);

module.exports = Post;