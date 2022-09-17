const mysql = require("mysql");
require("dotenv").config({ path: "../.development.env" });

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_SCHEMA,
  debug: false,
});

module.exports = pool;
