//==================================================
// SGT - MOVILIDAD URBANA
// mapa.js
//==================================================

let mapa = null;
let capaMarcadores = null;
let marcadorNuevo = null;

let categorias = [];
let elementos = [];

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);

async function iniciarPagina(){

    if(!comprobarSesion()){
        return;
    }

    iniciarMapa();

    enlazarEventos();

    await cargarCategorias();

    await cargarElementos();

}
