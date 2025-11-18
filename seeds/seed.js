require("dotenv").config();
const sequelize = require("../config/connection");
const { User, Post, Category } = require("../models");

const categoryData = require("./categories.json");
const userData = require("./users.json");
const postData = require("./posts.json");

// Helper function to correct/format dates
const dateFormat = (date) => {
  if (!date) return new Date(); // If missing, use current date
  const parsedDate = new Date(date);
  return isNaN(parsedDate) ? new Date() : parsedDate; // Fallback if invalid
};

const seedDatabase = async () => {
  try {
    console.log("Using Render Postgres DB");
    console.log("Starting seed...");

    // Force sync the database
    await sequelize.sync({ force: true });
    console.log("Database synced successfully!");

    // Start a transaction to ensure atomic seeding
    await sequelize.transaction(async (t) => {

      // Seed categories
      const categories = await Category.bulkCreate(categoryData, {
        returning: true,
        transaction: t
      });
      console.log(`${categories.length} categories seeded.`);

      // Seed users (with individualHooks for password hashing)
      const users = await User.bulkCreate(userData, {
        individualHooks: true,
        returning: true,
        transaction: t
      });
      console.log(`${users.length} users seeded.`);

      // Map posts to actual foreign keys
      const posts = postData.map(post => {
        const user = users.find(u => u.id === post.user_id);
        const category = categories.find(c => c.id === post.category_id);

        if (!user || !category) {
          throw new Error(`Invalid userId or categoryId for post: ${post.title}`);
        }

        return {
          title: post.title,
          content: post.content,
          user_id: user.id,
          category_id: category.id,
          createdAt: dateFormat(post.created_at),
          updatedAt: dateFormat(post.updated_at)
        };
      });

      // Seed posts
      await Post.bulkCreate(posts, { transaction: t });
      console.log(`${posts.length} posts seeded.`);
    });

    console.log("Database seeded successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDatabase();
