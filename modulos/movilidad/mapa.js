//==================================================
// SGT - MOVILIDAD URBANA
// mapa.js
//==================================================

let mapa = null;

let capaMarcadores = null;
let capaZonasEstacionamiento = null;

let marcadorNuevo = null;

let categorias = [];
let elementos = [];
let localidades = [];

let zonasEstacionamiento = [];


//==================================================
// VARIABLES - DIBUJO DE ZONAS
//==================================================

let dibujandoZona = false;

let puntosZona = [];

let lineaZona = null;

let poligonoZonaTemporal = null;


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

    await cargarZonasEstacionamiento();

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

    console.log(
        "Creando Leaflet..."
    );


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

    mapa =
        L.map("map").setView(
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
    // CAPA DE MARCADORES
    //==============================================

    capaMarcadores =
        L.layerGroup().addTo(mapa);


    //==============================================
    // CAPA DE ZONAS
    //==============================================

    capaZonasEstacionamiento =
        L.layerGroup().addTo(mapa);


    //==============================================
    // CLICK MAPA
    //
    // SI DIBUJAMOS ZONA:
    //     AGREGA VÉRTICE
    //
    // SI NO:
    //     CREA NUEVA UBICACIÓN
    //==============================================

    mapa.on(
        "click",
        function(e){

            if(dibujandoZona){

                agregarPuntoZona(e);

                return;

            }


            seleccionarUbicacion(e);

        }
    );


    //==============================================
    // CLICK DERECHO
    //
    // CERRAR POLÍGONO
    //==============================================

    mapa.on(
        "contextmenu",
        function(e){

            if(dibujandoZona){

                finalizarZona();

            }

        }
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


        const nombres = [];


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

                await actualizarMapa();

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


    //==============================================
    // DASHBOARD
    //==============================================

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


    //==============================================
    // INFORMES
    //==============================================

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


    //==============================================
    // SALIR
    //==============================================

    const salirBtn =
        document.getElementById(
            "btnSalir"
        );


    if(salirBtn){

        salirBtn.onclick =
            salir;

    }


    //==============================================
    // ZONA NUEVA
    //==============================================

    const btnNuevaZona =
        document.getElementById(
            "btnNuevaZona"
        );


    if(btnNuevaZona){

        btnNuevaZona.addEventListener(
            "click",
            iniciarDibujoZona
        );

    }


    //==============================================
    // CANCELAR ZONA
    //==============================================

    const btnCancelarZona =
        document.getElementById(
            "btnCancelarZona"
        );


    if(btnCancelarZona){

        btnCancelarZona.addEventListener(
            "click",
            cancelarDibujoZona
        );

    }

}


//==================================================
// NUEVA UBICACION
//==================================================

function seleccionarUbicacion(e){

    if(dibujandoZona){

        return;

    }


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


    try{

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
    catch(error){

        console.error(
            "Error cargando elementos:",
            error
        );


        mostrarMensaje(
            "Error cargando elementos.",
            "error"
        );

    }

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
        "bus":
            "fa-solid fa-bus",

        "speed":
            "fa-solid fa-gauge-high",

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
// POPUP ELEMENTO
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
                        '${escAtributo(e.id)}'
                    )
                "
            >
                📝 Inspecciones
            </button>


            <button
                class="btn-eliminar"
                onclick="
                    eliminarElemento(
                        '${escAtributo(e.id)}'
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
// ELIMINAR ELEMENTO
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
// GUARDAR ELEMENTO
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
// ZONAS DE ESTACIONAMIENTO TARIFADO
//==================================================


//--------------------------------------------------
// INICIAR DIBUJO
//--------------------------------------------------

function iniciarDibujoZona(){

    if(!mapa){

        return;

    }


    if(dibujandoZona){

        return;

    }


    dibujandoZona = true;

    puntosZona = [];


    //==============================================
    // LIMPIAR DIBUJO ANTERIOR
    //==============================================

    if(lineaZona){

        mapa.removeLayer(
            lineaZona
        );

        lineaZona = null;

    }


    if(poligonoZonaTemporal){

        mapa.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal = null;

    }


    //==============================================
    // OCULTAR BOTÓN NUEVA ZONA
    //==============================================

    const btnNuevaZona =
        document.getElementById(
            "btnNuevaZona"
        );


    const btnCancelarZona =
        document.getElementById(
            "btnCancelarZona"
        );


    if(btnNuevaZona){

        btnNuevaZona.style.display =
            "none";

    }


    if(btnCancelarZona){

        btnCancelarZona.style.display =
            "inline-block";

    }


    //==============================================
    // ESTADO
    //==============================================

    const estadoZona =
        document.getElementById(
            "estadoZona"
        );


    if(estadoZona){

        estadoZona.textContent =
            "Haga clic en el mapa para marcar los vértices. Clic derecho para cerrar.";

        estadoZona.className =
            "dibujando";

    }


    //==============================================
    // CURSOR
    //==============================================

    mapa.getContainer().style.cursor =
        "crosshair";


    mostrarMensajeMapa(
        "Dibujando zona de estacionamiento...",
        ""
    );

}


//--------------------------------------------------
// AGREGAR PUNTO
//--------------------------------------------------

function agregarPuntoZona(e){

    if(!dibujandoZona){

        return;

    }


    const lat =
        Number(
            e.latlng.lat
        );


    const lng =
        Number(
            e.latlng.lng
        );


    if(
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ){

        return;

    }


    puntosZona.push([
        Number(lat.toFixed(7)),
        Number(lng.toFixed(7))
    ]);


    console.log(
        "Punto zona:",
        puntosZona.length,
        lat,
        lng
    );


    //==============================================
    // LÍNEA
    //==============================================

    if(puntosZona.length >= 2){

        if(lineaZona){

            mapa.removeLayer(
                lineaZona
            );

        }


        lineaZona =
            L.polyline(
                puntosZona,
                {
                    color:"#1976d2",

                    weight:3,

                    dashArray:"8,6",

                    interactive:false
                }
            ).addTo(mapa);

    }


    //==============================================
    // POLÍGONO TEMPORAL
    //==============================================

    if(puntosZona.length >= 3){

        if(poligonoZonaTemporal){

            mapa.removeLayer(
                poligonoZonaTemporal
            );

        }


        poligonoZonaTemporal =
            L.polygon(
                puntosZona,
                {
                    color:"#1976d2",

                    weight:3,

                    fillColor:"#42a5f5",

                    fillOpacity:0.25,

                    interactive:false
                }
            ).addTo(mapa);

    }


    //==============================================
    // ESTADO
    //==============================================

    const estadoZona =
        document.getElementById(
            "estadoZona"
        );


    if(estadoZona){

        estadoZona.textContent =
            "Puntos marcados: "
            +
            puntosZona.length
            +
            ". Continúe o haga clic derecho para cerrar.";

    }

}


//--------------------------------------------------
// FINALIZAR
//--------------------------------------------------

function finalizarZona(){

    if(!dibujandoZona){

        return;

    }


    if(puntosZona.length < 3){

        mostrarMensajeMapa(
            "La zona necesita al menos 3 puntos.",
            "error"
        );

        return;

    }


    const nombre =
        prompt(
            "Ingrese el nombre de la zona de estacionamiento tarifado:"
        );


    if(
        nombre === null
        ||
        nombre.trim() === ""
    ){

        return;

    }


    guardarZonaEnServidor(
        nombre.trim(),
        puntosZona
    );

}


//--------------------------------------------------
// GUARDAR ZONA
//--------------------------------------------------

async function guardarZonaEnServidor(
    nombre,
    puntos
){

    try{

        const estadoZona =
            document.getElementById(
                "estadoZona"
            );


        if(estadoZona){

            estadoZona.textContent =
                "Guardando zona...";

        }


        const usuarioActual =
            JSON.parse(
                localStorage.getItem(
                    "usuarioActual"
                ) || "{}"
            );


        const datos = {

            nombre:
                nombre,

            coordenadas:
                JSON.stringify(
                    puntos
                ),

            usuario:
                usuarioActual.nombre ||
                usuarioActual.usuario ||
                "admin"

        };


        console.log(
            "Datos zona:",
            datos
        );


        const respuesta =
            await apiGuardarZonaEstacionamiento(
                datos
            );


        console.log(
            "Respuesta guardar zona:",
            respuesta
        );


        if(
            !respuesta ||
            !respuesta.ok
        ){

            throw new Error(
                respuesta?.mensaje ||
                "No fue posible guardar la zona."
            );

        }


        mostrarMensajeMapa(
            "Zona de estacionamiento guardada correctamente.",
            "exito"
        );


        limpiarDibujoZona();


        await cargarZonasEstacionamiento();

    }
    catch(error){

        console.error(
            "Error guardando zona:",
            error
        );


        mostrarMensajeMapa(
            error.message,
            "error"
        );


        const estadoZona =
            document.getElementById(
                "estadoZona"
            );


        if(estadoZona){

            estadoZona.textContent =
                "Error al guardar la zona.";

        }

    }

}


//--------------------------------------------------
// CARGAR ZONAS
//--------------------------------------------------

async function cargarZonasEstacionamiento(){

    if(!capaZonasEstacionamiento){

        return;

    }


    try{

        const respuesta =
            await apiObtenerZonasEstacionamiento();


        console.log(
            "Respuesta zonas:",
            respuesta
        );


        if(
            !respuesta ||
            !respuesta.ok
        ){

            console.error(
                "Error cargando zonas:",
                respuesta?.mensaje
            );

            return;

        }


        zonasEstacionamiento =
            Array.isArray(
                respuesta.datos
            )
            ?
            respuesta.datos
            :
            [];


        mostrarZonasEstacionamiento();

    }
    catch(error){

        console.error(
            "Error cargando zonas:",
            error
        );

    }

}


//--------------------------------------------------
// MOSTRAR ZONAS
//--------------------------------------------------

function mostrarZonasEstacionamiento(){

    if(!capaZonasEstacionamiento){

        return;

    }


    capaZonasEstacionamiento.clearLayers();


    zonasEstacionamiento.forEach(
        function(zona){

            //======================================
            // IGNORAR ZONAS INACTIVAS
            //======================================

            if(
                zona.activo &&
                String(
                    zona.activo
                ).toUpperCase() !== "SI"
            ){

                return;

            }


            let puntos = null;


            try{

                if(
                    Array.isArray(
                        zona.coordenadas
                    )
                ){

                    puntos =
                        zona.coordenadas;

                }else{

                    puntos =
                        JSON.parse(
                            zona.coordenadas
                        );

                }

            }
            catch(error){

                console.error(
                    "Coordenadas inválidas:",
                    zona
                );

                return;

            }


            if(
                !Array.isArray(puntos)
                ||
                puntos.length < 3
            ){

                return;

            }


            const poligono =
                L.polygon(
                    puntos,
                    {

                        color:"#e65100",

                        weight:3,

                        fillColor:"#ff9800",

                        fillOpacity:0.22,

                        interactive:true

                    }
                );


            //======================================
            // POPUP
            //======================================

            poligono.bindPopup(`

                <div class="popup-zona">

                    <h3>

                        <i class="fa-solid fa-square-parking"></i>

                        ${escZona(
                            zona.nombre ||
                            "Zona de estacionamiento"
                        )}

                    </h3>


                    <p>

                        <strong>
                            Zona de estacionamiento tarifado
                        </strong>

                    </p>


                    <p>

                        <strong>
                            Localidad:
                        </strong>

                        ${escZona(
                            zona.localidadNombre ||
                            zona.localidad ||
                            "Sin localidad"
                        )}

                    </p>


                    <p>

                        <strong>
                            Estado:
                        </strong>

                        ${
                            String(
                                zona.activo || "SI"
                            ).toUpperCase()
                            === "SI"
                            ?
                            "Activa"
                            :
                            "Inactiva"
                        }

                    </p>


                    <button
                        type="button"
                        class="btn-eliminar-zona"
                        onclick="
                            eliminarZonaEstacionamiento(
                                '${escAtributo(zona.id)}'
                            )
                        "
                    >

                        <i class="fa-solid fa-trash"></i>

                        Eliminar zona

                    </button>

                </div>

            `);


            poligono.addTo(
                capaZonasEstacionamiento
            );

        }
    );

}


//--------------------------------------------------
// ELIMINAR ZONA
//--------------------------------------------------

async function eliminarZonaEstacionamiento(id){

    if(
        !confirm(
            "¿Está seguro de eliminar esta zona de estacionamiento?"
        )
    ){

        return;

    }


    try{

        const respuesta =
            await apiEliminarZonaEstacionamiento(
                id
            );


        if(
            !respuesta ||
            !respuesta.ok
        ){

            throw new Error(
                respuesta?.mensaje ||
                "No fue posible eliminar la zona."
            );

        }


        mostrarMensajeMapa(
            "Zona eliminada correctamente.",
            "exito"
        );


        await cargarZonasEstacionamiento();

    }
    catch(error){

        console.error(
            "Error eliminando zona:",
            error
        );


        mostrarMensajeMapa(
            error.message,
            "error"
        );

    }

}


//--------------------------------------------------
// CANCELAR
//--------------------------------------------------

function cancelarDibujoZona(){

    limpiarDibujoZona();


    const estadoZona =
        document.getElementById(
            "estadoZona"
        );


    if(estadoZona){

        estadoZona.textContent =
            "Dibujo cancelado.";

        estadoZona.className =
            "";

    }

}


//--------------------------------------------------
// LIMPIAR DIBUJO
//--------------------------------------------------

function limpiarDibujoZona(){

    dibujandoZona = false;

    puntosZona = [];


    if(lineaZona){

        mapa.removeLayer(
            lineaZona
        );

        lineaZona = null;

    }


    if(poligonoZonaTemporal){

        mapa.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal = null;

    }


    if(mapa){

        mapa.getContainer().style.cursor =
            "";

    }


    const btnNuevaZona =
        document.getElementById(
            "btnNuevaZona"
        );


    const btnCancelarZona =
        document.getElementById(
            "btnCancelarZona"
        );


    if(btnNuevaZona){

        btnNuevaZona.style.display =
            "inline-block";

    }


    if(btnCancelarZona){

        btnCancelarZona.style.display =
            "none";

    }

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
// MENSAJE MAPA
//==================================================

function mostrarMensajeMapa(
    texto,
    tipo=""
){

    const elemento =
        document.getElementById(
            "mensajeMapa"
        );


    if(!elemento){

        return;

    }


    elemento.textContent =
        texto;


    elemento.className =
        "mensaje " +
        tipo;


    setTimeout(
        function(){

            elemento.textContent =
                "";

            elemento.className =
                "mensaje";

        },
        5000
    );

}


//==================================================
// ESCAPAR HTML
//==================================================

function escapar(valor){

    return String(
        valor || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function escZona(valor){

    return escapar(valor);

}


function escAtributo(valor){

    return String(
        valor || ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

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

    await cargarZonasEstacionamiento();


    mostrarMensaje(
        "Mapa actualizado.",
        "exito"
    );

}


//==================================================
// ESC = CANCELAR ZONA
//==================================================

document.addEventListener(
    "keydown",
    function(e){

        if(
            e.key === "Escape"
            &&
            dibujandoZona
        ){

            cancelarDibujoZona();

        }

    }
);


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

            cargarZonasEstacionamiento();

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


        console.log(
            "Zonas estacionamiento:",
            zonasEstacionamiento
        );


        console.table(
            zonasEstacionamiento
        );


        console.log(
            "Dibujando zona:",
            dibujandoZona
        );


        console.log(
            "Puntos zona:",
            puntosZona
        );

    };


//==================================================
// FIN mapa.js
//==================================================
