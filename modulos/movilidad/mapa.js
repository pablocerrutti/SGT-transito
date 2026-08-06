//==================================================
// SGT - MOVILIDAD URBANA
// mapa.js 
//==================================================

"use strict";

//--------------------------------------------------
// VARIABLES GLOBALES
//--------------------------------------------------

let mapa = null;
let capaMarcadores = null;
let marcadorNuevo = null;

let categorias = [];
let elementos = [];


//--------------------------------------------------
// INICIO
//--------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);


//--------------------------------------------------
// INICIALIZAR PAGINA
//--------------------------------------------------

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
// CONTROL DE SESION
//--------------------------------------------------

function comprobarSesion(){

    let usuario = null;

    try{

        usuario = JSON.parse(
            localStorage.getItem("usuarioActual")
        );

    }catch(e){

        usuario = null;

    }

    if(!usuario){

        location.href="../../index.html";

        return false;

    }

    document.getElementById(
        "usuarioActual"
    ).textContent =

        usuario.nombre ||
        usuario.usuario ||
        "";

    return true;

}


//--------------------------------------------------
// MAPA
//--------------------------------------------------

function iniciarMapa(){

    mapa = L.map("map",{

        zoomControl:true,

        preferCanvas:true

    });

    mapa.setView(

        [-34.0997,-56.2140],

        15

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
                "&copy; OpenStreetMap",

            maxZoom:20

        }

    ).addTo(mapa);

    capaMarcadores =

        L.layerGroup()

        .addTo(mapa);

    mapa.on(

        "click",

        seleccionarUbicacion

    );

    setTimeout(function(){

        mapa.invalidateSize();

    },300);

}
//--------------------------------------------------
// SESIÓN
//--------------------------------------------------

function comprobarSesion() {

    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    } catch (e) {}

    if (!usuario) {
        location.href = "../../index.html";
        return false;
    }

    const div = document.getElementById("usuarioActual");

    if (div) {
        div.textContent =
            usuario.nombre ||
            usuario.usuario ||
            "";
    }

    return true;

}

//--------------------------------------------------
// MAPA
//--------------------------------------------------

function iniciarMapa() {

    mapa = L.map("map").setView(
        [-34.0997, -56.2140],
        15
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap",
            maxZoom: 20
        }
    ).addTo(mapa);

    capaMarcadores = L.layerGroup().addTo(mapa);

    mapa.on(
        "click",
        seleccionarUbicacion
    );

    setTimeout(function () {
        mapa.invalidateSize();
    }, 300);

}

//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function enlazarEventos() {

    document
        .getElementById("btnActualizar")
        .addEventListener(
            "click",
            cargarElementos
        );

    document
        .getElementById("buscar")
        .addEventListener(
            "input",
            renderizarMarcadores
        );

    document
        .getElementById("filtroTipo")
        .addEventListener(
            "change",
            renderizarMarcadores
        );

    document
        .getElementById("formElemento")
        .addEventListener(
            "submit",
            guardarElemento
        );

    document.getElementById("btnDashboard").onclick = function () {
        location.href = "../../pages/dashboard.html";
    };

    document.getElementById("btnSalir").onclick = salir;

}

//--------------------------------------------------
// NUEVA UBICACIÓN
//--------------------------------------------------

function seleccionarUbicacion(e) {

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    document.getElementById("lat").value =
        lat.toFixed(7);

    document.getElementById("lng").value =
        lng.toFixed(7);

    if (marcadorNuevo) {
        mapa.removeLayer(marcadorNuevo);
    }

    marcadorNuevo = L.marker(
        [lat, lng],
        {
            draggable: true
        }
    ).addTo(mapa);

}
//--------------------------------------------------
// CARGAR ELEMENTOS
//--------------------------------------------------

async function cargarElementos(){

    try{

        const respuesta = await apiObtenerElementos();

        console.log("Respuesta API:", respuesta);

        if(!respuesta || !respuesta.ok){

            mostrarMensaje(
                "No se pudieron cargar los elementos",
                "error"
            );

            return;

        }

        elementos = Array.isArray(respuesta.datos)
            ? respuesta.datos
            : [];

        console.log("Elementos:", elementos);

        renderizarMarcadores();

    }catch(error){

        console.error(error);

        mostrarMensaje(
            "Error cargando elementos",
            "error"
        );

    }

}

