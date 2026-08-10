//==================================================
// SGT - MOVILIDAD URBANA
// mapa.js
//==================================================

let mapa = null;
let capaMarcadores = null;
let marcadorNuevo = null;

let categorias = [];
let elementos = [];
let localidades = [];


//==================================================
// INICIO
//==================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);


async function iniciarPagina(){

    console.clear();

    console.log(
        "===== INICIANDO MAPA ====="
    );


    if(!comprobarSesion()){

        return;

    }


    iniciarMapa();

    enlazarEventos();

    await cargarCategorias();

    await cargarLocalidades();

    await cargarElementos();

}


//==================================================
// SESION
//==================================================

function comprobarSesion(){

    let usuario = null;


    try{

        usuario =
            JSON.parse(
                localStorage.getItem(
                    "usuarioActual"
                )
            );

    }catch(e){}


    if(!usuario){

        location.href =
            "../../index.html";

        return false;

    }


    const elemento =
        document.getElementById(
            "usuarioActual"
        );


    if(elemento){

        elemento.textContent =
            usuario.nombre ||
            usuario.usuario ||
            "";

    }


    return true;

}


//==================================================
// INICIAR MAPA
//==================================================

function iniciarMapa(){

    console.log("Creando Leaflet...");


    const elementoMapa =
        document.getElementById("map");


    if(!elementoMapa){

        console.error(
            "No existe el elemento #map"
        );

        return;

    }


    //==============================================
    // MAPA BASE
    //==============================================

    mapa = L.map("map").setView(
        [-34.0997, -56.2140],
        15
    );


    //==============================================
    // MAPA NORMAL
    //==============================================

    const mapaCalles =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "© OpenStreetMap",
                maxZoom:20
            }
        );


    //==============================================
    // SATÉLITE
    //==============================================

    const satelite =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution:
                    "Tiles © Esri",
                maxZoom:20
            }
        );


    //==============================================
    // ETIQUETAS
    //==============================================

    const etiquetas =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            {
                attribution:
                    "Labels © Esri",
                maxZoom:20,
                pane:"overlayPane"
            }
        );


    //==============================================
    // HÍBRIDO
    //==============================================

    const hibrido =
        L.layerGroup([
            satelite,
            etiquetas
        ]);


    mapaCalles.addTo(mapa);


    //==============================================
    // CONTROL DE CAPAS
    //==============================================

    const mapasBase = {

        "🗺️ Mapa":
            mapaCalles,

        "🛰️ Satélite":
            satelite,

        "🛰️ Híbrido":
            hibrido

    };


    L.control.layers(
        mapasBase,
        null,
        {
            collapsed:true,
            position:"topright"
        }
    ).addTo(mapa);


    //==============================================
    // MARCADORES
    //==============================================

    capaMarcadores =
        L.layerGroup().addTo(mapa);


    //==============================================
    // CLICK
    //==============================================

    mapa.on(
        "click",
        seleccionarUbicacion
    );


    //==============================================
    // CORREGIR TAMAÑO
    //==============================================

    setTimeout(
        function(){

            mapa.invalidateSize();

        },
        500
    );

}


//==================================================
// CATEGORIAS
//==================================================

async function cargarCategorias(){

    const respuesta =
        await apiObtenerCategorias();


    if(
        !respuesta ||
        !respuesta.ok
    ){

        mostrarMensaje(
            "No se pudieron cargar las categorías",
            "error"
        );

        return;

    }


    categorias =
        (respuesta.datos || [])
        .filter(
            c =>
                String(c.activo)
                .toUpperCase()
                ===
                "SI"
        );


    const tipo =
        document.getElementById(
            "tipo"
        );


    const filtro =
        document.getElementById(
            "filtroTipo"
        );


    if(tipo){

        tipo.innerHTML = "";

    }


    if(filtro){

        filtro.innerHTML = "";

        filtro.add(
            new Option(
                "Todos los elementos",
                ""
            )
        );

    }


    categorias.forEach(
        function(c){

            if(tipo){

                tipo.add(
                    new Option(
                        c.nombre,
                        c.nombre
                    )
                );

            }


            if(filtro){

                filtro.add(
                    new Option(
                        c.nombre,
                        c.nombre
                    )
                );

            }

        }
    );

}


//==================================================
// LOCALIDADES
//==================================================

