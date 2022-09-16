const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Database Connected!");
});
module.exports = connection;
