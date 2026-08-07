//==================================================
// SGT - MOVILIDAD URBANA
// mapa.js
//==================================================

let mapa = null;
let capaMarcadores = null;
let marcadorNuevo = null;

let categorias = [];
let elementos = [];

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {

    console.clear();
    console.log("===== INICIANDO MAPA =====");

    if (!comprobarSesion()) return;

    iniciarMapa();

    enlazarEventos();

    await cargarCategorias();

    await cargarElementos();

}

function comprobarSesion() {

    let usuario = null;

    try{
        usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    }catch(e){}

    if(!usuario){
        location.href="../../index.html";
        return false;
    }

    document.getElementById("usuarioActual").textContent =
        usuario.nombre || usuario.usuario || "";

    return true;

}

function iniciarMapa(){

    console.log("Creando Leaflet...");

    mapa = L.map("map").setView(
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

    mapa.on("click",seleccionarUbicacion);

    setTimeout(function(){

        mapa.invalidateSize();

    },500);

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
        String(c.activo).toUpperCase() === "SI"
    );

    const tipo = document.getElementById("tipo");
    const filtro = document.getElementById("filtroTipo");

    tipo.innerHTML = "";
    filtro.innerHTML = "";

    filtro.add(
        new Option(
            "Todos los elementos",
            ""
        )
    );

    categorias.forEach(c=>{

        tipo.add(
            new Option(
                c.nombre,
                c.nombre
            )
        );

        filtro.add(
            new Option(
                c.nombre,
                c.nombre
            )
        );

    });

}

function obtenerCategoria(nombre){

    return categorias.find(c=>

        normalizar(c.nombre)===

        normalizar(nombre)

    ) || null;

}

//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function enlazarEventos(){

    document
        .getElementById("formElemento")
        .addEventListener(
            "submit",
            guardarElemento
        );

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
        .getElementById("btnDashboard")
        .onclick=function(){

            location.href="../../pages/dashboard.html";

        };

        document
    .getElementById("btnInformes")
    .onclick=function(){

        location.href="../informes/informes.html";

    };

    document
        .getElementById("btnSalir")
        .onclick=salir;

}

//--------------------------------------------------
// NUEVA UBICACION
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

    marcadorNuevo = L.marker(
        [lat,lng],
        {
            draggable:true
        }
    ).addTo(mapa);

    // <<< AQUÍ VA >>>
    mapa.flyTo(
        [lat,lng],
        20,
        {
            duration:0.6
        }
    );

    marcadorNuevo.on("drag",function(){

        const p = marcadorNuevo.getLatLng();

        document.getElementById("lat").value =
            p.lat.toFixed(7);

        document.getElementById("lng").value =
            p.lng.toFixed(7);

    });

}
//--------------------------------------------------
// CARGAR ELEMENTOS
//--------------------------------------------------

async function cargarElementos(){

    mostrarMensaje(
        "Cargando elementos...",
        ""
    );

    const respuesta =
        await apiObtenerElementos();

    console.log("Respuesta API:",respuesta);

    if(!respuesta || !respuesta.ok){

        mostrarMensaje(
            respuesta?.mensaje ||
            "No se pudieron obtener los elementos.",
            "error"
        );

        return;

    }

    elementos = Array.isArray(
        respuesta.datos
    )
    ? respuesta.datos
    : [];

    console.log(
        "Elementos cargados:",
        elementos.length
    );

    renderizarMarcadores();

}

//--------------------------------------------------
// RENDERIZAR MARCADORES
//--------------------------------------------------

