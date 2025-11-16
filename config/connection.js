require("dotenv").config();

const {Sequelize} = require("sequelize");

//for render:
const isProduction = process.env.NODE_ENV === "production";
let sequelize;

if (isProduction) {
  // For production on Render
  sequelize = new Sequelize(
    process.env.DATABASE_URL || process.env.JAWSDB_URL,
    {
      dialect: process.env.JAWSDB_URL ? "mysql" : "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    }
  );
} else {
  // For production in local DB
const sequelize = process.env.JAWSDB_URL
  ? new Sequelize(process.env.JAWSDB_URL)
  : new Sequelize(
      process.env.DB_DATABASE,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
      }
    );
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
