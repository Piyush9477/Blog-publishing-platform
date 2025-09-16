const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {addPost, updatePost, deletePost, getPost, getMyPosts, getAllPosts} = require("../controllers/postController");
const {upload} = require("../middlewares/s3Uploads");

router.post("/add", authMiddleware, upload.single("file"), addPost);
router.put("/update/:id", authMiddleware, upload.single("file"), updatePost);
router.delete("/delete/:id", authMiddleware, deletePost);
router.get("/get/:id", authMiddleware, getPost);
router.get("/get", getAllPosts);
router.get("/my-posts/get", authMiddleware, getMyPosts);

module.exports = router;