require("dotenv").config();

// Import Sequelize connection and models
const sequelize = require("../config/connection");
const { User, Post, Category } = require("../models");

// Import seed data
const categoryData = require("./categories.json");
const userData = require("./users.json");
const postData = require("./posts.json");

const seedDatabase = async () => {
  try {
    // Recreate all tables
    await sequelize.sync({ force: true });
    console.log("Database synced successfully!");

    // Seed categories
    const categories = await Category.bulkCreate(categoryData, { returning: true });
    console.log(`${categories.length} categories seeded.`);

    // Seed users (hash passwords via individualHooks)
    const users = await User.bulkCreate(userData, { individualHooks: true, returning: true });
    console.log(`${users.length} users seeded.`);

    // Map posts to categoryId and userId
    const posts = postData.map((post, index) => {
      // Find category by name
      let category = null;
      if (post.category_name) {
        category = categories.find(c => c.category_name === post.category_name);
      }

      // Fallback: use categoryId from postData if no name match
      if (!category && post.categoryId) {
        category = categories.find(c => c.id === parseInt(post.categoryId));
      }

      // Find user by postedBy field; fallback to round-robin
      let user = users.find(u => u.username === post.postedBy);
      if (!user) user = users[index % users.length];

      return {
        title: post.title,
        content: post.content,
        userId: user.id,
        categoryId: category ? category.id : null,
        createdAt: post.createdOn,
        updatedAt: post.createdOn,
      };
    });

    // Seed posts
    await Post.bulkCreate(posts);
    console.log(`${posts.length} posts seeded.`);

    console.log("Database seeded successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();