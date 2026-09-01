/*******************************************************
 SGT
 CONFIGURACIÓN GENERAL
********************************************************/

const CONFIG = {
  NOMBRE_SISTEMA: "SGT",
  VERSION: "1.0",
  SHEET_ID: "1DX0h1qcETpRUL_dwiEq6k6i0VS43YLrfK3ei5YXTuwU",
  DRIVE_ID: "1sUXE34S_Vnt2c55HmkB3M9l18tPXfZJP"
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
// Ejecutar MANUALMENTE una vez desde Apps Script con la cuenta
// propietaria/autorizada del Web App. Esto fuerza la solicitud de
// permisos de Drive antes de utilizar el Web App.
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
