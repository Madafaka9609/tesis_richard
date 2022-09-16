const connection = require("../config/db.config");
const { validationResult } = require("express-validator");

const HorarioController = {
  get: async (req, res) => {},
  generar_horario: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ error: errors.array() });

    const exist = connection.query(
      `SELECT * FROM asignaciones WHERE semana=${req.body.semana}`,
      (err, resul) => {
        if (err) throw err;

        return resul;
      }
    );

    console.log(exist);
  },
};

module.exports = HorarioController;
