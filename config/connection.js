require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

  //When the app is deployed, it will have access to Render's 
  // DB_URL variable and use that value to connect. Otherwise, it will continue using the localhost configuration

if (process.env.DATABASE_URL) {
  // Production on Render
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
  console.log("Using Render Postgres DB (production).");
} else {
  // Local development

  //This makes the app use the value of the PORT variable provided in the Render environment variables
  sequelize = new Sequelize(
    process.env.DB_DATABASE || "posts_db",
    process.env.DB_USERNAME || "postgres",
    process.env.DB_PASSWORD || "password",
    {
      host: process.env.DB_HOST || "localhost",
      dialect: process.env.DB_DIALECT || "postgres", 
      port: process.env.DB_PORT || 5432,
      logging: console.log,
    }
  );
  console.log("Using local database (development).");
}

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("DB connection failed:", err));

module.exports = sequelize;

// require("dotenv").config();

// const Sequelize = require("sequelize");


// if (process.env.DB_PASSWORD === "ChangeMe!") {
//   console.error("Please update the .env file with your database password.");
//   process.exit(1);
// }

// const sequelize = process.env.JAWSDB_URL
//   ? new Sequelize(process.env.JAWSDB_URL)
//   : new Sequelize(
//       process.env.DB_DATABASE,
//       process.env.DB_USERNAME,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT,
//         port: process.env.DB_PORT,
// // Logging locally for debugging
//         logging: console.log,
//       }
//     );

// module.exports = sequelize;
