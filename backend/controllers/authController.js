const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const jwtsecret = process.env.JWT_SECRET;

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

module.exports = {signup};