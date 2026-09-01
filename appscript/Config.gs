/*******************************************************
 SGT
 CONFIGURACIÓN GENERAL
********************************************************/

const CONFIG = {
  NOMBRE_SISTEMA: "SGT",
  VERSION: "1.0",
  SHEET_ID: "1DX0h1qcETpRUL_dwiEq6k6i0VS43YLrfK3ei5YXTuwU",

  // Carpeta principal de actuaciones y archivos multimedia
  // Google Drive:
  // https://drive.google.com/drive/folders/1MdujvY_US_TrcUi8PrEYy4YzjRsO9-PY
  DRIVE_ID: "1MdujvY_US_TrcUi8PrEYy4YzjRsO9-PY"
};

function bd(){
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function carpetaFotos(){
  return DriveApp.getFolderById(CONFIG.DRIVE_ID);
}

function generarID(prefijo){
  return prefijo + "-" + new Date().getTime();
}

function fecha(){
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm:ss"
  );
}

//======================================================
// AUTORIZACIÓN / DIAGNÓSTICO DE DRIVE
//======================================================

function autorizarDriveSGT(){
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_ID);
  const nombre = folder.getName();
  Logger.log("Drive SGT autorizado correctamente. Carpeta: " + nombre);
  return "OK - Drive autorizado. Carpeta: " + nombre;
}

function verificarDriveSGT(){
  try{
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_ID);
    return {
      ok:true,
      id:folder.getId(),
      nombre:folder.getName(),
      mensaje:"Acceso a Drive funcionando correctamente."
    };
  }catch(error){
    return {
      ok:false,
      mensaje:"No hay autorización/acceso a la carpeta de Drive: " + (error.message || error)
    };
  }
}
