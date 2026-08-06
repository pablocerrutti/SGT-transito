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
//--------------------------------------------------
// SESION
//--------------------------------------------------

function comprobarSesion(){

    let usuario = null;

    try{

        usuario = JSON.parse(
            localStorage.getItem("usuarioActual")
        );

    }catch(e){}

    if(!usuario){

        location.href="../../index.html";
        return false;

    }

    document.getElementById(
        "usuarioActual"
    ).textContent =
        usuario.nombre ||
        usuario.usuario;

    return true;

}
//--------------------------------------------------
// MAPA
//--------------------------------------------------

function iniciarMapa(){

    mapa = L.map("map",{

        zoomControl:true

    }).setView(

        [-34.0997,-56.2140],

        15

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap",

            maxZoom:20

        }

    ).addTo(mapa);

    capaMarcadores = L.layerGroup().addTo(mapa);

    mapa.on(

        "click",

        seleccionarUbicacion

    );

    setTimeout(()=>{

        mapa.invalidateSize();

    },300);

}
