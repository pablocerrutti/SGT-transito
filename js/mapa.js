// =====================================
// SGT - MAPA MOVILIDAD URBANA
// Dirección de Tránsito y Transportes
// =====================================


// VARIABLES GLOBALES

let mapa;

let ubicacionSeleccionada = null;

let marcadorTemporal = null;



let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

) || [];




// =====================================
// INICIALIZAR MAPA
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
// CARGAR ELEMENTOS EXISTENTES
// =====================================


elementos.forEach(function(elemento){


crearMarcador(elemento);


});







// =====================================
// SELECCIONAR UBICACIÓN EN MAPA
// =====================================


mapa.on(

"click",

function(e){



ubicacionSeleccionada = e.latlng;





if(marcadorTemporal){


mapa.removeLayer(marcadorTemporal);


}






marcadorTemporal = L.marker(

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



}

);









// =====================================
// ABRIR / CERRAR MODAL
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



if(!ubicacionSeleccionada){


alert(

"Debe seleccionar una ubicación en el mapa"

);


return;


}






let tipo =

document.getElementById("tipo").value;






let codigo =

document.getElementById("codigo").value;






let nombre =

document.getElementById("nombre").value;






let descripcion =

document.getElementById("descripcion").value;






let caracteristicasTexto =

document.getElementById("caracteristicas").value;






let actuacion =

document.getElementById("actuacion").value;







if(

codigo==="" ||

nombre===""

){


alert(

"Debe completar código y nombre"

);


return;


}







let caracteristicas =

caracteristicasTexto

.split("\n")

.filter(c=>c.trim()!=="");








let nuevoElemento = {



id:Date.now(),



codigo:codigo,



tipo:tipo,



nombre:nombre,



descripcion:descripcion,



caracteristicas:caracteristicas,



actuaciones:[


{


fecha:new Date()

.toLocaleDateString("es-UY"),


accion:actuacion || "Alta del elemento",


responsable:"Sistema SGT"


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







limpiarFormulario();







cerrarNuevo();







alert(

"Elemento registrado correctamente"

);



}









// =====================================
// LIMPIAR FORMULARIO
// =====================================


function limpiarFormulario(){



document.getElementById("codigo").value="";


document.getElementById("nombre").value="";


document.getElementById("descripcion").value="";


document.getElementById("caracteristicas").value="";


document.getElementById("actuacion").value="";



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



}








let marcador = L.marker(

[

elemento.lat,

elemento.lng

]

)

.addTo(mapa);








// LEYENDA AL PASAR POR ENCIMA



marcador.bindTooltip(



`

<div>

<b>

${icono} ${elemento.tipo}

</b>

<br>

Código:

${elemento.codigo}

<br>

${elemento.nombre}

<br>

Estado:

${elemento.estado}

</div>

`,



{

direction:"top",

offset:[0,-10]

}



);









// FICHA COMPLETA AL HACER CLICK



marcador.bindPopup(



`

<div style="min-width:280px">



<h3>

${icono}

${elemento.nombre}

</h3>




<hr>




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


<p>

${elemento.descripcion || "Sin descripción"}

</p>





<b>Características:</b>



<ul>


${
elemento.caracteristicas

.map(

c=>`

<li>${c}</li>

`

)

.join("")

}


</ul>







<b>Actuaciones:</b>



<ul>


${
elemento.actuaciones

.map(

a=>`

<li>

${a.fecha}

<br>

${a.accion}

<br>

Responsable:

${a.responsable}

</li>

<br>

`

)

.join("")

}


</ul>





</div>



`



);



}