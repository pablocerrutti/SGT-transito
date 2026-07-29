// =====================================
// SGT - MAPA MOVILIDAD URBANA
// =====================================


let mapa;


let ubicacionSeleccionada=null;


let marcadorTemporal=null;



let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

) || [];






// CREAR MAPA


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







// CARGAR MARCADORES


elementos.forEach(function(elemento){


crearMarcador(elemento);


});








// CLICK EN MAPA


mapa.on("click",function(e){



if(!puedeCrearElementos()){


return;


}



ubicacionSeleccionada=e.latlng;





if(marcadorTemporal){


mapa.removeLayer(marcadorTemporal);


}






marcadorTemporal=L.marker(

[

e.latlng.lat,

e.latlng.lng

]

)

.addTo(mapa);



marcadorTemporal.bindPopup(

"Ubicación seleccionada"

)

.openPopup();



});










// ABRIR MODAL


function abrirNuevo(){



if(!puedeCrearElementos()){


alert("No tiene permisos para crear elementos");


return;


}



document.getElementById("modal")

.style.display="flex";


}







function cerrarNuevo(){


document.getElementById("modal")

.style.display="none";


}










// GUARDAR ELEMENTO


function guardarElemento(){



if(!puedeCrearElementos()){


alert("No autorizado");


return;


}





if(!ubicacionSeleccionada){


alert("Seleccione una ubicación en el mapa");


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

document.getElementById("caracteristicas").value

.split("\n"),



actuaciones:[

{

fecha:new Date()

.toLocaleDateString("es-UY"),


accion:

document.getElementById("actuacion").value || "Alta del elemento",


responsable:

usuarioActual.nombre


}

],



lat:

ubicacionSeleccionada.lat,



lng:

ubicacionSeleccionada.lng,



estado:"Activo"



};







elementos.push(elemento);






localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);






crearMarcador(elemento);






cerrarNuevo();



alert(

"Elemento creado correctamente"

);



}











// CREAR MARCADOR


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


}





let marcador=L.marker(

[

elemento.lat,

elemento.lng

]

)

.addTo(mapa);






marcador.bindTooltip(

`

<b>${icono} ${elemento.tipo}</b>

<br>

${elemento.codigo}

<br>

${elemento.nombre}

`

);






marcador.bindPopup(

`

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

${elemento.descripcion}



<br><br>



<b>Características:</b>

<ul>

${elemento.caracteristicas

.map(c=>`<li>${c}</li>`)

.join("")}

</ul>



<b>Actuaciones:</b>

<ul>

${elemento.actuaciones

.map(a=>

`

<li>

${a.fecha}

<br>

${a.accion}

<br>

${a.responsable}

</li>

`

)

.join("")}

</ul>



`

);



}