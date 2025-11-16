const router = require("express").Router();
const { Post, Category, User } = require("../models");
const { Op } = require("sequelize");


// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: Category, as: "category" },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts", error: error.message });
  }
});

// Add a new post
router.post("/", async (req, res) => {
  try {
    const { title, content, user_id, category_id } = req.body;

    if (!title || !content || !user_id || !category_id) {
      return res.status(400).json({ message: "Title, content, user_id, and category_id are required" });
    }

    const newPost = await Post.create({
      title,
      content,
      user_id,
      category_id,
    });

    const postWithRelations = await Post.findByPk(newPost.id, {
      include: [
        { model: Category, as: "category" },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
    });

    res.status(201).json(postWithRelations);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ message: "Error adding post", error: error.message });
  }
});


// search functionality works via /api/posts/search?q=keyword
// Search posts
router.get("/search/:q?", async (req, res) => {
  try {
    const q = req.params.q || req.query.q || "";
    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        { model: Category, as: "category" },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

// Get post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post", error: error.message });
  }
});

// Update post
router.put("/:id", async (req, res) => {
  try {
    const { title, content, category_id } = req.body;

    const [updatedRows] = await Post.update(
      { title, content, category_id },
      { where: { id: req.params.id } }
    );

    if (updatedRows === 0) return res.status(404).json({ message: "Post not found" });

    const updatedPost = await Post.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.destroy();
    res.json({ message: "Post deleted successfully", postId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

module.exports = router;