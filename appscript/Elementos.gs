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

      id: String(datos[i][0]),
      codigo: String(datos[i][1]),
      tipo: String(datos[i][2]),
      serie: String(datos[i][3]),
      nombre: String(datos[i][4]),
      descripcion: String(datos[i][5]),

      latitud: String(datos[i][6]),

      longitud: String(datos[i][7]),

      direccion: String(datos[i][8]),
      estado: String(datos[i][9]),
      caracteristicas: String(datos[i][10]),
      fechaAlta: String(datos[i][11]),
      usuarioAlta: String(datos[i][12]),
      fechaModificacion: String(datos[i][13]),
      usuarioModificacion: String(datos[i][14]),
      activo: String(datos[i][15])

    });

  }

  return {

    ok: true,

    datos: lista

  };

}

//======================================================
// GUARDAR ELEMENTO
//======================================================

function guardarElemento(e) {

  const sh = hoja("Elementos");

  const id = generarID("EL");

  const latitud = String(e.parameter.latitud || "").replace(",", ".");
  const longitud = String(e.parameter.longitud || "").replace(",", ".");

  sh.appendRow([

    id,
    e.parameter.codigo || "",
    e.parameter.tipo || "",
    e.parameter.serie || "",
    e.parameter.nombre || "",
    e.parameter.descripcion || "",

    latitud,

    longitud,

    e.parameter.direccion || "",
    e.parameter.estado || "",
    e.parameter.caracteristicas || "",
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
// ACTUALIZAR ELEMENTO
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

  sh.getRange(fila,2).setValue(e.parameter.codigo || "");
  sh.getRange(fila,3).setValue(e.parameter.tipo || "");
  sh.getRange(fila,4).setValue(e.parameter.serie || "");
  sh.getRange(fila,5).setValue(e.parameter.nombre || "");
  sh.getRange(fila,6).setValue(e.parameter.descripcion || "");

  sh.getRange(fila,7).setValue(
    String(e.parameter.latitud || "").replace(",", ".")
  );

  sh.getRange(fila,8).setValue(
    String(e.parameter.longitud || "").replace(",", ".")
  );

  sh.getRange(fila,9).setValue(e.parameter.direccion || "");
  sh.getRange(fila,10).setValue(e.parameter.estado || "");
  sh.getRange(fila,11).setValue(e.parameter.caracteristicas || "");
  sh.getRange(fila,14).setValue(ahora());
  sh.getRange(fila,15).setValue("admin");

  return {

    ok: true,

    mensaje: "Elemento actualizado."

  };

}

//======================================================
// ELIMINAR ELEMENTO
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
