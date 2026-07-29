// =====================================
// SGT - CONTROL MOVILIDAD URBANA
// =====================================


// CONTROL DE SESIÓN

let usuarioActual = JSON.parse(
    localStorage.getItem("usuarioActual")
);



if(!usuarioActual){

    alert("Debe iniciar sesión");

    window.location="../login.html";

}




// CONTROL DE PERMISOS

if(
usuarioActual.rol !== "Administrador" &&
usuarioActual.rol !== "Movilidad Urbana"
){

    alert("No tiene permisos para este módulo");

    window.location="../login.html";

}




// ===============================
// MAPA
// ===============================


let mapa = L.map('mapa').setView(
    [-34.0958,-56.2142],
    15
);



L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19,
attribution:'© OpenStreetMap'
}
).addTo(mapa);





let posicionSeleccionada = null;

let marcadorTemporal = null;



let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

)||[];





// Cargar elementos existentes


elementos.forEach(elemento=>{


crearMarcador(elemento);


});






// Click mapa


mapa.on('click',function(e){



posicionSeleccionada=e.latlng;



document.getElementById("latitud").value =
e.latlng.lat.toFixed(6);



document.getElementById("longitud").value =
e.latlng.lng.toFixed(6);





if(marcadorTemporal){

mapa.removeLayer(marcadorTemporal);

}




marcadorTemporal=L.marker(e.latlng)
.addTo(mapa);



});







// Abrir modal


let botonNuevo =
document.getElementById("nuevoElemento");



if(botonNuevo){


botonNuevo.onclick=function(){


document.getElementById("modalElemento")
.style.display="flex";


}


}








// Cancelar


let cancelar =
document.getElementById("cancelar");



if(cancelar){


cancelar.onclick=function(){


document.getElementById("modalElemento")
.style.display="none";


}


}







// Guardar elemento


let guardar =
document.getElementById("guardar");



if(guardar){


guardar.onclick=function(){



let tipo =
document.getElementById("tipo").value;



let nombre =
document.getElementById("nombre").value;



let descripcion =
document.getElementById("descripcion").value;






if(!posicionSeleccionada){


alert("Seleccione ubicación en el mapa");


return;


}





if(tipo=="" || nombre==""){


alert("Complete los datos");


return;


}







let nuevo={


id:Date.now(),


tipo:tipo,


nombre:nombre,


descripcion:descripcion,


lat:posicionSeleccionada.lat,


lng:posicionSeleccionada.lng,


estado:"Activo"


};






elementos.push(nuevo);





localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);





crearMarcador(nuevo);





document.getElementById("modalElemento")
.style.display="none";



alert("Elemento guardado correctamente");



}



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

[elemento.lat,elemento.lng]

)

.addTo(mapa);





marcador.bindPopup(`

<b>${icono} ${elemento.tipo}</b>

<br>

${elemento.nombre}

<br>

${elemento.descripcion}

<br><br>

Estado: ${elemento.estado}

`);




}