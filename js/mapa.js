// =====================================
// SGT - MAPA MOVILIDAD
// =====================================


const API =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let mapa;

let marcadores=[];

let elementos=[];

let zonas=[];


let camadaElementos = L.layerGroup();

let camadaZonas = new L.FeatureGroup();


let poligonoTemporal=null;

let drawControl;




// =====================================
// INICIO
// =====================================


window.onload=function(){

    iniciarMapa();

};






// =====================================
// CREAR MAPA
// =====================================


function iniciarMapa(){



    mapa=L.map("mapa").setView(

        [-34.0956,-56.2148],

        14

    );





    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap"

        }

    ).addTo(mapa);






    camadaElementos.addTo(mapa);


    camadaZonas.addTo(mapa);







    drawControl=new L.Control.Draw({


        draw:{


            polygon:{


                allowIntersection:false,


                showArea:true,


                shapeOptions:{


                    color:"#2196F3",


                    weight:3,


                    fillOpacity:0.35


                }


            },


            polyline:false,

            rectangle:false,

            circle:false,

            circlemarker:false,

            marker:false


        },



        edit:{


            featureGroup:camadaZonas


        }



    });





    mapa.addControl(drawControl);






    // EVENTO DIBUJO

    mapa.on(

        L.Draw.Event.CREATED,

        zonaCreada

    );





    mapa.on(

        L.Draw.Event.EDITED,

        zonaEditada

    );





    mapa.on(

        L.Draw.Event.DELETED,

        zonaEliminada

    );







    cargarElementos();


    cargarZonas();



}
// =====================================
// ACTIVAR DIBUJO DE ZONA
// =====================================


function activarDibujoZona(){


    let herramienta = new L.Draw.Polygon(

        mapa,

        {

            allowIntersection:false,


            showArea:true,


            shapeOptions:{


                color:"#2196F3",

                weight:3,

                fillOpacity:0.35


            }


        }

    );


    herramienta.enable();


}






// =====================================
// CUANDO SE CREA POLIGONO
// =====================================


function zonaCreada(e){



    if(poligonoTemporal){


        mapa.removeLayer(poligonoTemporal);


    }




    poligonoTemporal=e.layer;



    poligonoTemporal.setStyle({


        color:"#2196F3",

        fillColor:"#2196F3",

        fillOpacity:0.35


    });





    mapa.addLayer(poligonoTemporal);





    document.getElementById(

        "modalZona"

    ).style.display="flex";



}








// =====================================
// CERRAR MODAL ZONA
// =====================================


function cerrarZona(){



    document.getElementById(

        "modalZona"

    ).style.display="none";





    if(poligonoTemporal){


        mapa.removeLayer(poligonoTemporal);


        poligonoTemporal=null;


    }



}









// =====================================
// GUARDAR ZONA
// =====================================


function guardarZona(){



    if(!poligonoTemporal){


        alert(

            "Primero dibuje una zona"

        );


        return;


    }





    let nombre=document.getElementById(

        "zonaNombre"

    ).value.trim();





    let tipo=document.getElementById(

        "zonaTipo"

    ).value;





    let color=document.getElementById(

        "zonaColor"

    ).value;






    if(nombre===""){


        alert(

            "Ingrese nombre de zona"

        );


        return;


    }






    poligonoTemporal.setStyle({


        color:color,

        fillColor:color,

        fillOpacity:0.35,

        weight:3


    });





    poligonoTemporal.bindPopup(


        "<b>"+nombre+"</b><br>"+tipo


    );






    camadaZonas.addLayer(

        poligonoTemporal

    );







    let coordenadas=[];





    poligonoTemporal

    .getLatLngs()[0]

    .forEach(function(p){



        coordenadas.push({


            lat:p.lat,


            lng:p.lng



        });



    });







    let zona={



        nombre:nombre,


        tipo:tipo,


        color:color,


        coordenadas:coordenadas



    };







    guardarZonaServidor(zona);






    document.getElementById(

        "modalZona"

    ).style.display="none";







    document.getElementById(

        "zonaNombre"

    ).value="";




    poligonoTemporal=null;



}
// =====================================
// GUARDAR ZONA EN GOOGLE SHEETS
// =====================================


