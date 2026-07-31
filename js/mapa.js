// =====================================
// SGT - MAPA MOVILIDAD
// mapa.js
// =====================================


// URL API GOOGLE APPS SCRIPT
const API =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrn/exec";


// MAPA
let mapa;


// CAPA DE MARCADORES
let capaMarcadores = L.layerGroup();


// ELEMENTOS CARGADOS
let elementos = [];



// =====================================
// INICIALIZAR MAPA
// =====================================

function iniciarMapa(){

    mapa = L.map("mapa", {
        zoomControl:true
    }).setView(
        [-34.095, -56.214],
        14
    );


    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom:19,
            attribution:"© OpenStreetMap"
        }
    ).addTo(mapa);


    capaMarcadores.addTo(mapa);


    cargarElementos();

}




// =====================================
// CARGAR ELEMENTOS DESDE API
// =====================================

async function cargarElementos(){

    try{

        const respuesta = await fetch(API);

        const datos = await respuesta.json();


        console.log("Elementos recibidos:",datos);


        elementos = datos;


        mostrarMarcadores(elementos);


    }catch(error){

        console.error(
            "Error cargando elementos:",
            error
        );

    }

}




// =====================================
// MOSTRAR MARCADORES
// =====================================

function mostrarMarcadores(lista){


    capaMarcadores.clearLayers();



    lista.forEach(elemento=>{


        let lat =
        Number(elemento.lat);


        let lng =
        Number(elemento.lng);



        if(
            isNaN(lat) ||
            isNaN(lng)
        ){
            return;
        }



        let icono;



        switch(elemento.tipo){


            case "Semáforo":

                icono =
                crearIcono(
                    "green"
                );

            break;



            case "Señal":

                icono =
                crearIcono(
                    "blue"
                );

            break;



            default:

                icono =
                crearIcono(
                    "gray"
                );

        }




        let marcador =
        L.marker(
            [
                lat,
                lng
            ],
            {
                icon:icono
            }
        );



        marcador.addTo(
            capaMarcadores
        );



        marcador.bindPopup(`

            <div class="popup">

            <h3>
            ${elemento.tipo || ""}
            </h3>


            <b>
            Código:
            </b>
            ${elemento.codigo || ""}
            <br>


            <b>
            Ubicación:
            </b>
            ${elemento.rol || elemento.nombre || ""}
            <br>


            <b>
            Estado:
            </b>
            ${elemento.caracteristicas || ""}
            <br>


            <b>
            Descripción:
            </b>
            ${elemento.descripcion || ""}


            <br><br>


            <button onclick="verElemento(${elemento.id})">
            Ver detalle
            </button>


            </div>

        `);


    });


}




// =====================================
// CREAR ICONOS
// =====================================

function crearIcono(color){


    return L.divIcon({

        className:"marcador-custom",

        html:
        `
        <div class="pin ${color}">
        </div>
        `,


        iconSize:[
            25,
            25
        ]

    });


}




// =====================================
// VER ELEMENTO
// =====================================

function verElemento(id){


    let elemento =
    elementos.find(
        e=>e.id==id
    );


    if(!elemento)
    return;



    localStorage.setItem(
        "elementoSeleccionado",
        JSON.stringify(elemento)
    );


    window.location.href =
    "inspeccion.html";


}




// =====================================
// FILTRO
// =====================================

function filtrarTipo(tipo){


    if(
        tipo==="todos"
    ){

        mostrarMarcadores(
            elementos
        );

        return;

    }



    let filtrados =
    elementos.filter(
        e=>
        e.tipo===tipo
    );



    mostrarMarcadores(
        filtrados
    );

}




// =====================================
// UBICACIÓN DEL USUARIO
// =====================================

function miUbicacion(){


    if(
        !navigator.geolocation
    ){

        alert(
        "GPS no disponible"
        );

        return;

    }



    navigator.geolocation.getCurrentPosition(

        posicion=>{


            let lat =
            posicion.coords.latitude;


            let lng =
            posicion.coords.longitude;



            mapa.setView(
                [
                    lat,
                    lng
                ],
                17
            );



            L.marker(
                [
                    lat,
                    lng
                ]
            )
            .addTo(mapa)
            .bindPopup(
                "Ubicación actual"
            )
            .openPopup();



        },

        error=>{

            alert(
            "No se pudo obtener ubicación"
            );

        }

    );

}




// =====================================
// ARRANQUE
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    iniciarMapa();

});
