const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const jwtsecret = process.env.JWT_SECRET;
const {s3, awsBucketName} = require("../middlewares/s3Uploads");
const {DeleteObjectCommand} = require("@aws-sdk/client-s3");

const signup = async (req, res) => {
    const {name, email, password, bio} = req.body;
    const profilePic = req.file?.location || null;

    if(!name || !email || !password){
        return res.status(400).json({message: "All fields are required"});
    }
    
    let user = await User.findOne({email});
    if (user){
        return res.status(400).json({message: "User already exists"});
    }

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({name, email, password: hashedPassword, profilePic, bio});
        await user.save();

        res.status(201).json({message: "User registered successfully"});
    }catch(err){
        return res.status(500).json({message: "Server Error", error: err.message});
    }
}

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return res.status(400).json({message: "Incorrect password"});
        }

        const token = jwt.sign({id: user._id}, jwtsecret, {expiresIn: "1d"});
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict"
        });

        res.status(200).json({message: "Login Successful", user:{
            token: token,
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio
        }});
    }catch(err){
        return res.status(500).json({message: "Server Error", error: err.message});
    }
}

const check = (req, res) => {
    try{
        res.status(200).json({ user: req.user });
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const profile = async (req, res) => {
    try{
        const postCount = await Post.countDocuments({createdBy: req.user._id});
        return res.status(200).json({
            user: req.user,
            postsCount: postCount
        });
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const editProfile = async (req, res) => {
    try{
        const {name, bio} = req.body;
        const newProfilePic = req.file?.location;

        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if(newProfilePic && user.profilePic) {
            const oldKey = user.profilePic.split("/").pop();
            const deleteParams = {
                Bucket: awsBucketName,
                Key: oldKey
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        user.name = name || user.name;
        user.profilePic = newProfilePic || user.profilePic;
        if (bio !== undefined) {
            user.bio = bio;
        }

        await user.save();

        res.status(201).json({message: "Profile updated successfully", user: user});
    }catch(error){
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const logout = (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(400).json({ message: "No user is currently logged in" });
    }

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {signup, login, check, profile, editProfile, logout};