//Load env first
require("dotenv").config();


// Import required packages
const express = require("express");
//no need for body parser
const path = require("path");

// Database sequelize
const sequelize = require("./config/connection");

// API routes
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");

// Initialize Express application
const app = express();

const PORT = process.env.PORT || 3001;

// has the --rebuild parameter been passed as a command line param? used for seeding
const rebuild = process.argv[2] === "--rebuild";

// Middleware - Parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle GET request at the root route - frontend route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm"));
});

// blog posts
app.use("/api/posts", postRoutes);
 // login/register       
app.use("/api/users", userRoutes);     
 // category filter
app.use("/api/categories", categoryRoutes);

// Database connection ! and server start
sequelize.authenticate()
  .then(() => console.log("DB connected successfully!"))
  .catch(err => console.error("DB connection failed:", err));

  // Sync database
sequelize.sync({ force: rebuild }).then(async () => {

    if (rebuild) {
      console.log("Rebuilding database & seeding data...");
      await require("./seeds/seed")();   // <!!! this was missing your seed file is in seeds/seed
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  })
  .catch(err => console.error("Sync failed:", err));

  // Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});