function renderizarMarcadores(){

    if(!capaMarcadores)
        return;

    capaMarcadores.clearLayers();

    const filtroTipo =
        document.getElementById(
            "filtroTipo"
        ).value;

    const texto =
        normalizar(
            document.getElementById(
                "buscar"
            ).value
        );

    const visibles =
        elementos.filter(function(e){

            const lat =
                parseFloat(
                    String(e.latitud)
                    .replace(",",".")
                );

            const lng =
                parseFloat(
                    String(e.longitud)
                    .replace(",",".")
                );

            if(
                isNaN(lat) ||
                isNaN(lng)
            ){
                return false;
            }

            if(
                filtroTipo &&
                normalizar(e.tipo) !==
                normalizar(filtroTipo)
            ){
                return false;
            }

            const cadena =
                normalizar(

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

        const lat =
            parseFloat(
                String(e.latitud)
                .replace(",",".")
            );

        const lng =
            parseFloat(
                String(e.longitud)
                .replace(",",".")
            );

        const marcador =
            L.marker(

                [lat,lng],

                {

                    icon:
                        crearIcono(
                            e.tipo
                        )

                }

            );

        marcador.bindPopup(
            crearPopup(e)
        );

        marcador.addTo(
            capaMarcadores
        );

    });

    document.getElementById(
    "contadorResultados"
).textContent =
    visibles.length +
    " elementos";

if(visibles.length){

    const grupo = L.featureGroup(
        capaMarcadores.getLayers()
    );

    mapa.fitBounds(
        grupo.getBounds(),
        {
            padding:[60,60]
        }
    );

}

}
//--------------------------------------------------
// ICONOS
//--------------------------------------------------

function crearIcono(tipo){

    const categoria =
        obtenerCategoria(tipo);

    const iconos={

        "traffic-light":"🚦",
        "camera":"📷",
        "person-walking":"🚶",
        "road":"⚠️",
        "signs-post":"🪧",
        "location-dot":"📍",
        "parking":"🅿️",
        "bi-taxi":"🚕",
        "disc. parking":"♿"

    };

    let emoji="📍";
    let color="gris";

    if(categoria){

        emoji =
            iconos[categoria.icono] ||
            "📍";

        color =
            categoria.color ||
            "gris";

    }

    return L.divIcon({

        className:
            "icono-elemento " +
            color,

        html:
        `
        <div class="pin-mapa">

            <div class="pin-cuerpo">

                <span class="icono-mapa">

                    ${emoji}

                </span>

            </div>

            <div class="pin-punta"></div>

        </div>
        `,

       iconSize:[80,100],
    iconAnchor:[40,98],
popupAnchor:[0,-90]
    });

}

//--------------------------------------------------
// POPUP
//--------------------------------------------------

function crearPopup(e){

    return `

    <div class="popup-card">

        <h2>${e.codigo || ""}</h2>

        <div class="popup-linea">
            <strong>Tipo</strong><br>
            ${e.tipo || ""}
        </div>

        <div class="popup-linea">
            <strong>Nombre</strong><br>
            ${e.nombre || ""}
        </div>

        <div class="popup-linea">
            <strong>Estado</strong><br>
            <span class="estado-popup">
                ${e.estado || ""}
            </span>
        </div>

        <div class="popup-linea">
            <strong>Dirección</strong><br>
            ${e.direccion || ""}
        </div>

        <div class="popup-linea">
            <strong>Descripción</strong><br>
            ${e.descripcion || "-"}
        </div>

        <div class="popup-linea">
            <strong>Características</strong><br>
            ${e.caracteristicas || "-"}
        </div>

        <hr>

        <div class="popup-botones">

            <button
                class="btn-inspeccion"
                onclick="abrirInspecciones('${e.id}')">
                📝 Inspecciones
            </button>

            <button
                class="btn-eliminar"
                onclick="eliminarElemento('${e.id}')">
                🗑 Eliminar
            </button>

        </div>

    </div>

    `;

}

//--------------------------------------------------
// ABRIR INSPECCIONES
//--------------------------------------------------

function abrirInspecciones(id){

    location.href =
        "inspeccion.html?elemento=" +
        encodeURIComponent(id);

}

//--------------------------------------------------
// ELIMINAR ELEMENTO
//--------------------------------------------------

async function eliminarElemento(id){

    if(!confirm("¿Eliminar este elemento?")){
        return;
    }

    const r = await apiEliminarElemento(id);

    if(r && r.ok){

        await cargarElementos();

    }else{

        mostrarMensaje(
            "No fue posible eliminar el elemento.",
            "error"
        );

    }

}

//--------------------------------------------------
// GUARDAR ELEMENTO
//--------------------------------------------------

async function guardarElemento(e){

    e.preventDefault();

    const categoria =
        obtenerCategoria(
            document.getElementById("tipo").value
        );

    const datos={

        tipo:
            document.getElementById("tipo").value,

        icono:
            categoria
                ? categoria.icono
                : "",

        color:
            categoria
                ? categoria.color
                : "",

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

    mostrarMensaje(
        "Guardando elemento...",
        ""
    );

    const respuesta =
        await apiGuardarElemento(datos);

    console.log(respuesta);

    if(!respuesta || !respuesta.ok){

        mostrarMensaje(
            respuesta?.mensaje ||
            "No fue posible guardar.",
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

        mapa.removeLayer(
            marcadorNuevo
        );

        marcadorNuevo=null;

    }

    await cargarElementos();

}
//--------------------------------------------------
// MENSAJES
//--------------------------------------------------

function mostrarMensaje(texto,tipo=""){

    const mensaje =
        document.getElementById(
            "mensajeMapa"
        );

    if(!mensaje)
        return;

    mensaje.textContent = texto;

    mensaje.className =
        "mensaje " + tipo;

}

//--------------------------------------------------
// NORMALIZAR
//--------------------------------------------------

function normalizar(texto){

    return String(texto || "")

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .toLowerCase()

        .trim();

}

//--------------------------------------------------
// ESCAPAR HTML
//--------------------------------------------------

function escapar(valor){

    return String(valor || "")

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}

//--------------------------------------------------
// COORDENADAS
//--------------------------------------------------

function coordenada(valor){

    const numero = parseFloat(
        String(valor || "")
            .replace(",",".")
    );

    return isNaN(numero)
        ? null
        : numero;

}

//--------------------------------------------------
// SALIR
//--------------------------------------------------

function salir(){

    localStorage.removeItem(
        "usuarioActual"
    );

    location.href =
        "../../index.html";

}
//--------------------------------------------------
// UTILIDADES DEL MAPA
//--------------------------------------------------

function centrarEnElementos(){

    if(!capaMarcadores){
        return;
    }

    const capas = capaMarcadores.getLayers();

    if(capas.length===0){
        return;
    }

    const grupo = L.featureGroup(capas);

    mapa.fitBounds(
        grupo.getBounds(),
        {
            padding:[40,40]
        }
    );

}

//--------------------------------------------------
// RECARGAR MAPA
//--------------------------------------------------

async function actualizarMapa(){

    mostrarMensaje(
        "Actualizando mapa...",
        ""
    );

    await cargarCategorias();

    await cargarElementos();

    centrarEnElementos();

}

//--------------------------------------------------
// REFRESCO AUTOMÁTICO
//--------------------------------------------------

setInterval(function(){

    if(document.visibilityState==="visible"){

        cargarElementos();

    }

},60000);

//--------------------------------------------------
// DEBUG
//--------------------------------------------------

window.debugMapa=function(){

    console.log("Mapa:",mapa);

    console.log("Categorías:",categorias);

    console.table(categorias);

    console.log("Elementos:",elementos);

    console.table(elementos);

};

//--------------------------------------------------
// FIN mapa.js
//--------------------------------------------------