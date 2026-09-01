/********************************************************
 * SGT - AUTORIZACION Y PRUEBA DE GOOGLE DRIVE
 ********************************************************/

const CARPETA_ACTUACIONES_ID_AUTORIZACION_ = "1MdujvY_US_TrcUi8PrEYy4YzjRsO9-PY";

function autorizarDrive() {
  const carpeta = DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_AUTORIZACION_);
  const prueba = carpeta.createFile(
    Utilities.newBlob(
      "SGT - prueba de escritura en Google Drive",
      "text/plain",
      "SGT_PRUEBA_AUTORIZACION.txt"
    )
  );

  const resultado = {
    ok: true,
    mensaje: "Google Drive autorizado y escritura verificada correctamente.",
    carpeta: carpeta.getName(),
    carpetaId: carpeta.getId(),
    archivoPrueba: prueba.getUrl()
  };

  console.log(resultado);

  // La prueba se elimina para no dejar archivos innecesarios.
  try {
    prueba.setTrashed(true);
  } catch (error) {
    console.warn("No se pudo eliminar el archivo de prueba: " + error.message);
  }

  return resultado;
}

function probarSubidaDrive() {
  const carpeta = DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_AUTORIZACION_);
  const archivo = carpeta.createFile(
    Utilities.newBlob(
      "PRUEBA SGT DRIVE",
      "text/plain",
      "PRUEBA_SGT_DRIVE.txt"
    )
  );

  console.log("ARCHIVO CREADO: " + archivo.getUrl());

  return {
    ok: true,
    id: archivo.getId(),
    nombre: archivo.getName(),
    url: archivo.getUrl()
  };
}