async function cargarLocalidades(){

    const filtroLocalidad =
        document.getElementById(
            "filtroLocalidad"
        );


    if(!filtroLocalidad){

        console.warn(
            "No existe #filtroLocalidad"
        );

        return;

    }


    filtroLocalidad.innerHTML = "";


    filtroLocalidad.add(
        new Option(
            "Todas las localidades",
            ""
        )
    );


    try{

        const respuesta =
            await apiObtenerLocalidades();


        console.log(
            "Respuesta localidades:",
            respuesta
        );


        if(
            !respuesta ||
            !respuesta.ok
        ){

            console.warn(
                "No se pudieron cargar las localidades"
            );

            return;

        }


        localidades =
            Array.isArray(
                respuesta.datos
            )
            ?
            respuesta.datos
            :
            [];


        //==========================================
        // QUITAR DUPLICADOS
        //==========================================

        const nombres =
            [];


        localidades.forEach(
            function(localidad){

                let nombre = "";


                if(
                    typeof localidad === "string"
                ){

                    nombre =
                        localidad.trim();

                }else{

                    nombre =
                        localidad.nombre ||
                        localidad.localidad ||
                        localidad.nombreLocalidad ||
                        localidad.descripcion ||
                        "";

                }


                nombre =
                    String(nombre).trim();


                if(
                    nombre &&
                    !nombres.some(
                        n =>
                            normalizar(n)
                            ===
                            normalizar(nombre)
                    )
                ){

                    nombres.push(nombre);

                }

            }
        );


        //==========================================
        // ORDEN ALFABÉTICO
        //==========================================

        nombres.sort(
            function(a,b){

                return a.localeCompare(
                    b,
                    "es",
                    {
                        sensitivity:"base"
                    }
                );

            }
        );


        //==========================================
        // CARGAR SELECT
        //==========================================

        nombres.forEach(
            function(nombre){

                filtroLocalidad.add(
                    new Option(
                        nombre,
                        nombre
                    )
                );

            }
        );


        console.log(
            "Localidades cargadas:",
            nombres
        );


    }catch(error){

        console.error(
            "Error cargando localidades:",
            error
        );

    }

}


//==================================================
// OBTENER CATEGORIA
//==================================================

function obtenerCategoria(nombre){

    return categorias.find(
        c =>
            normalizar(c.nombre)
            ===
            normalizar(nombre)
    ) || null;

}


//==================================================
// EVENTOS
//==================================================

function enlazarEventos(){

    const form =
        document.getElementById(
            "formElemento"
        );


    if(form){

        form.addEventListener(
            "submit",
            guardarElemento
        );

    }


    const actualizar =
        document.getElementById(
            "btnActualizar"
        );


    if(actualizar){

        actualizar.addEventListener(
            "click",
            async function(){

                await cargarCategorias();

                await cargarLocalidades();

                await cargarElementos();

            }
        );

    }


    const buscar =
        document.getElementById(
            "buscar"
        );


    if(buscar){

        buscar.addEventListener(
            "input",
            renderizarMarcadores
        );

    }


    const filtro =
        document.getElementById(
            "filtroTipo"
        );


    if(filtro){

        filtro.addEventListener(
            "change",
            renderizarMarcadores
        );

    }


    const filtroLocalidad =
        document.getElementById(
            "filtroLocalidad"
        );


    if(filtroLocalidad){

        filtroLocalidad.addEventListener(
            "change",
            function(){

                renderizarMarcadores();

                centrarLocalidadSeleccionada();

            }
        );

    }


    const dashboard =
        document.getElementById(
            "btnDashboard"
        );


    if(dashboard){

        dashboard.onclick =
            function(){

                location.href =
                    "../../pages/dashboard.html";

            };

    }


    const informes =
        document.getElementById(
            "btnInformes"
        );


    if(informes){

        informes.onclick =
            function(){

                location.href =
                    "../informes/informes.html";

            };

    }


    const salirBtn =
        document.getElementById(
            "btnSalir"
        );


    if(salirBtn){

        salirBtn.onclick =
            salir;

    }

}


//==================================================
// NUEVA UBICACION
//==================================================

function seleccionarUbicacion(e){

    const lat =
        e.latlng.lat;

    const lng =
        e.latlng.lng;


    const campoLat =
        document.getElementById("lat");

    const campoLng =
        document.getElementById("lng");


    if(campoLat){

        campoLat.value =
            lat.toFixed(7);

    }


    if(campoLng){

        campoLng.value =
            lng.toFixed(7);

    }


    if(marcadorNuevo){

        mapa.removeLayer(
            marcadorNuevo
        );

        marcadorNuevo = null;

    }


    marcadorNuevo =
        L.marker(
            [lat,lng],
            {
                draggable:true,
                icon:
                    crearIconoNuevo()
            }
        ).addTo(mapa);


    marcadorNuevo.on(
        "drag",
        function(){

            const p =
                marcadorNuevo.getLatLng();


            if(campoLat){

                campoLat.value =
                    p.lat.toFixed(7);

            }


            if(campoLng){

                campoLng.value =
                    p.lng.toFixed(7);

            }

        }
    );


    mapa.flyTo(
        [lat,lng],
        18,
        {
            duration:0.6
        }
    );

}


