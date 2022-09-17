function string_literal(arr) {
  let destroy_arr = ``;

  arr.map((el, ind) => {
    if (ind === 0) {
      destroy_arr += `('${el}'`;
    } else if (ind === arr.length - 1) {
      destroy_arr += `,'${el}')`;
    } else {
      destroy_arr += `,'${el}'`;
    }
  });

  return destroy_arr;
}

function validate_seccion(arr, tipo_local, conn, reject, resolve) {
  conn.query(
    `
      SELECT *
      FROM disponibilidad
      WHERE turno IN ${string_literal(arr)}
      AND disponibilidad.locales_id IN (SELECT locales.id
                                          FROM locales
                                          WHERE locales.tipo_de_locales_id = (SELECT id FROM tipo_de_locales WHERE tipo = '${tipo_local}'))
                                          ORDER BY disponibilidad.dia, disponibilidad.turno`,
    (err, resp) => {
      if (err) reject(err);
      else resolve(resp);
    }
  );
}

const Helpers = {
  return_planif: (tc, id_asig, conn) => {
    return new Promise((resolve, reject) => {
      conn.query(
        `
          SELECT *
          FROM planificacions
          WHERE planificacions.asignaturas_id = '${id_asig}'
          AND planificacions.profesores_id IN (SELECT profesores.id 
          FROM profesores 
          WHERE profesores.tipo_de_clases_id = (SELECT id FROM tipo_de_clases WHERE tipo = '${tc}'))`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
  buscar_asig: (id_asig, conn) => {
    return new Promise((resolve, reject) => {
      conn.query(
        `
       SELECT asignaturas.secciones_id, asignaturas.nombre FROM asignaturas WHERE asignaturas.id ='${id_asig}'
      `,
        (err, resp) => {
          if (err) reject(err);

          resolve(resp);
        }
      );
    });
  },

  return_disp: ({ nombre }, tc, seccion, conn) => {
    let seccion_resul;
    let tipo_local;

    switch (nombre) {
      case "EF":
        tipo_local = "Deporte";
        break;
      default:
        switch (tc) {
          case "C":
            tipo_local = "Salon";
            break;
          case "CP":
            tipo_local = "Aula";
            break;
          default:
            tipo_local = "Laboratorio";
        }
    }
    return new Promise((resolve, reject) => {
      if (seccion === 1) {
        if (nombre === "EF")
          seccion_resul = validate_seccion(
            [5, 6],
            tipo_local,
            conn,
            reject,
            resolve
          );
        else
          seccion_resul = validate_seccion(
            [1, 2, 3],
            tipo_local,
            conn,
            reject,
            resolve
          );
      }

      if (seccion === 2) {
        if (nombre === "EF")
          seccion_resul = validate_seccion(
            [1, 2],
            tipo_local,
            conn,
            reject,
            resolve
          );
        else
          seccion_resul = validate_seccion(
            [4, 5, 6],
            tipo_local,
            conn,
            reject,
            resolve
          );
      }
    });
  },
};

module.exports = Helpers;
