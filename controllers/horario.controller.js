const pool = require("../config/db.config");
const { validationResult } = require("express-validator");

const HorarioController = {
  get: async (req, res) => { },
  get_locales: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ error: errors.array() });

      try {
        
      const { semana, anno } = req.body;
      await pool.getConnection((err, conn) => {
        if (err) throw err;

        conn.query(`SELECT * FROM asignaciones WHERE anno=${anno} AND semana=${semana}`, (err, resp) => {
          if (err) throw err;

          return res.status(200).json(resp);
        })
        conn.release();
      }
      )

    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un error");
    }
  },
};

module.exports = HorarioController;
