// =====================================
// SGT - ELEMENTOS
// elemento.js
// =====================================


const API =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let elementoActual = null;





// =====================================
// INICIO
// =====================================


document.addEventListener(
"DOMContentLoaded",
()=>{


cargarTipos();


cargarElementoEditar();


});








// =====================================
// CARGAR TIPOS
// =====================================


async function cargarTipos(){


try{


let respuesta =
await fetch(
API+"?accion=tipos"
);



let datos =
await respuesta.json();



let select =
document.getElementById(
"tipoId"
);



datos.forEach(tipo=>{


if(!tipo.tipo)
return;



let opcion =
document.createElement(
"option"
);



opcion.value =
tipo.id;



opcion.textContent =
tipo.tipo;



select.appendChild(
opcion
);



});


}
catch(error){

console.error(error);

}



}







// =====================================
// EDITAR ELEMENTO
// =====================================


function cargarElementoEditar(){



let guardado =
localStorage.getItem(
"elementoSeleccionado"
);



if(!guardado)
return;



elementoActual =
JSON.parse(
guardado
);



document.getElementById(
"titulo"
)
.innerText =
"Editar elemento";



document.getElementById(
"tipoId"
)
.value =
elementoActual.tipoId;



document.getElementById(
"codigo"
)
.value =
elementoActual.codigo;



document.getElementById(
"nombre"
)
.value =
elementoActual.nombre;



document.getElementById(
"descripcion"
)
.value =
elementoActual.descripcion;



document.getElementById(
"direccion"
)
.value =
elementoActual.direccion;



document.getElementById(
"lat"
)
.value =
elementoActual.lat;



document.getElementById(
"lng"
)
.value =
elementoActual.lng;



document.getElementById(
"estado"
)
.value =
elementoActual.estado;



document.getElementById(
"caracteristicas"
)
.value =
elementoActual.caracteristicas;



}








// =====================================
// GPS
// =====================================


function obtenerGPS(){



if(
!navigator.geolocation
){


alert(
"No existe GPS"
);


return;


}



navigator.geolocation.getCurrentPosition(

pos=>{


document.getElementById(
"lat"
)
.value =
pos.coords.latitude;



document.getElementById(
"lng"
)
.value =
pos.coords.longitude;



},

err=>{


alert(
"No se pudo obtener ubicación"
);


}

);



}







// =====================================
// GUARDAR
// =====================================


async function guardarElemento(){



let usuario =
JSON.parse(
localStorage.getItem(
"usuario"
)
);



let datos = {


tipoId:

document.getElementById(
"tipoId"
).value,


nombre:

document.getElementById(
"nombre"
).value,


descripcion:

document.getElementById(
"descripcion"
).value,


lat:

document.getElementById(
"lat"
).value,


lng:

document.getElementById(
"lng"
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


usuario:

usuario ?
usuario.usuario :
"desconocido"



};





let url =
API+
"?accion=nuevoElemento";



Object.keys(datos)
.forEach(campo=>{


url +=
"&"+
campo+
"="+
encodeURIComponent(
datos[campo]
);


});





let respuesta =
await fetch(url);



let resultado =
await respuesta.json();




if(
resultado.resultado==="OK"
){


alert(
"Elemento creado: "+
resultado.codigo
);



localStorage.removeItem(
"elementoSeleccionado"
);



volverMapa();



}
else{


alert(
"Error al guardar"
);


}



}






// =====================================
// VOLVER
// =====================================


function volverMapa(){


window.location.href =
"mapa.html";


}
