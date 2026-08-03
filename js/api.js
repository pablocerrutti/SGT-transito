//======================================================
// SGT API
//======================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";

//======================================================

async function api(accion, datos = {}) {

    const respuesta = await fetch(API_URL, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            accion,

            datos

        })

    });

    return await respuesta.json();

}

//======================================================
// LOGIN
//======================================================

async function apiLogin(usuario,password){

    return await api("login",{

        usuario,

        password

    });

}

//======================================================
// USUARIOS
//======================================================

async function apiObtenerUsuarios(){

    return await api("obtenerUsuarios");

}

async function apiGuardarUsuario(usuario){

    return await api("guardarUsuario",usuario);

}

async function apiEliminarUsuario(id){

    return await api("eliminarUsuario",{id});

}

//======================================================
// ELEMENTOS
//======================================================

async function apiObtenerElementos(){

    return await api("obtenerElementos");

}

async function apiGuardarElemento(elemento){

    return await api("guardarElemento",elemento);

}

async function apiActualizarElemento(elemento){

    return await api("actualizarElemento",elemento);

}

async function apiEliminarElemento(id){

    return await api("eliminarElemento",{id});

}

//======================================================
// INSPECCIONES
//======================================================

async function apiObtenerInspecciones(id){

    return await api("obtenerInspecciones",{

        id

    });

}

async function apiGuardarInspeccion(datos){

    return await api("guardarInspeccion",datos);

}

//======================================================
// FOTOS
//======================================================

async function apiSubirFoto(datos){

    return await api("subirFoto",datos);

}