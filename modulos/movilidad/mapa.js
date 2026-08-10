//======================================================
// ZONAS DE ESTACIONAMIENTO TARIFADO
//======================================================


//------------------------------------------------------
// REFERENCIAS
//------------------------------------------------------

const btnNuevaZona =
    document.getElementById("btnNuevaZona");

const btnCancelarZona =
    document.getElementById("btnCancelarZona");

const estadoZona =
    document.getElementById("estadoZona");



//------------------------------------------------------
// INICIAR DIBUJO
//------------------------------------------------------

if (btnNuevaZona) {

    btnNuevaZona.addEventListener(
        "click",
        iniciarDibujoZona
    );

}



//------------------------------------------------------
// CANCELAR DIBUJO
//------------------------------------------------------

if (btnCancelarZona) {

    btnCancelarZona.addEventListener(
        "click",
        cancelarDibujoZona
    );

}



//======================================================
// INICIAR
//======================================================

function iniciarDibujoZona() {

    if (dibujandoZona) {

        return;

    }


    dibujandoZona = true;

    puntosZona = [];


    if (lineaZona) {

        map.removeLayer(lineaZona);

        lineaZona = null;

    }


    if (poligonoZonaTemporal) {

        map.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal = null;

    }


    btnNuevaZona.style.display =
        "none";


    btnCancelarZona.style.display =
        "inline-block";


    estadoZona.textContent =
        "Haga clic en el mapa para marcar los vértices de la zona.";

    estadoZona.className =
        "dibujando";


    map.getContainer().style.cursor =
        "crosshair";


    map.on(
        "click",
        agregarPuntoZona
    );

}



//======================================================
// AGREGAR PUNTO
//======================================================

