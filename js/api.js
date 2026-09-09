// =====================================================
// SGT - Cliente de la API de Google Apps Script
// =====================================================
const API_URL='https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec';
function sesionApi_(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};}catch(_){return {};}}
function rolSesionApi_(){return String(sesionApi_().rol||'');}
async function api(accion,datos={}){const params=new URLSearchParams({accion});Object.keys(datos).forEach(function(clave){const valor=datos[clave];if(valor!==undefined&&valor!==null&&valor!=='')params.set(clave,String(valor));});try{const respuesta=await fetch(API_URL+'?'+params.toString(),{method:'GET',cache:'no-store',redirect:'follow'});if(!respuesta.ok)return{ok:false,mensaje:'La API respondió con error '+respuesta.status+'.'};const texto=await respuesta.text();let resultado;try{resultado=JSON.parse(texto);}catch(_){return{ok:false,mensaje:'La API devolvió una respuesta no válida. Verifique la implementación de Apps Script.'};}if(resultado&&resultado.ok&&['login','guardarUsuario','actualizarUsuario','eliminarUsuario','guardarElemento','actualizarElemento','eliminarElemento','guardarZonaEstacionamiento','eliminarZonaEstacionamiento','guardarCordonRojo','eliminarCordonRojo','guardarInspeccion'].includes(accion)){const sesion=accion==='login'?resultado.usuario:sesionApi_();registrarAuditoriaCliente_(accion,datos,sesion,resultado);}return resultado;}catch(error){return{ok:false,mensaje:'No se pudo conectar con la API: '+error.message};}}
async function registrarAuditoriaCliente_(accion,datos,sesion,respuesta){try{const mapa={login:'Inicio de sesión',logout:'Cierre de sesión',guardarUsuario:'Creación de usuario',actualizarUsuario:'Modificación de usuario y permisos',eliminarUsuario:'Eliminación de usuario',guardarElemento:'Creación de elemento en mapa',actualizarElemento:'Modificación de elemento en mapa',eliminarElemento:'Remoción de elemento del mapa',guardarZonaEstacionamiento:'Creación de zona de estacionamiento',eliminarZonaEstacionamiento:'Remoción de zona de estacionamiento',guardarCordonRojo:'Creación de cordón rojo',eliminarCordonRojo:'Remoción de cordón rojo',guardarInspeccion:'Creación de actuación / informe PDF'};const usuario=sesion||{};const detalle=accion==='login'?'Ingreso al sistema':accion==='logout'?'Salida del sistema':JSON.stringify(datos).slice(0,1500);const p=new URLSearchParams({accion:'registrarAuditoria',usuario:String(usuario.usuario||datos.usuario||''),nombre:String(usuario.nombre||datos.nombre||datos.inspector||''),rol:String(usuario.rol||datos.rol||''),accionRealizada:mapa[accion]||accion,modulo:moduloAuditoria_(accion),detalle:detalle,referencia:String(respuesta.id||respuesta.codigo||respuesta.numeroSerie||datos.id||datos.elementoId||'')});await fetch(API_URL+'?'+p.toString(),{method:'GET',cache:'no-store'});}catch(_){}}
function moduloAuditoria_(accion){if(accion.includes('Usuario'))return'Usuarios';if(accion.includes('Elemento')||accion.includes('Zona')||accion.includes('Cordon'))return'Movilidad';if(accion.includes('Inspeccion'))return'Fiscalización / Movilidad';if(accion==='login'||accion==='logout')return'Acceso';return'Sistema';}
async function apiLogin(usuario,password){return api('login',{usuario,password});}
async function apiLogout(){const sesion=sesionApi_();return registrarAuditoriaCliente_('logout',{},sesion,{}).then(function(){return{ok:true};});}
async function apiObtenerUsuarios(){const s=sesionApi_();return api('obtenerUsuarios',{actorUsuario:s.usuario||'',actorRol:s.rol||''});}
async function apiGuardarUsuario(usuario){const s=sesionApi_();return api('guardarUsuario',Object.assign({},usuario,{actorUsuario:s.usuario||'',actorRol:s.rol||''}));}
async function apiActualizarUsuario(usuario){const s=sesionApi_();return api('actualizarUsuario',Object.assign({},usuario,{actorUsuario:s.usuario||'',actorRol:s.rol||''}));}
async function apiEliminarUsuario(id){const s=sesionApi_();return api('eliminarUsuario',{id,actorUsuario:s.usuario||'',actorRol:s.rol||''});}
async function apiObtenerElementos(){return api('obtenerElementos');}
function actorDatos_(datos){const s=sesionApi_();return Object.assign({},datos,{rol:datos&&datos.rol||s.rol||'',actorUsuario:s.usuario||'',actorRol:s.rol||''});}
async function apiGuardarElemento(elemento){return api('guardarElemento',actorDatos_(elemento));}
async function apiActualizarElemento(elemento){return api('actualizarElemento',actorDatos_(elemento));}
async function apiEliminarElemento(id){return api('eliminarElemento',actorDatos_({id:id}));}
async function apiObtenerCategorias(){return api('obtenerCategorias');}
async function apiObtenerLocalidades(){return api('obtenerLocalidades');}
async function apiObtenerInspecciones(idElemento){return api('obtenerInspecciones',{id:idElemento});}
async function apiGuardarInspeccion(datos){return api('guardarInspeccion',actorDatos_(Object.assign({},datos,{rol:datos.rol||rolSesionApi_()})));}
async function apiGenerarPdfActuacionExistente(id){return api('generarPdfActuacionExistente',{id:id});}
async function apiSubirFoto(datos){return api('subirFoto',datos);}
async function apiSubirArchivo(archivo){const params=new URLSearchParams({accion:'subirArchivo'});Object.keys(archivo).forEach(function(k){if(archivo[k]!==undefined&&archivo[k]!==null)params.set(k,archivo[k]);});try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:params.toString()});return JSON.parse(await r.text());}catch(error){return{ok:false,mensaje:'No fue posible cargar el archivo: '+error.message};}}
async function apiObtenerZonasEstacionamiento(){return api('obtenerZonasEstacionamiento');}
async function apiGuardarZonaEstacionamiento(zona){return api('guardarZonaEstacionamiento',actorDatos_(zona));}
async function apiEliminarZonaEstacionamiento(id){return api('eliminarZonaEstacionamiento',actorDatos_({id:id}));}
async function apiObtenerCordonesRojos(){return api('obtenerCordonesRojos');}
async function apiGuardarCordonRojo(cordon){return api('guardarCordonRojo',actorDatos_(cordon));}
async function apiEliminarCordonRojo(id){return api('eliminarCordonRojo',actorDatos_({id:id}));}
async function apiObtenerCatalogoElementosInformables(){return api('obtenerCatalogoElementosInformables');}
async function apiObtenerAuditoria(){return api('obtenerAuditoria');}
async function apiObtenerInformesAuditoria(){return api('obtenerInformesAuditoria');}
async function apiRegistrarAuditoria(datos){return api('registrarAuditoria',datos);}
async function apiGenerarPdfAuditoria(usuarioFiltro='',rolFiltro='',nombreFiltro=''){return api('registrarAuditoria',{generarPdfAuditoria:'1',usuarioFiltro,rolFiltro,nombreFiltro});}
