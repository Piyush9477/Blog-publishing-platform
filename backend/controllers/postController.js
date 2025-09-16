const Post = require("../models/Post");
const {s3, awsBucketName} = require("../middlewares/s3Uploads");
const {DeleteObjectCommand} = require("@aws-sdk/client-s3");

const addPost = async (req, res) => {
    try{
        const {title, content, tagsString} = req.body;
        const {_id} = req.user;
        const image = req.file?.location || null;

        if(!title || !content){
            return res.status(400).json({message: "Title and content are required"});
        }

        let tags = [];
        if(tagsString){
            tags = tagsString.split(",").map(tag => tag.trim());
        }

        const newPost = new Post({title, content, tags, image, createdBy: _id});
        await newPost.save();

        res.status(201).json({message: "Post created successfully", post: newPost});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const updatePost = async (req, res) => {
    try{
        const {title, content, tagsString} = req.body;
        const {id} = req.params;
        const newImage = req.file?.location;

        const post = await Post.findById(id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        if(newImage && post.image) {
            const oldKey = post.image.split("/").pop();
            const deleteParams = {
                Bucket: awsBucketName,
                Key: oldKey
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        let tags = post.tags;
        if(tagsString){
            tags = tagsString.split(",").map(tag => tag.trim());
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags
        post.image = newImage || post.image;

        await post.save();

        res.status(200).json({message: "Post updated successfully", post: post});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const deletePost = async (req, res) => {
    try{
        const {id} = req.params;

        const post = await Post.findById(id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        if(post.file){
            const fileKey = post.image.split("/").pop();
            const deleteParams = {
                Bucket: awsBucketName,
                Key: fileKey
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({message: "Post deleted successfully"});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const getPost = async (req, res) => {
    try{
        const {id} = req.params;

        const post = await Post.findById(id).populate("createdBy", "name");
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        res.status(200).json({message: "Got post successfully", post: {
            title: post.title,
            content: post.content,
            tags: post.tags,
            image: post.image,
            createdBy: post.createdBy.name,
            createdAt: new Date(post.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            updatedAt: new Date(post.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const getMyPosts = async (req, res) => {
    try {
        const {_id} = req.user;
        const posts = await Post.find({createdBy: _id}).populate("createdBy", "name profilePic");
        if(!posts || posts.length==0){
            return res.status(404).json({message: "You have not created any posts yet."});
        }
        
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            tags: post.tags,
            image: post.image,
            createdBy: {
                name: post.createdBy.name,
                profilePic: post.createdBy.profilePic
            },
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        }));

        res.status(200).json({message: "Got your posts successfully", posts: formattedPosts});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const getAllPosts = async (req, res) => {
    try{
        const posts = await Post.find().populate("createdBy", "name profilePic");
        if(!posts || posts.length==0){
            return res.status(404).json({message: "Post not found"});
        }
        
        const formattedPosts = posts.map(post => ({
            title: post.title,
            content: post.content,
            tags: post.tags,
            image: post.image,
            createdBy: {
                name: post.createdBy.name,
                profilePic: post.createdBy.profilePic
            },
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        }));

        res.status(200).json({message: "Got all posts successfully", posts: formattedPosts});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

module.exports = {addPost, updatePost, deletePost, getPost, getMyPosts, getAllPosts};