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
// ZONAS DE ESTACIONAMIENTO
//==================================================

let capaZonasEstacionamiento = null;

let zonasEstacionamiento = [];

let dibujandoZona = false;

let puntosZona = [];

let lineaZona = null;

let poligonoZonaTemporal = null;


//==================================================
// CORDONES ROJOS
//==================================================

let capaCordonesRojos = null;

let cordonesRojos = [];

let dibujandoCordon = false;

let puntosCordon = [];

let lineaCordonTemporal = null;


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

    await cargarCordonesRojos();

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

    }catch(e){

        usuario = null;

    }


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
        document.getElementById(
            "map"
        );


    if(!elementoMapa){

        console.error(
            "No existe el elemento #map"
        );

        return;

    }


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

                pane:
                    "overlayPane"

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


    mapaCalles.addTo(
        mapa
    );


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
    ).addTo(
        mapa
    );


    //==============================================
    // CAPA MARCADORES
    //==============================================

    capaMarcadores =
        L.layerGroup()
        .addTo(mapa);


    //==============================================
    // CAPA ZONAS
    //==============================================

    capaZonasEstacionamiento =
        L.layerGroup()
        .addTo(mapa);


    capaCordonesRojos =
        L.layerGroup()
        .addTo(mapa);


    //==============================================
    // CLICK MAPA
    //==============================================

    mapa.on(
        "click",
        seleccionarUbicacion
    );


    //==============================================
    // CLICK DERECHO
    //==============================================

    mapa.on(
        "contextmenu",
        finalizarDibujoGeometrico
    );


    //==============================================
    // CORREGIR TAMAÑO
    //==============================================

    setTimeout(
        function(){

            if(mapa){

                mapa.invalidateSize();

            }

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


    console.log(
        "Respuesta categorías:",
        respuesta
    );


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


    console.log(
        "Categorías cargadas:",
        categorias
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

                    nombres.push(
                        nombre
                    );

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

                await cargarCategorias();

                await cargarLocalidades();

                await cargarElementos();

                await cargarZonasEstacionamiento();

                await cargarCordonesRojos();

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


    const btnNuevoCordon =
        document.getElementById(
            "btnNuevoCordon"
        );


    if(btnNuevoCordon){

        btnNuevoCordon.addEventListener(
            "click",
            iniciarDibujoCordon
        );

    }


    const btnCancelarCordon =
        document.getElementById(
            "btnCancelarCordon"
        );


    if(btnCancelarCordon){

        btnCancelarCordon.addEventListener(
            "click",
            cancelarDibujoCordon
        );

    }

}


//==================================================
// NUEVA UBICACION
//==================================================

function seleccionarUbicacion(e){

    if(dibujandoZona){

        agregarPuntoZona(
            e
        );

        return;

    }


    if(dibujandoCordon){

        agregarPuntoCordon(
            e
        );

        return;

    }


    const lat =
        e.latlng.lat;


    const lng =
        e.latlng.lng;


    const campoLat =
        document.getElementById(
            "lat"
        );


    const campoLng =
        document.getElementById(
            "lng"
        );


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
        )
        .addTo(mapa);


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


                if(
                    filtroTipo &&
                    normalizar(e.tipo)
                    !==
                    normalizar(filtroTipo)
                ){

                    return false;

                }


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
// CENTRAR LOCALIDAD SELECCIONADA
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


    const localidadSeleccionada =
        normalizar(
            filtroLocalidad.value
        );


    //==================================================
    // BUSCAR ELEMENTOS DE ESA LOCALIDAD
    //==================================================

    const elementosLocalidad =
        elementos.filter(
            function(e){

                const localidad =
                    e.localidadNombre ||
                    e.localidad ||
                    e.nombreLocalidad ||
                    "";


                return (
                    normalizar(localidad)
                    ===
                    localidadSeleccionada
                );

            }
        );


    //==================================================
    // OBTENER COORDENADAS
    //==================================================

    const puntos = [];


    elementosLocalidad.forEach(
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
                lat !== null &&
                lng !== null
            ){

                puntos.push([
                    lat,
                    lng
                ]);

            }

        }
    );


    //==================================================
    // SI HAY ELEMENTOS
    //==================================================

    if(puntos.length){

        const limites =
            L.latLngBounds(
                puntos
            );


        mapa.fitBounds(
            limites,
            {

                padding:[
                    80,
                    80
                ],

                maxZoom:15,

                animate:true,

                duration:0.8

            }
        );


        return;

    }


    //==================================================
    // SI NO HAY ELEMENTOS
    //==================================================

    console.warn(
        "No hay elementos para la localidad:",
        filtroLocalidad.value
    );


    mostrarMensaje(
        "No hay elementos registrados en esta localidad.",
        "error"
    );

}

