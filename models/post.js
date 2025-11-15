const { Model, DataTypes } = require("sequelize");

const sequelize = require("../config/connection");

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Foreign key to User
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user", // Must match tableName in User model
        key: "id",
      },
      onDelete: "CASCADE",
    },
    // Foreign key to Category
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional if post can exist without category
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);

// Export Post model
module.exports = Post;