//--------------------------------------------------
// DIBUJAR MARCADORES
//--------------------------------------------------

function renderizarMarcadores(){

    if(!capaMarcadores) return;

    capaMarcadores.clearLayers();

    const filtro =
        document.getElementById("filtroTipo").value;

    const texto =
        normalizar(
            document.getElementById("buscar").value
        );

    const visibles = elementos.filter(function(e){

        const lat = parseFloat(
            String(e.latitud || "").replace(",",".")
        );

        const lng = parseFloat(
            String(e.longitud || "").replace(",",".")
        );

        if(isNaN(lat) || isNaN(lng))
            return false;

        if(
            filtro &&
            normalizar(e.tipo) !== normalizar(filtro)
        ){
            return false;
        }

        const cadena = normalizar(
            [
                e.codigo,
                e.nombre,
                e.tipo,
                e.direccion,
                e.estado
            ].join(" ")
        );

        return cadena.includes(texto);

    });

    visibles.forEach(function(e){

        const lat = parseFloat(
            String(e.latitud).replace(",",".")
        );

        const lng = parseFloat(
            String(e.longitud).replace(",",".")
        );

        const marcador = L.marker(

            [lat,lng],

            {
                icon: crearIcono(e.tipo)
            }

        );

        marcador.bindPopup(
            crearPopup(e)
        );

        marcador.addTo(capaMarcadores);

    });

    document.getElementById(
        "contadorResultados"
    ).textContent =
        visibles.length +
        " elementos";

}

//--------------------------------------------------
// CREAR ICONOS
//--------------------------------------------------

function crearIcono(tipo){

    const categoria = obtenerCategoria(tipo);

    let emoji = "📍";

    if(categoria){

        switch(categoria.icono){

            case "traffic-light":
                emoji="🚦";
                break;

            case "camera":
                emoji="📷";
                break;

            case "person-walking":
                emoji="🚶";
                break;

            case "road":
                emoji="⚠️";
                break;

            case "signs-post":
                emoji="🪧";
                break;

            case "parking":
                emoji="🅿️";
                break;

            case "bi-taxi":
                emoji="🚕";
                break;

            case "disc. parking":
                emoji="♿";
                break;

            default:
                emoji="📍";

        }

    }

    return L.divIcon({

        className:
            "icono-elemento " +
            (categoria
                ? categoria.color
                : "gris"),

        html:`

        <div class="pin-mapa">

            <div class="pin-circulo">

                <span class="icono-mapa">
                    ${emoji}
                </span>

            </div>

            <div class="pin-punta"></div>

        </div>

        `,

        iconSize:[54,72],
        iconAnchor:[27,70],
        popupAnchor:[0,-58]

    });

}

//--------------------------------------------------
// POPUP
//--------------------------------------------------

function crearPopup(e){

    return `

    <div class="popup-elemento">

        <h3>${e.codigo || ""}</h3>

        <p><strong>Tipo:</strong> ${e.tipo || ""}</p>

        <p><strong>Nombre:</strong> ${e.nombre || ""}</p>

        <p><strong>Estado:</strong> ${e.estado || ""}</p>

        <p><strong>Dirección:</strong> ${e.direccion || ""}</p>

        ${
            e.descripcion
            ? `<p><strong>Descripción:</strong> ${e.descripcion}</p>`
            : ""
        }

    </div>

    `;

}

//--------------------------------------------------
// GUARDAR ELEMENTO
//--------------------------------------------------

