const Helpers = require("../helpers/functions.helpers");

function BreakException(message) {
  this.message = message;
  this.name = "Exception";
}

const generar = (conn, res, anno, semana, seccion) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT balance_de_carga.* FROM balance_de_carga INNER JOIN asignaturas ON balance_de_carga.asignaturas_id = asignaturas.id WHERE balance_de_carga.semana = ${semana} AND asignaturas.anno = ${anno}`,
      (err, balance_de_carga) => {
        if (err) reject(err);

        //recorre balance de carga
        resolve(
          balance_de_carga.forEach((bc) => {
            //Picar cada tipo de clase por ,
            const tipo_de_clase = bc.tipo_clase.split(",");
            //Recorre tipos de clases
            tipo_de_clase.forEach(async (tc) => {
              const isGenBc = JSON.parse(
                JSON.stringify(
                  await Helpers.check_bc_isGenenated(
                    tc,
                    bc.asignaturas_id,
                    conn
                  )
                )
              );

              let exist = [];

              if (isGenBc.length > 0) {
                exist = [
                  ...Object.values(
                    JSON.parse(
                      JSON.stringify(
                        await Helpers.exist(anno, semana, isGenBc, conn)
                      )
                    )
                  ),
                ];
              }

              if (exist.length > 0) {
                //res.status(401).json({ msg: "EL horario ya fue generado" });
              } else {
                //Recorriendo planificacions
                const planif_unwraped = Object.values(
                  JSON.parse(
                    JSON.stringify(
                      await Helpers.return_planif(tc, bc.asignaturas_id, conn)
                    )
                  )
                );

                planif_unwraped.forEach(async (pl) => {
                  const buscar_unwraped = Object.values(
                    JSON.parse(
                      JSON.stringify(
                        await Helpers.buscar_asig(bc.asignaturas_id, conn)
                      )
                    )
                  );

                  const dispo_unwraped = Object.values(
                    JSON.parse(
                      JSON.stringify(
                        await Helpers.return_disp(
                          buscar_unwraped,
                          tc,
                          seccion,
                          conn
                        )
                      )
                    )
                  );

                  for (let i = 0; i < dispo_unwraped.length; i++) {
                    const disp_lib_unwraped = Object.values(
                      JSON.parse(
                        JSON.stringify(
                          await Helpers.disponibilidades_libres(
                            buscar_unwraped,
                            tc,
                            dispo_unwraped[i],
                            conn
                          )
                        )
                      )
                    );

                    let ocupada = await Helpers.ocupada(
                      disp_lib_unwraped,
                      dispo_unwraped[i],
                      pl.id,
                      conn
                    );

                    let check = await Helpers.check(
                      pl,
                      dispo_unwraped[i],
                      conn
                    );

                    if (!ocupada) {
                      if (!check) {
                        await Helpers.relacionar(
                          pl.id,
                          dispo_unwraped[i].id,
                          anno,
                          semana,
                          conn
                        );
                        break;
                      }
                    }
                  }
                });
              }
            });
          })
        );
      }
    );
  });
};

module.exports = generar;
