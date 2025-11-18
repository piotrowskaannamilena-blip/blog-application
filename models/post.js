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

    // Foreign key user
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE", 
    },

    // Foreign key category
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "SET NULL",

    },
  },
  
  {
    sequelize,
    modelName: "post",          // important
    freezeTableName: true,      // table name = "post"
    underscored: true,          // created_at, updated_at
    timestamps: true,
  }
);

module.exports = Post;