async function guardarZonaServidor(zona){


    try{


        let respuesta = await fetch(API,{


            method:"POST",


            headers:{


                "Content-Type":"application/json"


            },


            body:JSON.stringify({


                accion:"guardarZona",


                nombre:zona.nombre,


                tipo:zona.tipo,


                color:zona.color,


                coordenadas:JSON.stringify(

                    zona.coordenadas

                )


            })



        });






        let resultado = await respuesta.json();






        if(resultado.ok){



            console.log(

                "Zona guardada"

            );



            cargarZonas();



        }

        else{


            alert(

                "No se pudo guardar la zona"

            );


        }





    }

    catch(error){



        console.error(error);



        alert(

            "Error conectando con servidor"

        );



    }



}








// =====================================
// CARGAR ZONAS DESDE SHEETS
// =====================================


async function cargarZonas(){



    try{



        camadaZonas.clearLayers();





        let respuesta = await fetch(

            API+"?accion=zonas"

        );





        let lista = await respuesta.json();





        if(!Array.isArray(lista)){


            return;


        }





        zonas=lista;





        lista.forEach(function(zona){



            dibujarZona(zona);



        });





    }

    catch(error){


        console.error(

            "Error cargando zonas",

            error

        );


    }



}









// =====================================
// DIBUJAR ZONA DESDE DATOS
// =====================================


function dibujarZona(zona){



    let coordenadas=[];





    try{



        if(typeof zona.coordenadas==="string"){


            coordenadas=

            JSON.parse(

                zona.coordenadas

            );


        }

        else{


            coordenadas=zona.coordenadas;


        }





    }

    catch(e){



        console.error(

            "Error coordenadas zona",

            e

        );


        return;


    }







    let puntos=[];





    coordenadas.forEach(function(p){



        puntos.push([


            Number(p.lat),


            Number(p.lng)



        ]);



    });








    let poligono=L.polygon(


        puntos,


        {


            color:

            zona.color || "#2196F3",



            fillColor:

            zona.color || "#2196F3",



            fillOpacity:0.35,



            weight:3



        }



    );







    poligono.bindPopup(


        "<b>"+

        zona.nombre+

        "</b><br>"+

        zona.tipo


    );






    camadaZonas.addLayer(

        poligono

    );



}
// =====================================
// LIMPIAR ZONAS
// =====================================


function limpiarZonas(){


    camadaZonas.clearLayers();


}







// =====================================
// ACTUALIZAR ZONAS
// =====================================


function actualizarZonas(){


    limpiarZonas();


    cargarZonas();


}







// =====================================
// IR A UNA ZONA
// =====================================


function irAZona(nombre){



    camadaZonas.eachLayer(function(layer){



        let popup=layer.getPopup();



        if(!popup){

            return;

        }





        let contenido=popup.getContent();





        if(contenido.includes(nombre)){



            mapa.fitBounds(

                layer.getBounds()

            );



            layer.openPopup();



        }





    });



}









// =====================================
// OBTENER COORDENADAS
// =====================================


function obtenerCoordenadas(layer){



    let puntos=[];





    layer.getLatLngs()[0]

    .forEach(function(p){



        puntos.push({



            lat:p.lat,



            lng:p.lng



        });



    });





    return puntos;



}








// =====================================
// EVENTO EDITAR ZONA
// =====================================


function zonaEditada(e){



    e.layers.eachLayer(function(layer){



        let nuevasCoordenadas=

        obtenerCoordenadas(layer);





        console.log(

            "Zona modificada",

            nuevasCoordenadas

        );





        // Aquí luego agregamos

        // actualización en Sheets



    });



}








// =====================================
// EVENTO ELIMINAR ZONA
// =====================================


function zonaEliminada(e){



    e.layers.eachLayer(function(layer){



        console.log(

            "Zona eliminada"

        );



        // Aquí luego agregamos

        // eliminación en Sheets



    });



}








// =====================================
// CARGAR ELEMENTOS
// =====================================


async function cargarElementos(){



    try{



        let respuesta=await fetch(

            API+"?accion=elementos"

        );



        let datos=await respuesta.json();




        elementos=datos;



        console.log(

            "Elementos cargados",

            elementos

        );



    }

    catch(error){


        console.error(

            "Error elementos",

            error

        );


    }


}








// =====================================
// BUSCAR ELEMENTOS
// =====================================


function buscarElemento(texto){



    texto=texto.toLowerCase();





    console.log(

        "Buscando:",

        texto

    );



}








// =====================================
// FILTRO TIPO
// =====================================


function filtrarTipo(tipo){



    console.log(

        "Filtro:",

        tipo

    );



}