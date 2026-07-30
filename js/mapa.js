// =====================================
// SGT - MAPA MOVILIDAD URBANA
// Google Sheets API
// =====================================


// URL API

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let mapa;

let elementos=[];

let elementosOriginales=[];

let filtroActual="Todos";

let ubicacionSeleccionada=null;

let marcadorTemporal=null;

let elementoEditando=null;




// =====================================
// CREAR MAPA
// =====================================


mapa = L.map("mapa").setView(

[-34.0958,-56.2142],

15

);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19,

attribution:"© OpenStreetMap"

}

).addTo(mapa);




// =====================================
// CARGAR DATOS
// =====================================


cargarElementos();





function cargarElementos(){


fetch(

API_URL+"?accion=elementos"

)


.then(r=>{


if(!r.ok){

throw new Error(
"HTTP "+r.status
);

}


return r.json();


})


.then(data=>{


console.log(
"DATOS SGT:",
data
);



if(!Array.isArray(data)){


console.error(
"Respuesta inválida:",
data
);


return;


}



elementosOriginales=data;


elementos=data;



dibujarMapa();



})


.catch(error=>{


console.error(
"ERROR API:",
error
);



alert(
"No se pudo conectar con la base de datos"
);


});


}







// =====================================
// DIBUJAR MAPA
// =====================================


function dibujarMapa(){



mapa.eachLayer(function(layer){



if(layer instanceof L.Marker){


mapa.removeLayer(layer);


}



});




elementos.forEach(function(e){


crearMarcador(e);


});



}








// =====================================
// CLICK MAPA
// =====================================


mapa.on(

"click",

function(e){



ubicacionSeleccionada=e.latlng;




if(marcadorTemporal){


mapa.removeLayer(marcadorTemporal);


}




marcadorTemporal=L.marker([

e.latlng.lat,

e.latlng.lng

])

.addTo(mapa)

.bindPopup(
"Ubicación seleccionada"
)

.openPopup();



}

);








// =====================================
// FORMULARIO
// =====================================


function abrirNuevo(){


elementoEditando=null;


limpiarFormulario();


document.getElementById("modal")
.style.display="flex";


}




function cerrarNuevo(){


document.getElementById("modal")
.style.display="none";


}





function limpiarFormulario(){


document.getElementById("codigo").value="";

document.getElementById("nombre").value="";

document.getElementById("descripcion").value="";

document.getElementById("caracteristicas").value="";

document.getElementById("actuacion").value="";


}








// =====================================
// GUARDAR ELEMENTO
// =====================================


function guardarElemento(){



if(!ubicacionSeleccionada){


alert(
"Seleccione un punto en el mapa"
);


return;


}




let elemento={


id:Date.now(),


codigo:
document.getElementById("codigo").value,


tipo:
document.getElementById("tipo").value,


nombre:
document.getElementById("nombre").value,


descripcion:
document.getElementById("descripcion").value,


caracteristicas:
document.getElementById("caracteristicas").value,


estado:"Activo",


lat:
ubicacionSeleccionada.lat,


lng:
ubicacionSeleccionada.lng,


responsable:

(typeof usuarioActual !== "undefined")

?

usuarioActual.nombre

:

"Sistema"



};





fetch(

API_URL,

{

method:"POST",

body:JSON.stringify({

accion:"guardarElemento",

datos:elemento

})

}

)

.then(r=>r.json())

.then(resp=>{


console.log(
"GUARDADO:",
resp
);


})

.catch(err=>{


console.error(
"ERROR GUARDANDO:",
err
);


});





elementosOriginales.push(elemento);


elementos.push(elemento);



dibujarMapa();



cerrarNuevo();



alert(

"Elemento guardado"

);



}









// =====================================
// MARCADORES
// =====================================


function crearMarcador(e){



let icono="📍";



switch(e.tipo){


case "Semáforo":

icono="🚦";

break;


case "Radar":

icono="📡";

break;


case "Cámara":

icono="📷";

break;


case "Lomo de burro":

icono="⚠️";

break;


case "Paso peatonal":

icono="🚸";

break;


case "Parada de taxi":

icono="🚕";

break;


}





let marker=L.marker([

Number(e.lat),

Number(e.lng)

])

.addTo(mapa);





marker.bindTooltip(

`

<b>${icono} ${e.tipo || ""}</b>

<br>

${e.nombre || ""}

`

);





marker.bindPopup(

`

<h3>${e.nombre || "Elemento"}</h3>


<b>Tipo:</b>

${e.tipo || "-"}

<br><br>


<b>Código:</b>

${e.codigo || "-"}

<br><br>


<b>Estado:</b>

${e.estado || "-"}

<br><br>


<b>Descripción:</b>

${e.descripcion || "-"}

`

);



}









// =====================================
// BUSCAR ELEMENTO
// =====================================


function buscarElemento(texto){



texto=texto.toLowerCase();



elementos=elementosOriginales.filter(function(e){



return (

(e.nombre || "")
.toLowerCase()
.includes(texto)

||

(e.codigo || "")
.toLowerCase()
.includes(texto)

||

(e.tipo || "")
.toLowerCase()
.includes(texto)


);



});



dibujarMapa();



}









// =====================================
// FILTRO POR TIPO
// =====================================


function filtrarTipo(tipo){



filtroActual=tipo;



if(tipo==="Todos"){


elementos=elementosOriginales;


}

else{


elementos=elementosOriginales.filter(function(e){


return e.tipo===tipo;


});


}



dibujarMapa();



}








// =====================================
// ACTUALIZAR DATOS
// =====================================


setInterval(

function(){


cargarElementos();


},

1800000

);