//==================================================
// ICONO POI
//==================================================

function crearIcono(tipo){

    const categoria =
        obtenerCategoria(tipo);


    //================================================
    // MAPA DE ICONOS
    //================================================

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

        //============================================
        // PARADA DE BUS
        //============================================

        "bus":
            "fa-solid fa-bus",

        "bus-stop":
            "fa-solid fa-bus",

        "parada bus":
            "fa-solid fa-bus",

        "parada de bus":
            "fa-solid fa-bus",

        "parada de omnibus":
            "fa-solid fa-bus",

        "parada de ómnibus":
            "fa-solid fa-bus",

        //============================================
        // SONDA DE VELOCIDAD
        //============================================

        "speed":
            "fa-solid fa-gauge-high",

        "speed-sensor":
            "fa-solid fa-gauge-high",

        "sonda":
            "fa-solid fa-gauge-high",

        "sonda de velocidad":
            "fa-solid fa-gauge-high",

        "radar":
            "fa-solid fa-camera",

        //============================================
        // OTROS
        //============================================

        "otros":
            "fa-solid fa-location-dot"

    };


    //================================================
    // POR DEFECTO
    //================================================

    let claseIcono =
        "fa-solid fa-location-dot";


    let color =
        "gris";


    //================================================
    // CATEGORIA ENCONTRADA
    //================================================

    if(categoria){

        const iconoOriginal =
            String(
                categoria.icono ||
                ""
            )
            .trim();


        const iconoNormalizado =
            normalizar(
                iconoOriginal
            );


        const nombreNormalizado =
            normalizar(
                categoria.nombre
            );


        console.log(
            "================================"
        );


        console.log(
            "TIPO:",
            tipo
        );


        console.log(
            "CATEGORIA:",
            categoria
        );


        console.log(
            "ICONO:",
            iconoOriginal
        );


        console.log(
            "ICONO NORMALIZADO:",
            iconoNormalizado
        );


        //============================================
        // BUSCAR POR ICONO
        //============================================

        if(
            iconos[
                iconoNormalizado
            ]
        ){

            claseIcono =
                iconos[
                    iconoNormalizado
                ];

        }


        //============================================
        // BUSCAR POR NOMBRE
        //============================================

        else if(
            nombreNormalizado.includes(
                "parada"
            )
            &&
            (
                nombreNormalizado.includes(
                    "bus"
                )
                ||
                nombreNormalizado.includes(
                    "omnibus"
                )
            )
        ){

            claseIcono =
                "fa-solid fa-bus";

        }


        else if(
            nombreNormalizado.includes(
                "sonda"
            )
            &&
            nombreNormalizado.includes(
                "velocidad"
            )
        ){

            claseIcono =
                "fa-solid fa-gauge-high";

        }


        else if(
            nombreNormalizado.includes(
                "radar"
            )
        ){

            claseIcono =
                "fa-solid fa-camera";

        }


        //============================================
        // COLOR
        //============================================

        color =
            String(
                categoria.color ||
                "gris"
            )
            .trim()
            .toLowerCase();

    }


    //================================================
    // CREAR ICONO
    //================================================

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
                e.descripcion ||
                "-"
            )}

        </div>


        <div class="popup-linea">

            <strong>Características</strong><br>

            ${escapar(
                e.caracteristicas ||
                "-"
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

        tipo:
            tipo,

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
// ZONAS DE ESTACIONAMIENTO
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


    dibujandoZona =
        true;


    puntosZona =
        [];


    if(lineaZona){

        mapa.removeLayer(
            lineaZona
        );

        lineaZona =
            null;

    }


    if(poligonoZonaTemporal){

        mapa.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal =
            null;

    }


    const btnNuevaZona =
        document.getElementById(
            "btnNuevaZona"
        );


    const btnCancelarZona =
        document.getElementById(
            "btnCancelarZona"
        );


    const estadoZona =
        document.getElementById(
            "estadoZona"
        );


    if(btnNuevaZona){

        btnNuevaZona.style.display =
            "none";

    }


    if(btnCancelarZona){

        btnCancelarZona.style.display =
            "inline-block";

    }


    if(estadoZona){

        estadoZona.textContent =
            "Haga clic en el mapa para marcar los vértices. Clic derecho para cerrar.";

        estadoZona.className =
            "dibujando";

    }


    mapa.getContainer().style.cursor =
        "crosshair";


    mostrarMensaje(
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
        e.latlng.lat;


    const lng =
        e.latlng.lng;


    puntosZona.push([
        lat,
        lng
    ]);


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

                    color:
                        "#1976d2",

                    weight:
                        3,

                    dashArray:
                        "8,6"

                }
            )
            .addTo(mapa);

    }


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

                    color:
                        "#1976d2",

                    weight:
                        3,

                    fillColor:
                        "#42a5f5",

                    fillOpacity:
                        0.25,

                    interactive:
                        false

                }
            )
            .addTo(mapa);

    }


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
            ". Continúe haciendo clic o haga clic derecho para cerrar.";

    }

}


