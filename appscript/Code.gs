function doGet(e) {

  const accion = e.parameter.accion || "";

  switch (accion) {

    case "login":
      return json(login(e));

    case "obtenerUsuarios":
      return json(obtenerUsuarios());

    case "obtenerElementos":
      return json(obtenerElementos());

    default:
      return json({
        ok:false,
        mensaje:"Acción inválida"
      });

  }

}

function doPost(e){

  return doGet(e);

}

function json(obj){

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

}
