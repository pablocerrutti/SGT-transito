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
//--------------------------------------------------
// CATEGORIAS
//--------------------------------------------------

async function cargarCategorias(){

    const respuesta = await apiObtenerCategorias();

    if(!respuesta || !respuesta.ok){

        mostrarMensaje(
            "No se pudieron cargar las categorías",
            "error"
        );

        return;
    }

    categorias = (respuesta.datos || []).filter(c =>

        String(c.activo)
            .toUpperCase() === "SI"

    );

    const tipo =
        document.getElementById("tipo");

    const filtro =
        document.getElementById("filtroTipo");

    tipo.innerHTML = "";

    filtro.innerHTML =
        "<option value=''>Todos los elementos</option>";

    categorias.forEach(c=>{

        tipo.add(
            new Option(c.nombre,c.nombre)
        );

        filtro.add(
            new Option(c.nombre,c.nombre)
        );

    });

}
//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function enlazarEventos(){

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

    document
    .getElementById("btnDashboard")
    .onclick=()=>{

        location.href="../../pages/dashboard.html";

    };

    document
    .getElementById("btnSalir")
    .onclick=salir;

}
//--------------------------------------------------
// NUEVO MARCADOR
//--------------------------------------------------

function seleccionarUbicacion(e){

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    document.getElementById("lat").value =
        lat.toFixed(7);

    document.getElementById("lng").value =
        lng.toFixed(7);

    if(marcadorNuevo){

        mapa.removeLayer(marcadorNuevo);

    }

    marcadorNuevo =

        L.marker(

            [lat,lng],

            {

                draggable:true

            }

        )

        .addTo(mapa);

}
//--------------------------------------------------
// CARGAR ELEMENTOS
//--------------------------------------------------

async function cargarElementos(){

    const respuesta =
        await apiObtenerElementos();

    if(!respuesta || !respuesta.ok){

        mostrarMensaje(
            "No se pudieron cargar los elementos",
            "error"
        );

        return;
    }

    elementos =

        Array.isArray(respuesta.datos)
            ? respuesta.datos
            : [];

    renderizarMarcadores();

}
//--------------------------------------------------
// DIBUJAR MARCADORES
//--------------------------------------------------

function renderizarMarcadores(){

    if(!capaMarcadores) return;

    capaMarcadores.clearLayers();

    const filtroTipo =
        document.getElementById("filtroTipo").value;

    const texto =
        normalizar(
            document.getElementById("buscar").value
        );

    const visibles = elementos.filter(function(e){

        if(!e.latitud || !e.longitud)
            return false;

        if(
            filtroTipo &&
            normalizar(e.tipo) !== normalizar(filtroTipo)
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

        if(isNaN(lat) || isNaN(lng))
            return;

        L.marker(

            [lat,lng],

            {
                icon:crearIcono(e.tipo)
            }

        )

        .bindPopup(

            crearPopup(e)

        )

        .addTo(capaMarcadores);

    });

    document.getElementById(
        "contadorResultados"
    ).textContent =
        visibles.length +
        " elementos";

}
//--------------------------------------------------
// ICONOS
//--------------------------------------------------

function crearIcono(tipo){

    const categoria =
        categorias.find(c=>

            normalizar(c.nombre)==
            normalizar(tipo)

        );

    let emoji="📍";

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

        }

    }

    return L.divIcon({

        className:
            "icono-elemento " +
            (categoria
                ? categoria.color
                : "gris"),

        html:
        `
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

        <p><b>Tipo:</b> ${e.tipo || ""}</p>

        <p><b>Nombre:</b> ${e.nombre || ""}</p>

        <p><b>Estado:</b> ${e.estado || ""}</p>

        <p><b>Dirección:</b> ${e.direccion || ""}</p>

    </div>

    `;

}
//--------------------------------------------------
// GUARDAR ELEMENTO
//--------------------------------------------------

async function guardarElemento(e){

    e.preventDefault();

    const datos={

        tipo:document.getElementById("tipo").value,

        nombre:document.getElementById("nombre").value,

        descripcion:document.getElementById("descripcion").value,

        direccion:document.getElementById("direccion").value,

        estado:document.getElementById("estado").value,

        caracteristicas:document.getElementById("caracteristicas").value,

        latitud:document.getElementById("lat").value,

        longitud:document.getElementById("lng").value

    };

    if(!datos.latitud){

        mostrarMensaje(

            "Seleccione una ubicación.",

            "error"

        );

        return;

    }

    const r = await apiGuardarElemento(datos);

    if(!r || !r.ok){

        mostrarMensaje(

            "No se pudo guardar.",

            "error"

        );

        return;

    }

    mostrarMensaje(

        "Elemento guardado correctamente.",

        "exito"

    );

    document.getElementById("formElemento").reset();

    if(marcadorNuevo){

        mapa.removeLayer(marcadorNuevo);

        marcadorNuevo=null;

    }

    cargarElementos();

}
//--------------------------------------------------
// MENSAJES
//--------------------------------------------------

function mostrarMensaje(texto,tipo){

    const div=document.getElementById("mensajeMapa");

    div.textContent=texto;

    div.className="mensaje "+tipo;

}
//--------------------------------------------------
// NORMALIZAR
//--------------------------------------------------

function normalizar(txt){

    return String(txt || "")

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g,"")

    .toLowerCase()

    .trim();

}
//--------------------------------------------------
// SALIR
//--------------------------------------------------

function salir(){

    localStorage.removeItem("usuarioActual");

    location.href="../../index.html";

}
