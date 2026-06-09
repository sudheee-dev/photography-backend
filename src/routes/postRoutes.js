const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { createPost } = require("../controllers/postController");
const { getallpost } = require("../controllers/postController");
const { updatepost } = require("../controllers/postController");

// CREATE POST
router.post("/", authMiddleware, createPost);
router.get("/", getallpost);
router.put("/:id", authMiddleware, updatepost);
module.exports = router;
