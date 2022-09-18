//Crea el String para pasarselo a la consulta de conseguir las disponibilidades
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

//Chequea si hay disponibilidad
function check(disp_lib_unwraped, dip) {
  let boo = true;

  disp_lib_unwraped.forEach((el) => {
    if (el.id == dip.id) {
      boo = false;
    }
  });

  return boo;
}

function bouth_checks(conn, dia, turno, grupos_id, profesores_id = -1) {
  return new Promise((resolve, reject) => {
    conn.query(
      `
      SELECT disponibilidad.id
                            FROM disponibilidad
                            WHERE disponibilidad.dia = '${dia}'
                            AND disponibilidad.turno = '${turno}'
                            AND disponibilidad.id IN (SELECT asignaciones.disponibilidad_id
                                                            FROM asignaciones
                                                            WHERE planificacion_id IN (SELECT planificacions.id
                                                                                FROM planificacions 
                                                                                WHERE planificacions.
                                                                                ${
                                                                                  profesores_id ==
                                                                                  -1
                                                                                    ? `grupos_id`
                                                                                    : `profesores_id`
                                                                                } = '${
        profesores_id == -1 ? grupos_id : profesores_id
      }'))`,
      (err, rows) => {
        if (err) reject(err);

        resolve(rows);
      }
    );
  });
}

//Funcion para obtener un tipo de local a partir del nombre y el TC
function tipo_asignaciones_func(nombre, tc) {
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

  return tipo_local;
}

//Consulta que consigue las disponibilidades
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

class Helpers {
  check_bc_isGenenated(tc, id_asig, conn) {
    return new Promise((resolve, reject) => {
      conn.query(
        `
      SELECT id 
      FROM planificacions
      WHERE asignaturas_id = ${id_asig}
      AND profesores_id = (SELECT id 
                          FROM profesores
                            WHERE tipo_de_clases_id = (SELECT id 
                                                      FROM tipo_de_clases 
                                                      WHERE tipo = '${tc}'))`,
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  exist(anno, semana, isGenBc, conn) {
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT * FROM asignaciones WHERE anno=${anno} AND semana=${semana} AND planificacion_id IN ${
          isGenBc.length === 1
            ? `('${isGenBc[0].id}')`
            : string_literal(isGenBc.map((el) => el.id))
        } `,
        (err, resp) => {
          if (err) reject(err);

          resolve(resp);
        }
      );
    });
  }
  //Devuelve las planificaciones
  return_planif(tc, id_asig, conn) {
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
  }
  //Busca asignaturas segun un id de asignatura
  buscar_asig(id_asig, conn) {
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
  }

  //Devuelve las disponibilidades de los asignaciones
  return_disp({ nombre }, tc, seccion, conn) {
    return new Promise((resolve, reject) => {
      if (seccion === 1) {
        if (nombre === "EF")
          validate_seccion(
            [5, 6],
            tipo_asignaciones_func(nombre, tc),
            conn,
            reject,
            resolve
          );
        else
          validate_seccion(
            [1, 2, 3],
            tipo_asignaciones_func(nombre, tc),
            conn,
            reject,
            resolve
          );
      }

      if (seccion === 2) {
        if (nombre === "EF")
          validate_seccion(
            [1, 2],
            tipo_asignaciones_func(nombre, tc),
            conn,
            reject,
            resolve
          );
        else
          validate_seccion(
            [4, 5, 6],
            tipo_asignaciones_func(nombre, tc),
            conn,
            reject,
            resolve
          );
      }
    });
  }

  disponibilidades_libres({ nombre }, tc, dip, conn) {
    return new Promise((resolve, reject) => {
      conn.query(
        `
          SELECT disponibilidad.id
          FROM disponibilidad
          WHERE disponibilidad.id NOT IN (SELECT asignaciones.disponibilidad_id
                                              FROM asignaciones)
                                              AND disponibilidad.locales_id IN (SELECT locales.id
                                                                                  FROM locales
                                                                                  WHERE locales.tipo_de_locales_id = (SELECT id FROM tipo_de_locales WHERE tipo = '${tipo_asignaciones_func(
                                                                                    nombre,
                                                                                    tc
                                                                                  )}'))`,
        (err, rows) => {
          if (err) reject(err);

          resolve(rows);
        }
      );
    });
  }
  ocupada(disp_libre, dip, id_pl, conn) {
    if (disp_libre.length > 0) {
      return check(disp_libre, dip);
    } else {
      return new Promise((resolve, reject) => {
        conn.query(
          `
          SELECT planificacions.asignaturas_id, planificacions.profesores_id
          FROM planificacions
          WHERE planificacions.id = '${id_pl}'`,
          (err, rows) => {
            if (err) reject(err);

            return Promise.all(
              rows.map((el) => {
                conn.query(
                  `
                    SELECT asignaciones.disponibilidad_id
                    FROM asignaciones
                    WHERE asignaciones.planificacion_id IN(SELECT planificacions.id
                                                  FROM planificacions
                                                  WHERE planificacions.asignaturas_id = '${el.asigaturas_idt}'
                                                  AND planificacions.profesores_id = '${el.profesores_id}')
                                                  GROUP BY asignaciones.disponibilidad_id
                                                  ORDER BY COUNT(asignaciones.disponibilidad_id)
                                                  LIMIT 1`,
                  (err, rows) => {
                    if (err) reject(err);

                    return Promise.all(
                      rows.map((el) => {
                        if (el.disponibilidad_id == dip.id) return false;
                        else return true;
                      })
                    );
                  }
                );
              })
            );
          }
        );
      });
    }
  }
  check_turno(grupos_id, asignaturas_id, conn) {
    return new Promise((resolve, reject) => {
      conn.query(
        `
        SELECT disponibilidad.dia
        FROM disponibilidad
        WHERE disponibilidad.id IN (SELECT asignaciones.disponibilidad_id
                                        FROM asignaciones
                                        WHERE planificacion_id IN (SELECT planificacions.id
                                                            FROM planificacions
                                                            WHERE planificacions.asignaturas_id = '${asignaturas_id}'
                                                            AND planificacions.grupos_id = '${grupos_id}'))
                                                            ORDER BY disponibilidad.dia DESC
                                                            LIMIT 1`,
        (err, rows) => {
          if (err) reject(err);

          resolve(rows);
        }
      );
    });
  }
  async check(
    { asignaturas_id, profesores_id, grupos_id },
    { dia, turno },
    conn
  ) {
    const check_turnos = Object.values(
      JSON.parse(
        JSON.stringify(await this.check_turno(grupos_id, asignaturas_id, conn))
      )
    );

    const check_grupo = Object.values(
      JSON.parse(
        JSON.stringify(await bouth_checks(conn, dia, turno, grupos_id))
      )
    );
    const check_prof = Object.values(
      JSON.parse(
        JSON.stringify(await bouth_checks(conn, dia, turno, profesores_id))
      )
    );

    let value;

    if (check_turnos == 1) value = 1;
    else value = dia - check_turnos.dia;

    if (value <= 0 || check_grupo.length > 0 || check_prof.length > 0)
      return true;
    else return false;
  }
  relacionar(id_planif, id_disp, anno, semana, conn) {
    return new Promise(() => {
      conn.query(
        `
        INSERT INTO asignaciones (disponibilidad_id, planificacion_id, anno, semana)
        VALUES ('${id_disp}', '${id_planif}', '${anno}','${semana}')`
      );
    });
  }
}

module.exports = new Helpers();