async function guardarElemento(evento){

    evento.preventDefault();

    const datos = {

        tipo:
            document.getElementById("tipo").value,

        nombre:
            document.getElementById("nombre").value,

        descripcion:
            document.getElementById("descripcion").value,

        direccion:
            document.getElementById("direccion").value,

        estado:
            document.getElementById("estado").value,

        caracteristicas:
            document.getElementById("caracteristicas").value,

        latitud:
            document.getElementById("lat").value,

        longitud:
            document.getElementById("lng").value

    };

    if(!datos.latitud || !datos.longitud){

        mostrarMensaje(
            "Seleccione una ubicación en el mapa.",
            "error"
        );

        return;

    }

    try{

        const respuesta =
            await apiGuardarElemento(datos);

        if(!respuesta || !respuesta.ok){

            mostrarMensaje(
                respuesta?.mensaje || "No se pudo guardar.",
                "error"
            );

            return;

        }

        mostrarMensaje(
            "Elemento guardado correctamente.",
            "exito"
        );

        document
            .getElementById("formElemento")
            .reset();

        if(marcadorNuevo){

            mapa.removeLayer(marcadorNuevo);

            marcadorNuevo = null;

        }

        await cargarElementos();

    }catch(error){

        console.error(error);

        mostrarMensaje(
            "Error al guardar el elemento.",
            "error"
        );

    }

}

//--------------------------------------------------
// MENSAJES
//--------------------------------------------------

function mostrarMensaje(texto,tipo){

    const mensaje =
        document.getElementById("mensajeMapa");

    if(!mensaje) return;

    mensaje.textContent = texto;

    mensaje.className =
        "mensaje " + (tipo || "");

}

//--------------------------------------------------
// SALIR
//--------------------------------------------------

function salir(){

    localStorage.removeItem(
        "usuarioActual"
    );

    window.location.href =
        "../../index.html";

}
//--------------------------------------------------
// POPUP
//--------------------------------------------------

function crearPopup(e){

    return `

    <div class="popup-elemento">

        <h3>${e.codigo || ""}</h3>

        <p><strong>Tipo:</strong> ${e.tipo || ""}</p>

        <p><strong>Nombre:</strong> ${e.nombre || ""}</p>

        <p><strong>Estado:</strong> ${e.estado || ""}</p>

        <p><strong>Dirección:</strong> ${e.direccion || ""}</p>

        ${
            e.descripcion
            ? `<p><strong>Descripción:</strong> ${e.descripcion}</p>`
            : ""
        }

    </div>

    `;

}

//--------------------------------------------------
// GUARDAR ELEMENTO
//--------------------------------------------------

async function guardarElemento(evento){

    evento.preventDefault();

    const datos = {

        tipo:
            document.getElementById("tipo").value,

        nombre:
            document.getElementById("nombre").value,

        descripcion:
            document.getElementById("descripcion").value,

        direccion:
            document.getElementById("direccion").value,

        estado:
            document.getElementById("estado").value,

        caracteristicas:
            document.getElementById("caracteristicas").value,

        latitud:
            document.getElementById("lat").value,

        longitud:
            document.getElementById("lng").value

    };

    if(!datos.latitud || !datos.longitud){

        mostrarMensaje(
            "Seleccione una ubicación en el mapa.",
            "error"
        );

        return;

    }

    try{

        const respuesta =
            await apiGuardarElemento(datos);

        if(!respuesta || !respuesta.ok){

            mostrarMensaje(
                respuesta?.mensaje || "No se pudo guardar.",
                "error"
            );

            return;

        }

        mostrarMensaje(
            "Elemento guardado correctamente.",
            "exito"
        );

        document
            .getElementById("formElemento")
            .reset();

        if(marcadorNuevo){

            mapa.removeLayer(marcadorNuevo);

            marcadorNuevo = null;

        }

        await cargarElementos();

    }catch(error){

        console.error(error);

        mostrarMensaje(
            "Error al guardar el elemento.",
            "error"
        );

    }

}

//--------------------------------------------------
// MENSAJES
//--------------------------------------------------

function mostrarMensaje(texto,tipo){

    const mensaje =
        document.getElementById("mensajeMapa");

    if(!mensaje) return;

    mensaje.textContent = texto;

    mensaje.className =
        "mensaje " + (tipo || "");

}

//--------------------------------------------------
// SALIR
//--------------------------------------------------

function salir(){

    localStorage.removeItem(
        "usuarioActual"
    );

    window.location.href =
        "../../index.html";

}
