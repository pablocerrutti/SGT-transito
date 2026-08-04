// SGT - Cliente de la API de Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec';
async function api(accion, datos = {}) {
  const params = new URLSearchParams({accion});
  Object.keys(datos).forEach(function(clave) { const valor = datos[clave]; if (valor !== undefined && valor !== null && valor !== '') params.set(clave, String(valor)); });
  try {
    const respuesta = await fetch(API_URL + '?' + params.toString(), {method:'GET',cache:'no-store',redirect:'follow'});
    if (!respuesta.ok) return {ok:false,mensaje:'La API respondió con error ' + respuesta.status + '.'};
    const texto = await respuesta.text();
    try { return JSON.parse(texto); } catch (_) { return {ok:false,mensaje:'La API devolvió una respuesta no válida. Verifique la implementación de Apps Script.'}; }
  } catch (error) { return {ok:false,mensaje:'No se pudo conectar con la API: ' + error.message}; }
}
async function apiLogin(usuario,password){ return api('login',{usuario,password}); }
async function apiObtenerUsuarios(){ return api('obtenerUsuarios'); }
async function apiGuardarUsuario(usuario){ return api('guardarUsuario',usuario); }
async function apiEliminarUsuario(id){ return api('eliminarUsuario',{id}); }
async function apiObtenerElementos(){ return api('obtenerElementos'); }
async function apiGuardarElemento(elemento){ return api('guardarElemento',elemento); }
async function apiActualizarElemento(elemento){ return api('actualizarElemento',elemento); }
async function apiEliminarElemento(id){ return api('eliminarElemento',{id}); }
async function apiObtenerInspecciones(idElemento){ return api('obtenerInspecciones',{id:idElemento}); }
async function apiGuardarInspeccion(datos){ return api('guardarInspeccion',datos); }
async function apiSubirFoto(datos){ return api('subirFoto',datos); }
