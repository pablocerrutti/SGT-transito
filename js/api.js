// =====================================================
// SGT - Cliente de la API de Google Apps Script
// =====================================================
const API_URL='https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec';
async function api(accion,datos={}){const params=new URLSearchParams({accion});Object.keys(datos).forEach(function(clave){const valor=datos[clave];if(valor!==undefined&&valor!==null&&valor!=='')params.set(clave,String(valor));});try{const respuesta=await fetch(API_URL+'?'+params.toString(),{method:'GET',cache:'no-store',redirect:'follow'});if(!respuesta.ok)return{ok:false,mensaje:'La API respondió con error '+respuesta.status+'.'};const texto=await respuesta.text();let resultado;try{resultado=JSON.parse(texto);}catch(_){return{ok:false,mensaje:'La API devolvió una respuesta no válida. Verifique la implementación de Apps Script.'};}if(resultado&&resultado.ok&&['login','logout','guardarUsuario','eliminarUsuario','guardarElemento','actualizarElemento','eliminarElemento','guardarZonaEstacionamiento','eliminarZonaEstacionamiento','guardarCordonRojo','eliminarCordonRojo','guardarInspeccion'].includes(accion)){const sesion=accion==='login'?resultado.usuario:(JSON.parse(localStorage.getItem('usuarioActual')||'null')||{});registrarAuditoriaCliente_(accion,datos,sesion,resultado);}return resultado;}catch(error){return{ok:false,mensaje:'No se pudo conectar con la API: '+error.message};}}
async function registrarAuditoriaCliente_(accion,datos,sesion,respuesta){try{const mapa={login:'Inicio de sesión',logout:'Cierre de sesión',guardarUsuario:'Creación de usuario',eliminarUsuario:'Eliminación de usuario',guardarElemento:'Creación de elemento en mapa',actualizarElemento:'Modificación de elemento en mapa',eliminarElemento:'Remoción de elemento del mapa',guardarZonaEstacionamiento:'Creación de zona de estacionamiento',eliminarZonaEstacionamiento:'Remoción de zona de estacionamiento',guardarCordonRojo:'Creación de cordón rojo',eliminarCordonRojo:'Remoción de cordón rojo',guardarInspeccion:'Creación de actuación / informe PDF'};const usuario=sesion||{};const detalle=accion==='login'?'Ingreso al sistema':accion==='logout'?'Salida del sistema':JSON.stringify(datos).slice(0,1500);const p=new URLSearchParams({accion:'registrarAuditoria',usuario:String(usuario.usuario||datos.usuario||''),nombre:String(usuario.nombre||datos.nombre||datos.inspector||''),rol:String(usuario.rol||datos.rol||''),accionRealizada:mapa[accion]||accion,modulo:moduloAuditoria_(accion),detalle:detalle,referencia:String(respuesta.id||respuesta.codigo||respuesta.numeroSerie||datos.id||datos.elementoId||'')});await fetch(API_URL+'?'+p.toString(),{method:'GET',cache:'no-store'});}catch(_){}}
function moduloAuditoria_(accion){if(accion.includes('Usuario'))return'Usuarios';if(accion.includes('Elemento')||accion.includes('Zona')||accion.includes('Cordon'))return'Movilidad';if(accion.includes('Inspeccion'))return'Fiscalización / Movilidad';if(accion==='login'||accion==='logout')return'Acceso';return'Sistema';}
async function apiLogin(usuario,password){return api('login',{usuario,password});}
async function apiLogout(){const sesion=JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};return api('logout',{usuario:sesion.usuario||'',nombre:sesion.nombre||'',rol:sesion.rol||''});}
async function apiObtenerUsuarios(){return api('obtenerUsuarios');}
async function apiGuardarUsuario(usuario){return api('guardarUsuario',usuario);}
async function apiEliminarUsuario(id){return api('eliminarUsuario',{id});}
async function apiObtenerElementos(){return api('obtenerElementos');}
async function apiGuardarElemento(elemento){return api('guardarElemento',elemento);}
async function apiActualizarElemento(elemento){return api('actualizarElemento',elemento);}
async function apiEliminarElemento(id){return api('eliminarElemento',{id});}
async function apiObtenerCategorias(){return api('obtenerCategorias');}
async function apiObtenerLocalidades(){return api('obtenerLocalidades');}
async function apiObtenerInspecciones(idElemento){return api('obtenerInspecciones',{id:idElemento});}
async function apiGuardarInspeccion(datos){return api('guardarInspeccion',datos);}
async function apiSubirFoto(datos){return api('subirFoto',datos);}
async function apiSubirArchivo(archivo){const params=new URLSearchParams({accion:'subirArchivo'});Object.keys(archivo).forEach(function(k){if(archivo[k]!==undefined&&archivo[k]!==null)params.set(k,archivo[k]);});try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:params.toString()});return JSON.parse(await r.text());}catch(error){return{ok:false,mensaje:'No fue posible cargar el archivo: '+error.message};}}
async function apiObtenerZonasEstacionamiento(){return api('obtenerZonasEstacionamiento');}
async function apiGuardarZonaEstacionamiento(zona){return api('guardarZonaEstacionamiento',zona);}
async function apiEliminarZonaEstacionamiento(id){return api('eliminarZonaEstacionamiento',{id});}
async function apiObtenerCordonesRojos(){return api('obtenerCordonesRojos');}
async function apiGuardarCordonRojo(cordon){return api('guardarCordonRojo',cordon);}
async function apiEliminarCordonRojo(id){return api('eliminarCordonRojo',{id});}
async function apiObtenerCatalogoElementosInformables(){return api('obtenerCatalogoElementosInformables');}
async function apiObtenerAuditoria(){return api('obtenerAuditoria');}
async function apiObtenerInformesAuditoria(){return api('obtenerInformesAuditoria');}
async function apiRegistrarAuditoria(datos){return api('registrarAuditoria',datos);}
async function apiGenerarPdfAuditoria(usuarioFiltro='',rolFiltro='',nombreFiltro=''){return api('registrarAuditoria',{generarPdfAuditoria:'1',usuarioFiltro,rolFiltro,nombreFiltro});}
