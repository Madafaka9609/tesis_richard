const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const HorarioController = require("../controllers/horario.controller");

router.post(
  "/horario/",
  [
    //check("seccion", "La seccion es obligatoria").not().isEmpty(),
    check("anno", "El año es obligatorio").not().isEmpty(),
    check("semana", "La semana es obligatoria").not().isEmpty(),
  ],
  HorarioController.generar_horario
);

module.exports = router;
