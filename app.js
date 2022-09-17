const express = require("express");
const cors = require("cors");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config({ path: ".development.env" });

//SERVER CREATION:
const app = express();

//MIDDLEWARES:
//app.use(cors());
//app.use(helmet());
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//ROUTES:
app.use("/api", require("./routes/horario.routes"));

//SERVER RUNING:
app.listen(process?.env.SERVER_PORT || 3000, () => {
  console.log(`Server running at port ${process.env.SERVER_PORT}`);
});
