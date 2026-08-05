/********************************************************
 SGT
 Sistema de Gestión de Tránsito
********************************************************/

function doGet(e) {

  const accion = e.parameter.accion || "";

  switch (accion) {

    //=========================
    // LOGIN
    //=========================

    case "login":
      return json(login(e));

    //=========================
    // USUARIOS
    //=========================

    case "obtenerUsuarios":
      return json(obtenerUsuarios());

    case "guardarUsuario":
      return json(guardarUsuario(e));

    case "eliminarUsuario":
      return json(eliminarUsuario(e));

    //=========================
    // ELEMENTOS
    //=========================

    case "obtenerElementos":
      return json(obtenerElementos());

    case "guardarElemento":
      return json(guardarElemento(e));

    case "actualizarElemento":
      return json(actualizarElemento(e));

    case "eliminarElemento":
      return json(eliminarElemento(e));

    //=========================
    // INSPECCIONES
    //=========================

    case "obtenerInspecciones":
      return json(obtenerInspecciones(e));

    case "guardarInspeccion":
      return json(guardarInspeccion(e));

    case "subirArchivo":
      return json(subirArchivo(e));

    //=========================
    // FOTOS
    //=========================

    default:

      return json({

        ok: false,
        mensaje: "Acción inválida: " + accion

      });

  }

}

function doPost(e) {

  return doGet(e);

}

function json(obj) {

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

}
