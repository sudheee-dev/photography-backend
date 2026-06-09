const db = require("../config/db");

// CREATE POST
const createPost = (req, res) => {
  const { image_url, description, location } = req.body;

  const userId = req.user.id;

  const query = `
    INSERT INTO posts
    (user_id, image_url, description, location)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [userId, image_url, description, location], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(201).json({
      message: "Post created successfully ✅",
    });
  });
};

// GET ALL POSTS
const getallpost = (req, res) => {
  const query = `
    SELECT
      posts.id,
      posts.image_url,
      posts.description,
      posts.location,
      posts.likes,
      posts.dislikes,
      posts.created_at,
      profiles.username
    FROM posts
    INNER JOIN profiles
    ON posts.user_id = profiles.user_id
    ORDER BY posts.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json(result);
  });
};

// UPDATE POST
const updatepost = (req, res) => {
  const postId = req.params.id;

  const selectQuery = `
    SELECT * FROM posts
    WHERE id = ?
  `;

  db.query(selectQuery, [postId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = result[0];

    // OWNER OR ADMIN
    if (post.user_id == req.user.id || req.user.role === "admin") {
      const { description, location } = req.body;

      const updateQuery = `
        UPDATE posts
        SET description = ?, location = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [description, location, postId], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to update post",
          });
        }

        return res.status(200).json({
          message: "Post updated successfully ✅",
        });
      });
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }
  });
};

module.exports = {
  createPost,
  getallpost,
  updatepost,
};
