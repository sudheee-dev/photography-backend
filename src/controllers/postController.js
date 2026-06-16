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
    posts.created_at,
    profiles.username,

    COUNT(CASE WHEN likes.reaction_type = 'like' THEN 1 END) AS like_count,

    COUNT(CASE WHEN likes.reaction_type = 'love' THEN 1 END) AS love_count,

    COUNT(CASE WHEN likes.reaction_type = 'fire' THEN 1 END) AS fire_count,

    COUNT(CASE WHEN likes.reaction_type = 'wow' THEN 1 END) AS wow_count

FROM posts

INNER JOIN profiles
ON posts.user_id = profiles.user_id

LEFT JOIN likes
ON posts.id = likes.post_id

GROUP BY posts.id

ORDER BY posts.created_at DESC;
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

const deletePost = (req, res) => {
  const postId = req.params.id;

  const selectQuery = `
    SELECT * FROM posts
    WHERE id = ?
  `;

  db.query(selectQuery, [postId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = result[0];

    if (post.user_id == req.user.id || req.user.role === "admin") {
      const deleteQuery = `
        DELETE FROM posts
        WHERE id = ?
      `;

      db.query(deleteQuery, [postId], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete post",
          });
        }

        return res.status(200).json({
          message: "Post deleted successfully ✅",
        });
      });
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }
  });
};
const reactPost = (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { reaction_type } = req.body;

  const validReactions = ["like", "love", "fire", "wow"];

  if (!validReactions.includes(reaction_type)) {
    return res.status(400).json({
      message: "Invalid reaction",
    });
  }

  const checkReactionQuery = `
    SELECT *
    FROM likes
    WHERE user_id = ?
    AND post_id = ?
  `;

  db.query(checkReactionQuery, [userId, postId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }

    // No reaction exists
    if (result.length === 0) {
      const insertQuery = `
        INSERT INTO likes
        (user_id, post_id, reaction_type)
        VALUES (?, ?, ?)
      `;

      return db.query(insertQuery, [userId, postId, reaction_type], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Server Error",
          });
        }

        return res.status(201).json({
          message: "Reaction added successfully ✅",
        });
      });
    }

    const existingReaction = result[0];

    // Same reaction clicked again -> remove
    if (existingReaction.reaction_type === reaction_type) {
      const deleteQuery = `
        DELETE FROM likes
        WHERE user_id = ?
        AND post_id = ?
      `;

      db.query(deleteQuery, [userId, postId], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Server Error",
          });
        }

        return res.status(200).json({
          message: "Reaction removed ✅",
        });
      });
    } else {
      // Change reaction
      const updateQuery = `
        UPDATE likes
        SET reaction_type = ?
        WHERE user_id = ?
        AND post_id = ?
      `;

      db.query(updateQuery, [reaction_type, userId, postId], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Server Error",
          });
        }

        return res.status(200).json({
          message: "Reaction updated ✅",
        });
      });
    }
  });
};
module.exports = {
  createPost,
  getallpost,
  updatepost,
  deletePost,
  reactPost,
};
