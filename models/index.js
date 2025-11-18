// import all models
const Post = require("./post");
const Category = require("./category");
const User = require("./user");
//hooks true - ON DELETE CASCADE works in Postgres

// Relationship, user has many posts
User.hasMany(Post, {
  foreignKey: "user_id",
  as: "posts",
  onDelete: "CASCADE",
  hooks: true,
});

// post belong to user
Post.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// cat has many posts
Category.hasMany(Post, {
  foreignKey: "category_id",
  as: "posts",
  onDelete: "SET NULL", 
  hooks: true,
}); 
 
// post belongs to category
Post.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

module.exports = {
  Post,
  Category,
  User,
};
