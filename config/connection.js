require("dotenv").config();
const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";

let sequelize;

if (isProduction) {
  // Production on Render using DATABASE_URL with Postgres
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
         // Needed for Render PostgreSQL SSL
        rejectUnauthorized: false,
      },
    },
    // Disable logging in production
    logging: false,
  });

  console.log("Connected to external Render PostgreSQL database.");

} else {
  // Local development 
  sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || "mysql", 
      port: process.env.DB_PORT,
      // Logging locally for debugging
      logging: console.log,
    }
  );
  console.log("Connected to local database.");
}

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
