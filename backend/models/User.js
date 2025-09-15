const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, trim: true},
    password: {type: String, required: true},
    profilePic: {type: String},
    bio: {type: String}
}, {timestamps: true});

const User = mongoose.model("user", userSchema);
module.exports = User;