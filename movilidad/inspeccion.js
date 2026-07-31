// =====================================
// SGT - INSPECCIONES
// =====================================


const API =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";


let elemento;



document.addEventListener(
"DOMContentLoaded",
()=>{


elemento =
JSON.parse(
localStorage.getItem(
"elementoSeleccionado"
)
);



if(elemento){


document.getElementById(
"tituloElemento"
)
.innerHTML =

"Inspección: "+
elemento.codigo;


}


});







async function guardarInspeccion(){



let usuario =
JSON.parse(
localStorage.getItem(
"usuario"
)
);



let datos = {


idElemento:
elemento.id,


codigoElemento:
elemento.codigo,


fecha:
new Date()
.toISOString(),


usuario:

usuario ?
usuario.usuario:
"desconocido",



estadoAnterior:
elemento.estado,


estadoNuevo:

document.getElementById(
"estadoNuevo"
)
.value,



observacion:

document.getElementById(
"observacion"
)
.value,



foto:"",


lat:
elemento.lat,


lng:
elemento.lng



};





let url =
API+
"?accion=nuevaInspeccion";




Object.keys(datos)
.forEach(c=>{


url +=
"&"+
c+
"="+
encodeURIComponent(
datos[c]
);


});





let respuesta =
await fetch(url);



let resultado =
await respuesta.json();




if(resultado.resultado==="OK"){


alert(
"Inspección guardada"
);


volver();


}


else{


alert(
"Error al guardar"
);


}



}






function volver(){


window.location.href =
"ficha-elemento.html";


}
