// =====================================
// SGT - MAPA MOVILIDAD URBANA
// Dirección de Tránsito y Transportes
// =====================================


let mapa;

let ubicacionSeleccionada=null;

let marcadorTemporal=null;

let elementoEditando=null;



let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

) || [];





// =====================================
// INICIAR MAPA
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
// CARGAR ELEMENTOS
// =====================================


cargarMarcadores();







function cargarMarcadores(){


elementos.forEach(function(elemento){


crearMarcador(elemento);


});


}








// =====================================
// SELECCIONAR PUNTO
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
// ABRIR NUEVO ELEMENTO
// =====================================


function abrirNuevo(){



elementoEditando=null;



limpiarFormulario();



document
.getElementById("modal")
.style.display="flex";



}





function cerrarNuevo(){


document
.getElementById("modal")
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



if(!ubicacionSeleccionada && !elementoEditando){


alert("Seleccione una ubicación en el mapa");


return;


}




let elemento={



id:

elementoEditando

?

elementoEditando.id

:

Date.now(),





codigo:

document.getElementById("codigo").value,





tipo:

document.getElementById("tipo").value,





nombre:

document.getElementById("nombre").value,





descripcion:

document.getElementById("descripcion").value,





caracteristicas:

document

.getElementById("caracteristicas")

.value

.split("\n")

.filter(x=>x.trim()!==""),





estado:

elementoEditando

?

elementoEditando.estado

:

"Activo",





lat:

elementoEditando

?

elementoEditando.lat

:

ubicacionSeleccionada.lat,





lng:

elementoEditando

?

elementoEditando.lng

:

ubicacionSeleccionada.lng,





actuaciones:

elementoEditando

?

elementoEditando.actuaciones

:

[]



};







let nuevaActuacion =

document

.getElementById("actuacion")

.value;







if(nuevaActuacion!==""){



elemento.actuaciones.push({



fecha:

new Date()

.toLocaleDateString("es-UY"),




accion:

nuevaActuacion,




responsable:

usuarioActual

?

usuarioActual.nombre

:

"Sistema"



});



}






if(elementoEditando){



let posicion=

elementos.findIndex(

e=>e.id===elemento.id

);



elementos[posicion]=elemento;



}

else{



elementos.push(elemento);



}








localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);







cargarMapa();





cerrarNuevo();





alert(

"Elemento guardado correctamente"

);



}










// =====================================
// EDITAR ELEMENTO
// =====================================


function editarElemento(id){



elementoEditando=

elementos.find(

e=>e.id===id

);





if(!elementoEditando){

return;

}





document.getElementById("codigo").value=

elementoEditando.codigo;




document.getElementById("tipo").value=

elementoEditando.tipo;




document.getElementById("nombre").value=

elementoEditando.nombre;




document.getElementById("descripcion").value=

elementoEditando.descripcion;




document.getElementById("caracteristicas").value=

(elementoEditando.caracteristicas||[])

.join("\n");






ubicacionSeleccionada={



lat:elementoEditando.lat,


lng:elementoEditando.lng



};






document

.getElementById("modal")

.style.display="flex";



}








// =====================================
// RECARGAR MAPA
// =====================================


function cargarMapa(){



mapa.eachLayer(function(layer){



if(layer instanceof L.Marker){



mapa.removeLayer(layer);



}



});





cargarMarcadores();



}
// =====================================
// CREAR MARCADOR
// =====================================


function crearMarcador(elemento){



let icono="📍";



switch(elemento.tipo){


case "Semáforo":

icono="🚦";

break;


case "Paso peatonal":

icono="🚸";

break;


case "Parada de taxi":

icono="🚕";

break;


case "Carga y descarga":

icono="🚚";

break;


case "Cordón reservado":

icono="🅿️";

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


case "Cartel PARE":

icono="🛑";

break;


}




let marcador=L.marker([

elemento.lat,

elemento.lng

])

.addTo(mapa);






marcador.bindTooltip(`

<b>${icono} ${elemento.tipo}</b>

<br>

${elemento.codigo}

<br>

${elemento.nombre}

`);







marcador.bindPopup(`


<h3>

${elemento.nombre}

</h3>



<b>Código:</b>

${elemento.codigo}



<br><br>



<b>Tipo:</b>

${elemento.tipo}



<br><br>



<b>Estado:</b>

${elemento.estado}



<br><br>



<b>Descripción:</b>

<br>

${elemento.descripcion || "Sin datos"}



<br><br>



<b>Características</b>


<ul>

${

(elemento.caracteristicas||[])

.map(c=>`<li>${c}</li>`)

.join("")

}

</ul>



<b>Actuaciones</b>


<ul>

${

(elemento.actuaciones||[])

.map(a=>`

<li>

${a.fecha}

<br>

${a.accion}

<br>

${a.responsable}

</li>

`)

.join("")

}

</ul>



<button onclick="editarElemento(${elemento.id})">

Editar

</button>


<button onclick="eliminarElemento(${elemento.id})">

Eliminar

</button>



`);

}




// =====================================
// ELIMINAR
// =====================================


function eliminarElemento(id){



if(!confirm("¿Eliminar elemento?")){


return;


}



elementos=

elementos.filter(

e=>e.id!==id

);





localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);





cargarMapa();



}






// =====================================
// BUSCADOR
// =====================================


function buscarElemento(texto){



texto=

texto.toLowerCase();





elementos.forEach(function(e){



if(

e.nombre.toLowerCase()

.includes(texto)

||

e.codigo.toLowerCase()

.includes(texto)

||

e.tipo.toLowerCase()

.includes(texto)

){



mapa.setView(

[

e.lat,

e.lng

],

18

);



}



});



}






// =====================================
// FILTRO POR TIPO
// =====================================


function filtrarTipo(tipo){



cargarMapa();




if(tipo==="Todos"){


return;


}




elementos.forEach(function(e){



if(e.tipo!==tipo){



mapa.eachLayer(function(layer){



if(

layer instanceof L.Marker

&&

layer.getLatLng().lat===e.lat

&&

layer.getLatLng().lng===e.lng

){



mapa.removeLayer(layer);



}



});



}



});



}