//==================================================
// CARGAR ELEMENTOS
//==================================================

async function cargarElementos(){

    mostrarMensaje(
        "Cargando elementos...",
        ""
    );


    const respuesta =
        await apiObtenerElementos();


    console.log(
        "Respuesta API:",
        respuesta
    );


    if(
        !respuesta ||
        !respuesta.ok
    ){

        mostrarMensaje(
            respuesta?.mensaje ||
            "No se pudieron obtener los elementos.",
            "error"
        );

        return;

    }


    elementos =
        Array.isArray(
            respuesta.datos
        )
        ?
        respuesta.datos
        :
        [];


    console.log(
        "Elementos cargados:",
        elementos.length
    );


    renderizarMarcadores();


    mostrarMensaje(
        elementos.length +
        " elementos cargados.",
        "exito"
    );

}


//==================================================
// RENDERIZAR MARCADORES
//==================================================

function renderizarMarcadores(){

    if(!capaMarcadores){

        return;

    }


    capaMarcadores.clearLayers();


    const filtroElemento =
        document.getElementById(
            "filtroTipo"
        );


    const campoBuscar =
        document.getElementById(
            "buscar"
        );


    const filtroLocalidad =
        document.getElementById(
            "filtroLocalidad"
        );


    const filtroTipo =
        filtroElemento
        ?
        filtroElemento.value
        :
        "";


    const localidadSeleccionada =
        filtroLocalidad
        ?
        filtroLocalidad.value
        :
        "";


    const texto =
        normalizar(
            campoBuscar
            ?
            campoBuscar.value
            :
            ""
        );


    const visibles =
        elementos.filter(
            function(e){

                const lat =
                    coordenada(
                        e.latitud
                    );


                const lng =
                    coordenada(
                        e.longitud
                    );


                if(
                    lat === null ||
                    lng === null
                ){

                    return false;

                }


                //==================================
                // FILTRO TIPO
                //==================================

                if(
                    filtroTipo &&
                    normalizar(e.tipo)
                    !==
                    normalizar(filtroTipo)
                ){

                    return false;

                }


                //==================================
                // FILTRO LOCALIDAD
                //==================================

                if(
                    localidadSeleccionada
                ){

                    const localidadElemento =
                        e.localidadNombre ||
                        e.localidad ||
                        e.nombreLocalidad ||
                        "";


                    if(
                        normalizar(
                            localidadElemento
                        )
                        !==
                        normalizar(
                            localidadSeleccionada
                        )
                    ){

                        return false;

                    }

                }


                //==================================
                // BUSQUEDA
                //==================================

                const cadena =
                    normalizar(
                        [
                            e.codigo,
                            e.nombre,
                            e.tipo,
                            e.direccion,
                            e.estado,
                            e.localidadNombre,
                            e.localidad
                        ].join(" ")
                    );


                return cadena.includes(
                    texto
                );

            }
        );


    //================================================
    // CREAR MARCADORES
    //================================================

    visibles.forEach(
        function(e){

            const lat =
                coordenada(
                    e.latitud
                );


            const lng =
                coordenada(
                    e.longitud
                );


            const marcador =
                L.marker(
                    [lat,lng],
                    {
                        icon:
                            crearIcono(
                                e.tipo
                            ),

                        keyboard:true,

                        riseOnHover:true

                    }
                );


            marcador.bindPopup(
                crearPopup(e),
                {
                    maxWidth:320,
                    minWidth:280,
                    autoPan:true,
                    closeButton:true
                }
            );


            marcador.addTo(
                capaMarcadores
            );

        }
    );


    //================================================
    // CONTADOR
    //================================================

    const contador =
        document.getElementById(
            "contadorResultados"
        );


    if(contador){

        contador.textContent =
            visibles.length +
            " elementos";

    }

}


//==================================================
// CENTRAR LOCALIDAD
//==================================================

