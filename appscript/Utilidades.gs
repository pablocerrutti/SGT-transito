/********************************************************
 SGT
 FUNCIONES GENERALES
********************************************************/

function bd() {

  return SpreadsheetApp.openById(CONFIG.SHEET_ID);

}

/************************************************/

function hoja(nombre) {

  return bd().getSheetByName(nombre);

}

/************************************************/

function carpetaPrincipal() {

  return DriveApp.getFolderById(CONFIG.DRIVE_ID);

}

/************************************************/

function ahora() {

  return Utilities.formatDate(

    new Date(),

    Session.getScriptTimeZone(),

    "yyyy-MM-dd HH:mm:ss"

  );

}

/************************************************/

function generarID(prefijo) {

  return prefijo +

         Utilities.formatDate(

           new Date(),

           Session.getScriptTimeZone(),

           "yyyyMMddHHmmss"

         ) +

         "-" +

         Math.floor(Math.random()*900+100);

}

/************************************************/

function ok(datos) {

  return {

    ok:true,

    datos:datos

  };

}

/************************************************/

function error(mensaje) {

  return {

    ok:false,

    mensaje:mensaje

  };

}

/************************************************/

function buscarFila(hoja,id){

  const datos=hoja.getDataRange().getValues();

  for(let i=1;i<datos.length;i++){

      if(String(datos[i][0])===String(id)){

          return i+1;

      }

  }

  return -1;

}

/************************************************/
// PERMISOS CENTRALES
// Supervisor Movilidad es exclusivamente de consulta
// en el mapa y no puede ejecutar mutaciones.
/************************************************/

function rolNormalizadoUtil_(valor){
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .trim();
}

function esSupervisorMovilidad_(valor){
  return rolNormalizadoUtil_(valor) === 'supervisor movilidad';
}

function bloquearMutacionSupervisorMovilidad_(e, mensaje){
  const p = (e && e.parameter) || {};
  if(esSupervisorMovilidad_(p.rol)){
    return {
      ok:false,
      codigo:'PERMISO_DENEGADO',
      mensaje:mensaje || 'El rol Supervisor Movilidad solo tiene permisos de consulta y generación de informes.'
    };
  }
  return null;
}
