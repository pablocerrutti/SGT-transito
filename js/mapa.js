// =====================================
// SGT - MAPA MOVILIDAD URBANA
// Google Sheets API + Inspecciones + Fotos
// =====================================


// URL API

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let mapa;

let elementos=[];

let elementosOriginales=[];

let inspecciones=[];

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
// CARGA INICIAL
// =====================================


cargarElementos();

cargarInspecciones();









// =====================================
// CARGAR ELEMENTOS
// =====================================


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

"DATOS ELEMENTOS:",

data

);





if(!Array.isArray(data)){


console.error(

"Respuesta inválida",

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
// CARGAR INSPECCIONES
// =====================================


function cargarInspecciones(){



fetch(

API_URL+"?accion=inspecciones"

)



.then(r=>r.json())



.then(data=>{


console.log(

"DATOS INSPECCIONES:",

data

);





if(Array.isArray(data)){


inspecciones=data;



dibujarMapa();


}



})



.catch(error=>{


console.error(

"Error inspecciones:",

error

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
// FORMULARIO ELEMENTO
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







let historial = inspecciones.filter(function(i){


return String(i.elementoId) === String(e.id);


});






let textoInspecciones="";





if(historial.length===0){


textoInspecciones="Sin inspecciones registradas";


}

else{



historial.forEach(function(i){



textoInspecciones += `



<hr>


<b>Fecha:</b>

${i.fecha || "-"}


<br>


<b>Estado:</b>

${i.estado || "-"}


<br>


<b>Observación:</b>

${i.observacion || "-"}


<br>



${i.foto ?


`

<a href="${i.foto}" target="_blank">

📷 Ver fotografía

</a>

`

:

""



}


`;



});



}







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



<h4>📋 Inspecciones</h4>



${textoInspecciones}



<br>



<button onclick="nuevaInspeccion('${e.id}')">

➕ Nueva inspección

</button>



`

);



}










// =====================================
// NUEVA INSPECCION
// =====================================


function nuevaInspeccion(id){



document.getElementById(

"inspeccionElementoId"

).value=id;




document.getElementById(

"modalInspeccion"

)

.style.display="flex";


}







function cerrarInspeccion(){


document.getElementById(

"modalInspeccion"

)

.style.display="none";



}









// =====================================
// GUARDAR INSPECCION CON FOTO
// =====================================


function guardarInspeccion(){



let archivo = document.getElementById(

"fotoInspeccion"

).files[0];







let inspeccion={



id:Date.now(),



elementoId:

document.getElementById(

"inspeccionElementoId"

).value,




fecha:

new Date().toISOString(),




usuario:

(typeof usuarioActual !== "undefined")

?

usuarioActual.nombre

:

"Sistema",




estado:

document.getElementById(

"inspeccionEstado"

).value,




observacion:

document.getElementById(

"inspeccionObservacion"

).value,




foto:""



};









if(archivo){



let lector = new FileReader();






lector.onload=function(){



inspeccion.fotoBase64 = lector.result.split(",")[1];



enviarInspeccion(inspeccion);



};





lector.readAsDataURL(archivo);



}

else{



enviarInspeccion(inspeccion);



}



}









// =====================================
// ENVIAR INSPECCION API
// =====================================


function enviarInspeccion(inspeccion){



fetch(

API_URL,

{

method:"POST",

body:JSON.stringify({

accion:"guardarInspeccion",

datos:inspeccion

})

}

)





.then(r=>r.json())

.then(resp=>{



console.log(

"RESPUESTA INSPECCION:",

resp

);





alert(

"Inspección guardada correctamente"

);





cerrarInspeccion();





document.getElementById(

"inspeccionObservacion"

).value="";



document.getElementById(

"fotoInspeccion"

).value="";





cargarInspecciones();



})



.catch(error=>{



console.error(

"ERROR INSPECCION:",

error

);



alert(

"No se pudo guardar la inspección"

);



});



}









// =====================================
// BUSCAR
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
// FILTRO
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
// ACTUALIZACION AUTOMATICA
// =====================================


setInterval(

function(){


cargarElementos();

cargarInspecciones();



},

1800000

);
