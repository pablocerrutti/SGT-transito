/********************************************************
 SGT
 Sistema de Gestión de Tránsito
 Archivo principal
********************************************************/

function doGet(e) {

  return ContentService
    .createTextOutput("SGT API ONLINE")
    .setMimeType(ContentService.MimeType.TEXT);

}

function doPost(e) {

  try {

    const req = JSON.parse(e.postData.contents);

    const accion = req.accion || "";

    const datos = req.datos || {};

    switch (accion) {

      case "login":
        return json(login(datos));

      case "obtenerUsuarios":
        return json(obtenerUsuarios());

      case "guardarUsuario":
        return json(guardarUsuario(datos));

      case "eliminarUsuario":
        return json(eliminarUsuario(datos));

      case "obtenerElementos":
        return json(obtenerElementos());

      case "guardarElemento":
        return json(guardarElemento(datos));

      case "actualizarElemento":
        return json(actualizarElemento(datos));

      case "eliminarElemento":
        return json(eliminarElemento(datos));

      case "obtenerInspecciones":
        return json(obtenerInspecciones(datos));

      case "guardarInspeccion":
        return json(guardarInspeccion(datos));

      case "subirFoto":
        return json(subirFoto(datos));

      default:

        return json({

          ok: false,

          mensaje: "Acción inexistente"

        });

    }

  }

  catch (error) {

    return json({

      ok: false,

      mensaje: error.toString()

    });

  }

}

/************************************************/

function json(obj) {

  return ContentService

    .createTextOutput(

      JSON.stringify(obj)

    )

    .setMimeType(

      ContentService.MimeType.JSON

    );

}