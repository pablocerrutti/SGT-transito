/********************************************************
 SGT
 ELEMENTOS
********************************************************/

function obtenerElementos() {

  const sh = hoja("Elementos");

  const datos = sh.getDataRange().getValues();

  if (datos.length <= 1) {

    return ok([]);

  }

  const lista = [];

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

  return ok(lista);

}

/************************************************/

function guardarElemento(d) {

  const sh = hoja("Elementos");

  const id = generarID("EL");

  sh.appendRow([

    id,
    d.codigo,
    d.tipo,
    d.serie,
    d.nombre,
    d.descripcion,
    d.latitud,
    d.longitud,
    d.direccion,
    d.estado,
    d.caracteristicas,
    ahora(),
    "admin",
    "",
    "",
    "SI"

  ]);

  return {

    ok: true,

    id: id,

    mensaje: "Elemento guardado correctamente."

  };

}

/************************************************/

function actualizarElemento(d) {

  const sh = hoja("Elementos");

  const fila = buscarFila(sh, d.id);

  if (fila == -1) {

    return error("Elemento no encontrado");

  }

  sh.getRange(fila,2).setValue(d.codigo);
  sh.getRange(fila,3).setValue(d.tipo);
  sh.getRange(fila,4).setValue(d.serie);
  sh.getRange(fila,5).setValue(d.nombre);
  sh.getRange(fila,6).setValue(d.descripcion);
  sh.getRange(fila,7).setValue(d.latitud);
  sh.getRange(fila,8).setValue(d.longitud);
  sh.getRange(fila,9).setValue(d.direccion);
  sh.getRange(fila,10).setValue(d.estado);
  sh.getRange(fila,11).setValue(d.caracteristicas);
  sh.getRange(fila,14).setValue(ahora());
  sh.getRange(fila,15).setValue("admin");

  return ok("Actualizado");

}

/************************************************/

function eliminarElemento(d) {

  const sh = hoja("Elementos");

  const fila = buscarFila(sh, d.id);

  if (fila == -1) {

    return error("Elemento no encontrado");

  }

  sh.deleteRow(fila);

  return ok("Eliminado");

}