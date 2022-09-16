const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

const db_connect = async () => {
  try {
    await connection.connect((err) => {
      console.error(`error al conectarse: ${err.stack}`);
    });

    console.log(`conectardo a la bd con el ID: ${connection.threadId}`);

    return connection;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = db_connect;
