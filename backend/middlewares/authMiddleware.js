const jwt = require("jsonwebtoken");
const jwtsecret = process.env.JWT_SECRET;
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try{
        const token  = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if(!token){
            return res.status(401).json({message: "No token. Authorization denied"});
        }
        const decoded = jwt.verify(token, jwtsecret);
        req.user = await User.findById(decoded.id).select("-password");

        if(!req.user){
            return res.status(404).json({message: "User not found"});
        }

        next();
    }catch(error){
        return res.status(401).json({message: "Invaild token", error: error.message});
    }
}

module.exports = authMiddleware;