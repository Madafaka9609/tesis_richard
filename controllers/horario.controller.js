const db_connect = require("../config/db");
const { validationResult } = require("express-validator");

const HorarioController = {
  get: async (req, res) => {},
  generar_horario: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ error: errors.array() });
  },
};

module.exports = HorarioController;
