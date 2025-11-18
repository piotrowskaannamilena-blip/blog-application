// create a new router
const router = require("express").Router();

// import the models

const { Category }= require('../models/index');

// Router to add a new cat post
router.post("/", async (req, res) => {
  try {
    const { category_name } = req.body;
    const category = await Category.create({ category_name });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding category", error });
  }
});

// Route to get all cat
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "category_name"], // Include the id!
      order: [["id", "ASC"]],
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});

// Route to get by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving category", error });
  }
});

// Route to update a category
router.put("/:id", async (req, res) => {
  try {
    const { category_name } = req.body;
    const [updatedRows] = await Category.update(
      { category_name },
      { where: { id: req.params.id } }
    );
    if (updatedRows === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating category", error });
  }
});
// Route to delete a category
router.delete("/:id", async (req, res) => {
  try {
    const deletedRows = await Category.destroy({ where: { id: req.params.id } });
    if (deletedRows === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting category", error });
  }
});

// export the router
module.exports = router;