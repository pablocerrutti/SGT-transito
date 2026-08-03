//======================================================
// SGT
// API
//======================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";

//======================================================

async function api(accion, datos = {}) {

    const params = new URLSearchParams();

    params.append("accion", accion);

    for (const clave in datos) {

        if (datos[clave] !== undefined && datos[clave] !== null) {

            params.append(clave, datos[clave]);

        }

    }

    const respuesta = await fetch(

        API_URL + "?" + params.toString()

    );

    return await respuesta.json();

}

//======================================================
// LOGIN
//======================================================

async function apiLogin(usuario, password) {

    return await api("login", {

        usuario,

        password

    });

}

//======================================================
// USUARIOS
//======================================================

async function apiObtenerUsuarios() {

    return await api("obtenerUsuarios");

}

async function apiGuardarUsuario(usuario) {

    return await api("guardarUsuario", usuario);

}

async function apiEliminarUsuario(id) {

    return await api("eliminarUsuario", {

        id

    });

}

//======================================================
// ELEMENTOS
//======================================================

async function apiObtenerElementos() {

    return await api("obtenerElementos");

}

async function apiGuardarElemento(elemento) {

    return await api("guardarElemento", elemento);

}

async function apiActualizarElemento(elemento) {

    return await api("actualizarElemento", elemento);

}

async function apiEliminarElemento(id) {

    return await api("eliminarElemento", {

        id

    });

}

//======================================================
// INSPECCIONES
//======================================================

async function apiObtenerInspecciones(idElemento) {

    return await api("obtenerInspecciones", {

        id: idElemento

    });

}

async function apiGuardarInspeccion(datos) {

    return await api("guardarInspeccion", datos);

}

//======================================================
// FOTOS
//======================================================

async function apiSubirFoto(datos) {

    return await api("subirFoto", datos);

}
