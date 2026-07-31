// =====================================
// SGT - MAPA MOVILIDAD
// mapa.js
// =====================================


const API =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let mapa;

let elementos = [];

let tipos = [];

let marcadores = [];





// =====================================
// INICIO
// =====================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    iniciarMapa();


    cargarTipos();


    cargarElementos();


    verificarPermisos();


});








// =====================================
// CREAR MAPA
// =====================================


function iniciarMapa(){


    mapa =
    L.map("mapa")
    .setView(
        [
        -34.095,
        -56.214
        ],
        14
    );



    L.tileLayer(

    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

    maxZoom:19

    }

    )
    .addTo(mapa);



}







// =====================================
// CARGAR TIPOS
// =====================================


async function cargarTipos(){


try{


let respuesta =
await fetch(
API+"?accion=tipos"
);



tipos =
await respuesta.json();



let select =
document.getElementById(
"filtroTipo"
);



tipos.forEach(tipo=>{


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


console.error(
"Error tipos:",
error
);


}


}







// =====================================
// CARGAR ELEMENTOS
// =====================================


async function cargarElementos(){



try{


let respuesta =
await fetch(
API+"?accion=elementos"
);



elementos =
await respuesta.json();



mostrarElementos(
elementos
);



}
catch(error){


console.error(
"Error elementos:",
error
);


}



}







// =====================================
// MOSTRAR MARCADORES
// =====================================


function mostrarElementos(lista){



limpiarMarcadores();



lista.forEach(elemento=>{


if(
!elemento.lat ||
!elemento.lng
)
return;



let marcador =
L.marker(
[
Number(elemento.lat),
Number(elemento.lng)
]
);



marcador
.addTo(mapa);



marcador
.bindPopup(

`

<div class="popup">


<h3>
${elemento.tipo}
</h3>


<p>
<b>Código:</b>
${elemento.codigo}
</p>


<p>
${elemento.nombre || ""}
</p>


<p>
<b>Estado:</b>
${elemento.estado || ""}
</p>



<button onclick="verElemento('${elemento.id}')">

Ver detalle

</button>


</div>

`

);



marcadores.push(
marcador
);



});


}








// =====================================
// LIMPIAR MARCADORES
// =====================================


function limpiarMarcadores(){


marcadores.forEach(
m=>
mapa.removeLayer(m)
);



marcadores=[];


}







// =====================================
// FILTRO
// =====================================


function filtrarTipo(){


let valor =
document.getElementById(
"filtroTipo"
)
.value;



if(
valor==="todos"
){


mostrarElementos(
elementos
);


return;

}



let filtrados =
elementos.filter(

e=>
e.tipoId == valor

);



mostrarElementos(
filtrados
);


}








// =====================================
// VER ELEMENTO
// =====================================


function verElemento(id){



localStorage.setItem(

"elementoSeleccionado",

JSON.stringify(

elementos.find(
e=>e.id==id
)

)

);



window.location.href =
"elemento.html";


}







// =====================================
// NUEVO ELEMENTO
// =====================================


function nuevoElemento(){


window.location.href =
"elemento.html?nuevo=true";


}








// =====================================
// PERMISOS
// =====================================


function verificarPermisos(){



let usuario =
JSON.parse(
localStorage.getItem(
"usuario"
)
);



let boton =
document.getElementById(
"btnNuevo"
);



if(!usuario){


return;


}



if(
usuario.rol ===
"Administrador"
){


boton.style.display =
"block";


return;


}




if(
usuario.rol ===
"Movilidad"
){


boton.style.display =
"block";


return;


}



boton.style.display =
"none";



}







// =====================================
// VOLVER
// =====================================


function volverDashboard(){


let usuario =
JSON.parse(
localStorage.getItem(
"usuario"
)
);



if(
usuario &&
usuario.rol==="Administrador"
){


window.location.href =
"../admin/dashboard.html";


}
else{


window.location.href =
"dashboard.html";


}


}
