/********************************************************
 SGT
 FUNCIONES GENERALES
********************************************************/

function bd() { return SpreadsheetApp.openById(CONFIG.SHEET_ID); }
function hoja(nombre) { return bd().getSheetByName(nombre); }
function carpetaPrincipal() { return DriveApp.getFolderById(CONFIG.DRIVE_ID); }
function ahora() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"); }
function generarID(prefijo) { return prefijo + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMddHHmmss") + "-" + Math.floor(Math.random()*900+100); }
function ok(datos) { return {ok:true,datos:datos}; }
function error(mensaje) { return {ok:false,mensaje:mensaje}; }
function buscarFila(hoja,id){ const datos=hoja.getDataRange().getValues(); for(let i=1;i<datos.length;i++){ if(String(datos[i][0])===String(id)) return i+1; } return -1; }

/************************************************/
// PERMISOS CENTRALES
// Supervisor Movilidad y Consulta Movilidad son
// exclusivamente de consulta en el mapa.
/************************************************/
function rolNormalizadoUtil_(valor){
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}
function esSupervisorMovilidad_(valor){ return rolNormalizadoUtil_(valor) === 'supervisor movilidad'; }
function esConsultaMovilidad_(valor){ return rolNormalizadoUtil_(valor) === 'consulta movilidad'; }
function esRolMapaSoloConsulta_(valor){ return esSupervisorMovilidad_(valor) || esConsultaMovilidad_(valor); }
function bloquearMutacionSupervisorMovilidad_(e, mensaje){
  const p=(e&&e.parameter)||{};
  if(esRolMapaSoloConsulta_(p.rol)){
    return {ok:false,codigo:'PERMISO_DENEGADO',mensaje:mensaje || 'Este rol solo tiene permisos de consulta y generación de informes. No puede modificar ni eliminar elementos.'};
  }
  return null;
}
