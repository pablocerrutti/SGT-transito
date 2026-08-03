/********************************************************
 SGT
 ELEMENTOS
********************************************************/

//======================================================
// OBTENER ELEMENTOS
//======================================================

function obtenerElementos() {

  const sh = hoja("Elementos");
  const datos = sh.getDataRange().getValues();

  let lista = [];

  for (let i = 1; i < datos.length; i++) {

    lista.push({

      id: datos[i][0],
      codigo: datos[i][1],
      tipo: datos[i][2],
      serie: datos[i][3],
      nombre: datos[i][4],
      descripcion: datos[i][5],
      latitud: datos[i][6],
      longitud: datos[i][7],
      direccion: datos[i][8],
      estado: datos[i][9],
      caracteristicas: datos[i][10],
      fechaAlta: datos[i][11],
      usuarioAlta: datos[i][12],
      fechaModificacion: datos[i][13],
      usuarioModificacion: datos[i][14],
      activo: datos[i][15]

    });

  }

  return {

    ok: true,

    datos: lista

  };

}

//======================================================
// GUARDAR
//======================================================

function guardarElemento(e) {

  const sh = hoja("Elementos");

  const id = generarID("EL");

  sh.appendRow([

    id,
    e.parameter.codigo,
    e.parameter.tipo,
    e.parameter.serie,
    e.parameter.nombre,
    e.parameter.descripcion,
    e.parameter.latitud,
    e.parameter.longitud,
    e.parameter.direccion,
    e.parameter.estado,
    e.parameter.caracteristicas,
    ahora(),
    "admin",
    "",
    "",
    "SI"

  ]);

  return {

    ok: true,

    mensaje: "Elemento guardado correctamente."

  };

}

//======================================================
// ACTUALIZAR
//======================================================

function actualizarElemento(e) {

  const sh = hoja("Elementos");

  const fila = buscarFila(sh, e.parameter.id);

  if (fila == -1) {

    return {

      ok: false,

      mensaje: "Elemento no encontrado."

    };

  }

  sh.getRange(fila,2).setValue(e.parameter.codigo);
  sh.getRange(fila,3).setValue(e.parameter.tipo);
  sh.getRange(fila,4).setValue(e.parameter.serie);
  sh.getRange(fila,5).setValue(e.parameter.nombre);
  sh.getRange(fila,6).setValue(e.parameter.descripcion);
  sh.getRange(fila,7).setValue(e.parameter.latitud);
  sh.getRange(fila,8).setValue(e.parameter.longitud);
  sh.getRange(fila,9).setValue(e.parameter.direccion);
  sh.getRange(fila,10).setValue(e.parameter.estado);
  sh.getRange(fila,11).setValue(e.parameter.caracteristicas);
  sh.getRange(fila,14).setValue(ahora());
  sh.getRange(fila,15).setValue("admin");

  return {

    ok: true,

    mensaje: "Elemento actualizado."

  };

}

//======================================================
// ELIMINAR
//======================================================

function eliminarElemento(e) {

  const sh = hoja("Elementos");

  const fila = buscarFila(sh, e.parameter.id);

  if (fila == -1) {

    return {

      ok: false,

      mensaje: "Elemento no encontrado."

    };

  }

  sh.deleteRow(fila);

  return {

    ok: true,

    mensaje: "Elemento eliminado."

  };

}