function centrarLocalidadSeleccionada(){

    if(!mapa){

        return;

    }


    const filtroLocalidad =
        document.getElementById(
            "filtroLocalidad"
        );


    if(
        !filtroLocalidad ||
        !filtroLocalidad.value
    ){

        return;

    }


    const localidad =
        normalizar(
            filtroLocalidad.value
        );


    const elementosLocalidad =
        elementos.filter(
            function(e){

                const nombre =
                    e.localidadNombre ||
                    e.localidad ||
                    e.nombreLocalidad ||
                    "";


                return (
                    normalizar(nombre)
                    ===
                    localidad
                );

            }
        );


    //================================================
    // SI NO HAY ELEMENTOS:
    // NO HACER NADA
    //
    // La localidad sigue apareciendo
    // en el selector.
    //================================================

    if(
        !elementosLocalidad.length
    ){

        return;

    }


    const puntos =
        elementosLocalidad
        .map(
            function(e){

                const lat =
                    coordenada(
                        e.latitud
                    );

                const lng =
                    coordenada(
                        e.longitud
                    );


                if(
                    lat === null ||
                    lng === null
                ){

                    return null;

                }


                return [lat,lng];

            }
        )
        .filter(Boolean);


    if(!puntos.length){

        return;

    }


    mapa.fitBounds(
        L.latLngBounds(puntos),
        {
            padding:[
                50,
                50
            ],
            maxZoom:16
        }
    );

}


//==================================================
// ICONO POI
//==================================================

function crearIcono(tipo){

    const categoria =
        obtenerCategoria(tipo);


    const iconos = {

        "traffic-light":
            "fa-solid fa-traffic-light",

        "camera":
            "fa-solid fa-camera",

        "person-walking":
            "fa-solid fa-person-walking",

        "road":
            "fa-solid fa-road",

        "signs-post":
            "fa-solid fa-signs-post",

        "location-dot":
            "fa-solid fa-location-dot",

        "parking":
            "fa-solid fa-square-parking",

        "bi-taxi":
            "fa-solid fa-taxi",

        "disc. parking":
            "fa-solid fa-wheelchair",

        "Otros":
            "fa-solid fa-location-dot"

    };


    let claseIcono =
        "fa-solid fa-location-dot";


    let color =
        "gris";


    if(categoria){

        claseIcono =
            iconos[
                categoria.icono
            ]
            ||
            "fa-solid fa-location-dot";


        color =
            String(
                categoria.color ||
                "gris"
            ).toLowerCase();

    }


    return L.divIcon({

        className:
            "poi-elemento " +
            color,

        html:
        `
        <div class="poi-pin">

            <div class="poi-icono">

                <i class="${claseIcono}"></i>

            </div>

        </div>
        `,

        iconSize:[
            44,
            52
        ],

        iconAnchor:[
            22,
            52
        ],

        popupAnchor:[
            0,
            -52
        ]

    });

}


//==================================================
// ICONO NUEVO
//==================================================

function crearIconoNuevo(){

    return L.divIcon({

        className:
            "poi-elemento nuevo",

        html:
        `
        <div class="poi-pin">

            <div class="poi-icono">

                <i class="fa-solid fa-crosshairs"></i>

            </div>

        </div>
        `,

        iconSize:[
            44,
            52
        ],

        iconAnchor:[
            22,
            52
        ],

        popupAnchor:[
            0,
            -52
        ]

    });

}


//==================================================
// POPUP
//==================================================

function crearPopup(e){

    return `

    <div class="popup-card">

        <h2>
            ${escapar(e.codigo)}
        </h2>

        <div class="popup-linea">

            <strong>Tipo</strong><br>

            ${escapar(e.tipo)}

        </div>


        <div class="popup-linea">

            <strong>Nombre</strong><br>

            ${escapar(e.nombre)}

        </div>


        <div class="popup-linea">

            <strong>Localidad</strong><br>

            ${escapar(
                e.localidadNombre ||
                e.localidad ||
                "-"
            )}

        </div>


        <div class="popup-linea">

            <strong>Estado</strong><br>

            <span class="estado-popup">

                ${escapar(e.estado)}

            </span>

        </div>


        <div class="popup-linea">

            <strong>Dirección</strong><br>

            ${escapar(e.direccion)}

        </div>


        <div class="popup-linea">

            <strong>Descripción</strong><br>

            ${escapar(
                e.descripcion || "-"
            )}

        </div>


        <div class="popup-linea">

            <strong>Características</strong><br>

            ${escapar(
                e.caracteristicas || "-"
            )}

        </div>


        <hr>


        <div class="popup-botones">

            <button
                class="btn-inspeccion"
                onclick="
                    abrirInspecciones(
                        '${escapar(e.id)}'
                    )
                "
            >
                📝 Inspecciones
            </button>


            <button
                class="btn-eliminar"
                onclick="
                    eliminarElemento(
                        '${escapar(e.id)}'
                    )
                "
            >
                🗑 Eliminar
            </button>

        </div>

    </div>

    `;

}


