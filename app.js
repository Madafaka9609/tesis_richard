const express = require("express");
const cors = require("cors");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const db_connect = require("./config/db");
require("dotenv").config({ path: ".development.env" });

//SERVER CREATION:
const app = express();

//MIDDLEWARES:
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

//ROUTES:
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Hello World!" });
});

//SERVER RUNING:
app.listen(process?.env.SERVER_PORT || 3000, () => {
  console.log(`Server running at port ${process.env.SERVER_PORT}`);
});
