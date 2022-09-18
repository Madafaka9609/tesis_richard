const pool = require("../config/db.config");
const { validationResult } = require("express-validator");
const generar = require("../modules/generar.module");
const Helpers = require("../helpers/functions.helpers");

const HorarioController = {
  generar_horario: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ error: errors.array() });

    try {
      const { semana, anno, seccion } = req.body;

      await pool.getConnection(async (err, conn) => {
        if (err) {
          res.status(400).send("Conección inaccesible con la BD");
          throw err;
        }

        await generar(
          conn,
          res,
          Number(anno),
          Number(semana),
          Number(seccion)
        ).then(() =>
          res.status(200).json({ msg: "Horario generado con éxito " })
        );

        conn.release();
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un error");
    }
  },
};

module.exports = HorarioController;
