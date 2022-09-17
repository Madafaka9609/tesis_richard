const Helpers = require("../helpers/functions.helpers");

const generar = (conn, res, anno, semana, seccion) => {
  return new Promise((reject, resolve) => {
    conn.query(
      `SELECT balance_de_carga.* FROM balance_de_carga INNER JOIN asignaturas ON balance_de_carga.asignaturas_id = asignaturas.id WHERE balance_de_carga.semana = ${semana} AND asignaturas.anno = ${anno}`,
      (err, balance_de_carga) => {
        if (err) reject(err);

        //recorre balance de carga
        balance_de_carga.map((bc) => {
          //Picar cada tipo de clase por ,
          const tipo_de_clase = bc.tipo_clase.split(",");
          //Recorre tipos de clases
          tipo_de_clase.map(async (tc) => {
            //Recorriendo planificacions
            const planif_wraped = await Helpers.return_planif(
              tc,
              bc.asignaturas_id,
              conn
            );

            const planif_unwraped = Object.values(
              JSON.parse(JSON.stringify(planif_wraped))
            );

            planif_unwraped.map(async (pl) => {
              const buscar_wraped = await Helpers.buscar_asig(
                bc.asignaturas_id,
                conn
              );

              const buscar_unwraped = Object.values(
                JSON.parse(JSON.stringify(buscar_wraped))
              );

              const dispo_wraped = await Helpers.return_disp(
                buscar_unwraped,
                tc,
                seccion,
                conn
              );

              const dispo_unwrap = Object.values(
                JSON.parse(JSON.stringify(dispo_wraped))
              );

              console.log(dispo_unwrap);
            });
          });
        });
      }
    );
  });
};

module.exports = generar;
