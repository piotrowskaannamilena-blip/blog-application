const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

const { signToken, authMiddleware } = require("../utils/auth");

// Get current authenticated user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(401).json({ message: "Token expired" });
    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET the User record
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ message: "No user found with this id" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);
    const token = signToken(userData);
    const { password, ...userDataSafe } = userData.get({ plain: true });
    res.status(200).json({ token, userData: userDataSafe });
  } catch (err) {
    res.status(400).json(err);
  }
});

// UDPATE the User record
router.put("/:id", async (req, res) => {
  try {
    const [updatedRows] = await User.update(req.body, { where: { id: req.params.id } });

    if (updatedRows === 0) return res.status(404).json({ message: "No user found with this id" });
    res.status(200).json({ message: "User updated successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Incorrect password" });

    const token = signToken(user);  // <-- FIXED: now creating token

    const { password: pw, ...safeUser } = user.get({ plain: true });

    res.json({
      message: "Login successful",
      token,         // <-- FIXED: frontend needs this
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.status(204).end();
});

module.exports = router;
