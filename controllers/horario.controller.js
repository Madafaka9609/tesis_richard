const db_connect = require("../config/db");
const { validationResult } = require("express-validator");

const HorarioController = {
  get: async (req, res) => {},
  generar_horario: async (req, res) => {
    const errors = validationResult(req);
  },
};

module.exports = HorarioController;