//--------------------------------------------------
// FINALIZAR ZONA
//--------------------------------------------------

async function finalizarZona(){

    if(!dibujandoZona){

        return;

    }


    if(puntosZona.length < 3){

        mostrarMensaje(
            "Una zona necesita al menos 3 puntos.",
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
    ){

        return;

    }


    const nombreLimpio =
        nombre.trim();


    if(!nombreLimpio){

        mostrarMensaje(
            "Debe ingresar un nombre para la zona.",
            "error"
        );

        return;

    }


    await guardarZonaEnServidor(
        nombreLimpio,
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
                )
                ||
                "{}"
            );


        const datos = {

            nombre:
                nombre,

            localidad:
                document.getElementById(
                    "filtroLocalidad"
                )?.value || "",

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
            "Guardando zona:",
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


        mostrarMensaje(
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


        mostrarMensaje(
            error.message ||
            "Error al guardar la zona.",
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

        console.warn(
            "No existe capa de zonas."
        );

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


        console.log(
            "Zonas cargadas:",
            zonasEstacionamiento.length
        );


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

            if(
                String(
                    zona.activo || ""
                )
                .toUpperCase()
                !==
                "SI"
            ){

                return;

            }


            let puntos;


            try{

                puntos =
                    JSON.parse(
                        zona.coordenadas
                    );

            }
            catch(error){

                console.error(
                    "Coordenadas inválidas:",
                    zona
                );

                return;

            }


            if(
                !Array.isArray(puntos) ||
                puntos.length < 3
            ){

                return;

            }


            const poligono =
                L.polygon(
                    puntos,
                    {

                        color:
                            "#e65100",

                        weight:
                            3,

                        fillColor:
                            "#ff9800",

                        fillOpacity:
                            0.22,

                        interactive:
                            true

                    }
                );


            poligono.bindPopup(

                `

                <div class="popup-zona">

                    <h3>

                        <i
                            class="fa-solid fa-square-parking">
                        </i>

                        ${escapar(
                            zona.nombre
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

                        ${escapar(
                            zona.localidadNombre ||
                            "Sin localidad"
                        )}

                    </p>


                    <p>

                        <strong>
                            Estado:
                        </strong>

                        Activa

                    </p>


                    <button
                        type="button"
                        class="btn-eliminar-zona"
                        onclick="
                            eliminarZonaEstacionamiento(
                                '${escaparAtributo(zona.id)}'
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-trash">
                        </i>

                        Eliminar zona

                    </button>

                </div>

                `

            );


            poligono.addTo(
                capaZonasEstacionamiento
            );

        }
    );

}


//--------------------------------------------------
// ELIMINAR ZONA
//--------------------------------------------------

async function eliminarZonaEstacionamiento(
    id
){

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


        console.log(
            "Respuesta eliminar zona:",
            respuesta
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


        mostrarMensaje(
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


        mostrarMensaje(
            error.message ||
            "No fue posible eliminar la zona.",
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


    mostrarMensaje(
        "Dibujo de zona cancelado.",
        ""
    );

}


//--------------------------------------------------
// LIMPIAR DIBUJO
//--------------------------------------------------

function limpiarDibujoZona(){

    dibujandoZona =
        false;


    puntosZona =
        [];


    if(lineaZona){

        mapa.removeLayer(
            lineaZona
        );

        lineaZona =
            null;

    }


    if(poligonoZonaTemporal){

        mapa.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal =
            null;

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
// ESC = CANCELAR ZONA
//==================================================

document.addEventListener(
    "keydown",
    function(e){

        if(
            e.key === "Escape" &&
            dibujandoZona
        ){

            cancelarDibujoZona();

        }

        if(
            e.key === "Escape" &&
            dibujandoCordon
        ){

            cancelarDibujoCordon();

        }

    }
);


//==================================================
// CORDONES ROJOS
//==================================================

function finalizarDibujoGeometrico(e){

    if(e && e.originalEvent){

        e.originalEvent.preventDefault();

    }

    if(dibujandoZona){

        finalizarZona();

        return;

    }

    if(dibujandoCordon){

        finalizarCordon();

    }

}


function iniciarDibujoCordon(){

    if(!mapa || dibujandoZona || dibujandoCordon){

        return;

    }

    dibujandoCordon = true;

    puntosCordon = [];

    if(lineaCordonTemporal){

        mapa.removeLayer(lineaCordonTemporal);

        lineaCordonTemporal = null;

    }

    const btnNuevo = document.getElementById("btnNuevoCordon");
    const btnCancelar = document.getElementById("btnCancelarCordon");
    const estado = document.getElementById("estadoCordon");

    if(btnNuevo){
        btnNuevo.style.display = "none";
    }

    if(btnCancelar){
        btnCancelar.style.display = "inline-block";
    }

    if(estado){

        estado.textContent =
            "Haga clic sobre el borde de la calle. Clic derecho para finalizar.";

        estado.className = "dibujando";

    }

    mapa.getContainer().style.cursor = "crosshair";

    mostrarMensaje(
        "Dibujando cordón rojo...",
        ""
    );

}


function agregarPuntoCordon(e){

    if(!dibujandoCordon){

        return;

    }

    puntosCordon.push([
        e.latlng.lat,
        e.latlng.lng
    ]);

    if(lineaCordonTemporal){

        mapa.removeLayer(lineaCordonTemporal);

    }

    lineaCordonTemporal =
        L.polyline(
            puntosCordon,
            {
                color: "#d50000",
                weight: 4,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
                interactive: false
            }
        )
        .addTo(mapa);

    const estado =
        document.getElementById("estadoCordon");

    if(estado){

        estado.textContent =
            "Puntos marcados: " +
            puntosCordon.length +
            ". Continúe o haga clic derecho para finalizar.";

    }

}


async function finalizarCordon(){

    if(!dibujandoCordon){

        return;

    }

    if(puntosCordon.length < 2){

        mostrarMensaje(
            "El cordón rojo necesita al menos 2 puntos.",
            "error"
        );

        return;

    }

    const nombre =
        prompt("Ingrese el nombre del cordón rojo:");

    if(nombre === null){

        return;

    }

    const nombreLimpio = nombre.trim();

    if(!nombreLimpio){

        mostrarMensaje(
            "Debe ingresar un nombre para el cordón rojo.",
            "error"
        );

        return;

    }

    try{

        const usuarioActual =
            JSON.parse(
                localStorage.getItem("usuarioActual") || "{}"
            );

        const filtroLocalidad =
            document.getElementById("filtroLocalidad");

        const respuesta =
            await apiGuardarCordonRojo({
                nombre: nombreLimpio,
                localidad: filtroLocalidad ? filtroLocalidad.value : "",
                coordenadas: JSON.stringify(puntosCordon),
                usuario:
                    usuarioActual.nombre ||
                    usuarioActual.usuario ||
                    "admin"
            });

        if(!respuesta || !respuesta.ok){

            throw new Error(
                respuesta?.mensaje ||
                "No fue posible guardar el cordón rojo."
            );

        }

        limpiarDibujoCordon();

        await cargarCordonesRojos();

        mostrarMensaje(
            "Cordón rojo guardado correctamente.",
            "exito"
        );

    }
    catch(error){

        console.error("Error guardando cordón rojo:", error);

        mostrarMensaje(
            error.message ||
            "No fue posible guardar el cordón rojo.",
            "error"
        );

    }

}


async function cargarCordonesRojos(){

    if(!capaCordonesRojos){

        return;

    }

    try{

        const respuesta =
            await apiObtenerCordonesRojos();

        if(!respuesta || !respuesta.ok){

            console.error(
                "Error cargando cordones rojos:",
                respuesta?.mensaje
            );

            return;

        }

        cordonesRojos =
            Array.isArray(respuesta.datos)
            ? respuesta.datos
            : [];

        mostrarCordonesRojos();

    }
    catch(error){

        console.error("Error cargando cordones rojos:", error);

    }

}


function mostrarCordonesRojos(){

    if(!capaCordonesRojos){

        return;

    }

    capaCordonesRojos.clearLayers();

    cordonesRojos.forEach(function(cordon){

        if(
            String(cordon.activo || "").toUpperCase()
            !== "SI"
        ){

            return;

        }

        let puntos;

        try{

            puntos = JSON.parse(cordon.coordenadas);

        }
        catch(error){

            console.error("Coordenadas inválidas:", cordon);

            return;

        }

        if(!Array.isArray(puntos) || puntos.length < 2){

            return;

        }

        const linea =
            L.polyline(
                puntos,
                {
                    color: "#d50000",
                    weight: 4,
                    opacity: 0.9,
                    lineCap: "round",
                    lineJoin: "round",
                    interactive: true
                }
            );

        linea.bindPopup(
            `
            <div class="popup-zona">
                <h3>
                    <i class="fa-solid fa-road"></i>
                    ${escapar(cordon.codigo || "CR")} -
                    ${escapar(cordon.nombre)}
                </h3>
                <p><strong>Cordón rojo</strong></p>
                <p>
                    <strong>Localidad:</strong>
                    ${escapar(cordon.localidad || "Sin localidad")}
                </p>
                <p><strong>Estado:</strong> Activo</p>
                <button
                    type="button"
                    class="btn-eliminar-zona"
                    onclick="eliminarCordonRojo('${escaparAtributo(cordon.id)}')"
                >
                    <i class="fa-solid fa-trash"></i>
                    Eliminar cordón
                </button>
            </div>
            `
        );

        linea.addTo(capaCordonesRojos);

    });

}


async function eliminarCordonRojo(id){

    if(!confirm("¿Está seguro de desactivar este cordón rojo?")){

        return;

    }

    try{

        const respuesta =
            await apiEliminarCordonRojo(id);

        if(!respuesta || !respuesta.ok){

            throw new Error(
                respuesta?.mensaje ||
                "No fue posible eliminar el cordón rojo."
            );

        }

        await cargarCordonesRojos();

        mostrarMensaje(
            "Cordón rojo desactivado correctamente.",
            "exito"
        );

    }
    catch(error){

        mostrarMensaje(
            error.message ||
            "No fue posible eliminar el cordón rojo.",
            "error"
        );

    }

}


function cancelarDibujoCordon(){

    limpiarDibujoCordon();

    mostrarMensaje("Dibujo de cordón cancelado.", "");

}


function limpiarDibujoCordon(){

    dibujandoCordon = false;

    puntosCordon = [];

    if(lineaCordonTemporal){

        mapa.removeLayer(lineaCordonTemporal);

        lineaCordonTemporal = null;

    }

    if(mapa){

        mapa.getContainer().style.cursor = "";

    }

    const btnNuevo = document.getElementById("btnNuevoCordon");
    const btnCancelar = document.getElementById("btnCancelarCordon");
    const estado = document.getElementById("estadoCordon");

    if(btnNuevo){
        btnNuevo.style.display = "inline-block";
    }

    if(btnCancelar){
        btnCancelar.style.display = "none";
    }

    if(estado){
        estado.textContent = "";
        estado.className = "";
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


//==================================================
// ESCAPAR ATRIBUTO
//==================================================

function escaparAtributo(valor){

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
        L.featureGroup(
            capas
        );


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

    await cargarCordonesRojos();

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

            cargarZonasEstacionamiento();

            cargarCordonesRojos();

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

    };


//==================================================
// FIN mapa.js
//==================================================
