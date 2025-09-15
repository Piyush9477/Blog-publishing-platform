const express = require('express');
const router = express.Router();
const {signup, login, check, profile, editProfile, logout} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {upload} = require("../middlewares/s3Uploads");

router.post("/signup", upload.single("profilePic"), signup);
router.post("/login", login);
router.get("/check", authMiddleware, check);
router.get("/profile", authMiddleware, profile);
router.put("/edit-profile", authMiddleware, upload.single("profilePic"), editProfile);
router.post("/logout", logout);

module.exports = router;