function agregarPuntoZona(e) {

    if (!dibujandoZona) {

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


    //==================================================
    // SI YA TENEMOS DOS PUNTOS
    //==================================================

    if (puntosZona.length >= 2) {

        if (lineaZona) {

            map.removeLayer(lineaZona);

        }


        lineaZona =
            L.polyline(
                puntosZona,
                {
                    color: "#1976d2",
                    weight: 3,
                    dashArray: "8,6"
                }
            ).addTo(map);

    }


    //==================================================
    // MOSTRAR POLÍGONO DESDE EL TERCER PUNTO
    //==================================================

    if (puntosZona.length >= 3) {

        if (poligonoZonaTemporal) {

            map.removeLayer(
                poligonoZonaTemporal
            );

        }


        poligonoZonaTemporal =
            L.polygon(
                puntosZona,
                {
                    color: "#1976d2",
                    weight: 3,
                    fillColor: "#42a5f5",
                    fillOpacity: 0.25
                }
            ).addTo(map);

    }


    estadoZona.textContent =
        "Puntos marcados: "
        + puntosZona.length
        + ". Haga clic nuevamente para continuar.";

}



//======================================================
// FINALIZAR POLÍGONO
//======================================================

function finalizarZona() {

    if (!dibujandoZona) {

        return;

    }


    if (puntosZona.length < 3) {

        mostrarMensajeMapa(
            "Una zona necesita al menos 3 puntos.",
            "error"
        );

        return;

    }


    const nombre =
        prompt(
            "Ingrese el nombre de la zona de estacionamiento tarifado:"
        );


    if (
        nombre === null ||
        nombre.trim() === ""
    ) {

        return;

    }


    guardarZonaEnServidor(
        nombre.trim(),
        puntosZona
    );

}



//======================================================
// GUARDAR
//======================================================

async function guardarZonaEnServidor(
    nombre,
    puntos
) {


    try {


        estadoZona.textContent =
            "Guardando zona...";


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


        const respuesta =
            await apiGuardarZonaEstacionamiento(
                datos
            );


        if (!respuesta.ok) {

            throw new Error(
                respuesta.mensaje ||
                "No fue posible guardar la zona."
            );

        }


        mostrarMensajeMapa(
            "Zona de estacionamiento guardada correctamente.",
            "exito"
        );


        limpiarDibujoZona();


        cargarZonasEstacionamiento();


    }
    catch(error) {


        mostrarMensajeMapa(
            error.message,
            "error"
        );


        estadoZona.textContent =
            "Error al guardar la zona.";

    }

}



//======================================================
// CARGAR ZONAS
//======================================================

async function cargarZonasEstacionamiento() {


    try {


        const respuesta =
            await apiObtenerZonasEstacionamiento();


        if (!respuesta.ok) {

            console.error(
                "Error cargando zonas:",
                respuesta.mensaje
            );

            return;

        }


        zonasEstacionamiento =
            respuesta.datos || [];


        mostrarZonasEstacionamiento();


    }
    catch(error) {


        console.error(
            "Error cargando zonas:",
            error
        );

    }

}



//======================================================
// MOSTRAR ZONAS
//======================================================

function mostrarZonasEstacionamiento() {


    capaZonasEstacionamiento.clearLayers();


    zonasEstacionamiento.forEach(
        function(zona) {


            let puntos;


            try {

                puntos =
                    JSON.parse(
                        zona.coordenadas
                    );

            }
            catch(error) {

                console.error(
                    "Coordenadas inválidas:",
                    zona
                );

                return;

            }


            if (
                !Array.isArray(puntos) ||
                puntos.length < 3
            ) {

                return;

            }


            const poligono =
                L.polygon(
                    puntos,
                    {

                        color: "#e65100",

                        weight: 3,

                        fillColor: "#ff9800",

                        fillOpacity: 0.22,

                        interactive: true

                    }
                );


            poligono.bindPopup(`

                <div class="popup-zona">

                    <h3>
                        <i class="fa-solid fa-square-parking"></i>
                        ${escZona(zona.nombre)}
                    </h3>

                    <p>
                        <strong>
                            Zona de estacionamiento tarifado
                        </strong>
                    </p>

                    <p>
                        Localidad:
                        ${escZona(
                            zona.localidadNombre ||
                            "Sin localidad"
                        )}
                    </p>

                    <p>
                        Estado:
                        ${
                            zona.activo === "SI"
                            ? "Activa"
                            : "Inactiva"
                        }
                    </p>

                    <button
                        type="button"
                        class="btn-eliminar-zona"
                        onclick="eliminarZonaEstacionamiento('${escAtributo(zona.id)}')">

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



//======================================================
// ELIMINAR ZONA
//======================================================

async function eliminarZonaEstacionamiento(
    id
) {


    if (
        !confirm(
            "¿Está seguro de eliminar esta zona de estacionamiento?"
        )
    ) {

        return;

    }


    try {


        const respuesta =
            await apiEliminarZonaEstacionamiento(
                id
            );


        if (!respuesta.ok) {

            throw new Error(
                respuesta.mensaje ||
                "No fue posible eliminar la zona."
            );

        }


        mostrarMensajeMapa(
            "Zona eliminada correctamente.",
            "exito"
        );


        cargarZonasEstacionamiento();


    }
    catch(error) {


        mostrarMensajeMapa(
            error.message,
            "error"
        );

    }

}



//======================================================
// CANCELAR
//======================================================

function cancelarDibujoZona() {

    limpiarDibujoZona();


    estadoZona.textContent =
        "Dibujo cancelado.";

}



//======================================================
// LIMPIAR DIBUJO
//======================================================

function limpiarDibujoZona() {


    dibujandoZona = false;

    puntosZona = [];


    if (lineaZona) {

        map.removeLayer(
            lineaZona
        );

        lineaZona = null;

    }


    if (poligonoZonaTemporal) {

        map.removeLayer(
            poligonoZonaTemporal
        );

        poligonoZonaTemporal = null;

    }


    map.off(
        "click",
        agregarPuntoZona
    );


    map.getContainer().style.cursor =
        "";


    if (btnNuevaZona) {

        btnNuevaZona.style.display =
            "inline-block";

    }


    if (btnCancelarZona) {

        btnCancelarZona.style.display =
            "none";

    }

}



//======================================================
// CLIC DERECHO = CERRAR POLÍGONO
//======================================================

map.on(
    "contextmenu",
    function() {

        if (!dibujandoZona) {

            return;

        }


        finalizarZona();

    }
);



//======================================================
// ESC = CANCELAR
//======================================================

document.addEventListener(
    "keydown",
    function(e) {

        if (
            e.key === "Escape" &&
            dibujandoZona
        ) {

            cancelarDibujoZona();

        }

    }
);



//======================================================
// ESCAPAR HTML
//======================================================

function escZona(valor) {

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


function escAtributo(valor) {

    return String(
        valor || ""
    )
    .replace(
        /'/g,
        "\\'"
    );

}



//======================================================
// MENSAJE MAPA
//======================================================

function mostrarMensajeMapa(
    texto,
    tipo
) {

    const elemento =
        document.getElementById(
            "mensajeMapa"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        texto;


    elemento.className =
        "mensaje "
        + (tipo || "");


    setTimeout(
        function() {

            elemento.textContent =
                "";

            elemento.className =
                "mensaje";

        },
        5000
    );

}



//======================================================
// CARGAR AL INICIAR
//======================================================

cargarZonasEstacionamiento();
