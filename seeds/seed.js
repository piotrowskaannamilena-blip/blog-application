require("dotenv").config();
const mysql = require('mysql2');

// Import Sequelize connection and models
const sequelize = require("../config/connection");
const { User, Post, Category } = require("../models");

// Import seed data
const categoryData = require("./categories.json");
const userData = require("./users.json");
const postData = require("./posts.json");

const seedDatabase = async () => {
  try {
    // Check if category already exists
    // Removes duplicated categories - unique by using findOrCreate
  for (let category of categoryData) {
      const [categoryInstance, created] = await Category.findOrCreate({
        where: { category_name: category.category_name }, // Check for existing category by name
        defaults: { category_name: category.category_name } // If not found, create it
      });

      if (created) {
        console.log(`Category "${categoryInstance.category_name}" created.`);
        console.log('Categories seeded successfully, with duplicates ignored.');
      } else {
        console.log(`Category "${categoryInstance.category_name}" already exists.`);
      }
    }

    // Seed users
    const users = await User.bulkCreate(userData, {
      individualHooks: true, // Ensure password hashing works with each user
      returning: true,
    });
    console.log(`${users.length} users seeded.`);

    // Seed posts
    const posts = postData.map((post) => {
      let user = users.find((u) => u.username.toLowerCase() === post.postedBy.toLowerCase());
      if (!user) user = users[0]; // Default to the first user if no match

      let category = categoryData.find((c) => c.category_name === post.category_name);
      if (!category) category = categoryData[0]; // Default to first category if no match

      return {
        title: post.title,
        content: post.content,
        user_id: user.id,
        category_id: category.id,
        createdAt: post.createdOn,
        updatedAt: post.createdOn,
      };
    });
  await Post.bulkCreate(posts);
    console.log(`${posts.length} posts seeded.`);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
};

const seedUsers = async () => {
  try {
    // Seed the users
    const users = await User.bulkCreate(userData, {
      individualHooks: true, // Ensure password hashing works with each user
      returning: true,
    });

    console.log(`${users.length} users seeded.`);
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

User.findAll().then(users => {
  console.log(users); // Check the output to ensure passwords are hashed
});

const users = [
  { id: 1, username: 'John Doe', email: 'john@example.com', password: 'hashedPassword1' },
  { id: 2, username: 'Jane Smith', email: 'jane@example.com', password: 'hashedPassword2' },
  { id: 3, username: 'Joe', email: 'joe@example.com', password: 'hashedPassword3' }
];

users.forEach(async (userData) => {
  await User.findOrCreate({
    where: { id: userData.id },
    defaults: userData,
  });
});

// Run the seeding function
seedUsers();
seedDatabase();