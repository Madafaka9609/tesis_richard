const pool_querys = require("../config/db.config");
const { validationResult } = require("express-validator");

const HorarioController = {
  get: async (req, res) => {},
  get_locales: async (req, res, next) => {
    /* const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ error: errors.array() });

    const { semana, anno } = req.body; */
    try {
      const exist = await pool_querys.generar_horario();

      res.json(exist);
    } catch (error) {
      console.log(error);
      res.status(500).send("HUbo un error");
    }
  },
};

module.exports = HorarioController;