//==================================================
// ABRIR INSPECCIONES
//==================================================

function abrirInspecciones(id){

    location.href =
        "inspeccion.html?elemento=" +
        encodeURIComponent(id);

}


//==================================================
// ELIMINAR
//==================================================

async function eliminarElemento(id){

    if(
        !confirm(
            "¿Eliminar este elemento?"
        )
    ){

        return;

    }


    const respuesta =
        await apiEliminarElemento(id);


    if(
        respuesta &&
        respuesta.ok
    ){

        await cargarElementos();

    }else{

        mostrarMensaje(
            respuesta?.mensaje ||
            "No fue posible eliminar el elemento.",
            "error"
        );

    }

}


//==================================================
// GUARDAR
//==================================================

async function guardarElemento(e){

    e.preventDefault();


    const tipo =
        document.getElementById(
            "tipo"
        ).value;


    const categoria =
        obtenerCategoria(tipo);


    const datos = {

        tipo:tipo,

        icono:
            categoria
            ?
            categoria.icono
            :
            "",

        color:
            categoria
            ?
            categoria.color
            :
            "",

        nombre:
            document.getElementById(
                "nombre"
            ).value,

        descripcion:
            document.getElementById(
                "descripcion"
            ).value,

        direccion:
            document.getElementById(
                "direccion"
            ).value,

        estado:
            document.getElementById(
                "estado"
            ).value,

        caracteristicas:
            document.getElementById(
                "caracteristicas"
            ).value,

        latitud:
            document.getElementById(
                "lat"
            ).value,

        longitud:
            document.getElementById(
                "lng"
            ).value

    };


    if(
        !datos.latitud ||
        !datos.longitud
    ){

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
        await apiGuardarElemento(
            datos
        );


    console.log(
        "Respuesta guardar:",
        respuesta
    );


    if(
        !respuesta ||
        !respuesta.ok
    ){

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


    const form =
        document.getElementById(
            "formElemento"
        );


    if(form){

        form.reset();

    }


    if(marcadorNuevo){

        mapa.removeLayer(
            marcadorNuevo
        );

        marcadorNuevo = null;

    }


    await cargarElementos();

}


//==================================================
// MENSAJES
//==================================================

function mostrarMensaje(
    texto,
    tipo=""
){

    const mensaje =
        document.getElementById(
            "mensajeMapa"
        );


    if(!mensaje){

        return;

    }


    mensaje.textContent =
        texto;


    mensaje.className =
        "mensaje " +
        tipo;

}


//==================================================
// NORMALIZAR
//==================================================

function normalizar(texto){

    return String(
        texto || ""
    )
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .toLowerCase()
    .trim();

}


//==================================================
// ESCAPAR
//==================================================

function escapar(valor){

    return String(
        valor || ""
    )
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


//==================================================
// COORDENADAS
//==================================================

function coordenada(valor){

    const numero =
        parseFloat(
            String(
                valor || ""
            )
            .replace(
                ",",
                "."
            )
        );


    return isNaN(numero)
        ?
        null
        :
        numero;

}


//==================================================
// SALIR
//==================================================

function salir(){

    localStorage.removeItem(
        "usuarioActual"
    );


    location.href =
        "../../index.html";

}


//==================================================
// CENTRAR ELEMENTOS
//==================================================

function centrarEnElementos(){

    if(!capaMarcadores){

        return;

    }


    const capas =
        capaMarcadores.getLayers();


    if(!capas.length){

        return;

    }


    const grupo =
        L.featureGroup(capas);


    mapa.fitBounds(
        grupo.getBounds(),
        {
            padding:[
                40,
                40
            ]
        }
    );

}


//==================================================
// ACTUALIZAR MAPA
//==================================================

async function actualizarMapa(){

    mostrarMensaje(
        "Actualizando mapa...",
        ""
    );


    await cargarCategorias();

    await cargarLocalidades();

    await cargarElementos();

}


//==================================================
// REFRESCO AUTOMÁTICO
//==================================================

setInterval(
    function(){

        if(
            document.visibilityState
            ===
            "visible"
        ){

            cargarElementos();

        }

    },
    60000
);


//==================================================
// DEBUG
//==================================================

window.debugMapa =
    function(){

        console.log(
            "Mapa:",
            mapa
        );

        console.log(
            "Categorías:",
            categorias
        );

        console.table(
            categorias
        );

        console.log(
            "Localidades:",
            localidades
        );

        console.table(
            localidades
        );

        console.log(
            "Elementos:",
            elementos
        );

        console.table(
            elementos
        );

    };


//==================================================
// FIN mapa.js
//==================================================