// =====================================
// SGT - MAPA MOVILIDAD URBANA
// Dirección de Tránsito y Transportes
// =====================================


let mapa;

let ubicacionSeleccionada = null;

let marcadorTemporal = null;


let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

) || [];





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
// CARGAR ELEMENTOS
// =====================================


elementos.forEach(function(elemento){

crearMarcador(elemento);

});








// =====================================
// SELECCIONAR UBICACIÓN
// =====================================


mapa.on("click",function(e){



ubicacionSeleccionada = e.latlng;




if(marcadorTemporal){

mapa.removeLayer(marcadorTemporal);

}




marcadorTemporal = L.marker([

e.latlng.lat,

e.latlng.lng

])

.addTo(mapa);



marcadorTemporal.bindPopup(

"Ubicación seleccionada"

)

.openPopup();



});









// =====================================
// MODAL
// =====================================


function abrirNuevo(){


document.getElementById("modal")

.style.display="flex";


}





function cerrarNuevo(){


document.getElementById("modal")

.style.display="none";


}









// =====================================
// GUARDAR ELEMENTO
// =====================================


function guardarElemento(){



console.log("Guardando elemento...");





if(!ubicacionSeleccionada){


alert(

"Debe seleccionar primero un punto en el mapa"

);


return;


}







let tipo = document.getElementById("tipo").value;



let codigo = document.getElementById("codigo").value;



let nombre = document.getElementById("nombre").value;



let descripcion = document.getElementById("descripcion").value;



let caracteristicas = document.getElementById("caracteristicas").value;



let actuacion = document.getElementById("actuacion").value;






if(codigo.trim()==="" || nombre.trim()===""){


alert(

"Complete código y nombre"

);


return;


}







let nuevoElemento = {



id:Date.now(),


codigo:codigo,


tipo:tipo,


nombre:nombre,


descripcion:descripcion,



caracteristicas:

caracteristicas

.split("\n")

.filter(x=>x.trim()!==""),



actuaciones:[


{

fecha:new Date()

.toLocaleDateString("es-UY"),


accion:

actuacion || "Alta del elemento",


responsable:

usuarioActual ? usuarioActual.nombre : "Sistema"

}


],




lat:ubicacionSeleccionada.lat,


lng:ubicacionSeleccionada.lng,



estado:"Activo"



};









elementos.push(nuevoElemento);








localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);








crearMarcador(nuevoElemento);








cerrarNuevo();








alert(

"Elemento guardado correctamente"

);






console.log(nuevoElemento);



}









// =====================================
// MARCADORES
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

<h3>${elemento.nombre}</h3>


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

${
(elemento.caracteristicas || [])

.map(c=>`<li>${c}</li>`)

.join("")
}

</ul>



<b>Actuaciones:</b>


<ul>

${
(elemento.actuaciones || [])

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

.join("")
}

</ul>

`

);



}