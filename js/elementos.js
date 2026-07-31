// =====================================
// SGT - GESTION ELEMENTOS
// =====================================


const API_ELEMENTOS =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let elementos=[];

let elementosFiltrados=[];



// =====================================
// INICIO
// =====================================


window.onload=function(){

cargarElementos();

};




// =====================================
// CARGAR ELEMENTOS
// =====================================


async function cargarElementos(){


try{


let respuesta =
await fetch(
API_ELEMENTOS+"?accion=elementos"
);



elementos =
await respuesta.json();



elementosFiltrados=[
...elementos
];



mostrarElementos();



}

catch(error){


console.error(error);


alert(
"Error cargando elementos"
);


}



}







// =====================================
// MOSTRAR TABLA
// =====================================


function mostrarElementos(){


let tabla =
document.getElementById(
"tablaElementos"
);



tabla.innerHTML="";





elementosFiltrados.forEach(function(e){



let fila =
document.createElement(
"tr"
);





fila.innerHTML=



`

<td>

${e.codigo || ""}

</td>


<td>

${e.tipo || ""}

</td>


<td>

${e.nombre || ""}

</td>



<td>

${e.estado || ""}

</td>



<td>


<button 
class="btnEditar"
onclick="editarElemento('${e.id}')">

<i class="fa-solid fa-pen"></i>

</button>




<button
class="btnEliminar"
onclick="eliminarElemento('${e.id}')">

<i class="fa-solid fa-trash"></i>

</button>



</td>


`;




tabla.appendChild(fila);



});



}









// =====================================
// BUSCAR
// =====================================


function filtrarElementos(){


let texto =
document.getElementById(
"buscar"
).value.toLowerCase();




elementosFiltrados =
elementos.filter(function(e){


return (

(e.tipo || "")
.toLowerCase()
.includes(texto)

||

(e.nombre || "")
.toLowerCase()
.includes(texto)

||

(e.estado || "")
.toLowerCase()
.includes(texto)

);



});




mostrarElementos();



}









// =====================================
// NUEVO ELEMENTO
// =====================================


function nuevoElemento(){



limpiarFormulario();



document.getElementById(
"modalElemento"
).style.display="flex";



}







// =====================================
// EDITAR
// =====================================


function editarElemento(id){



let elemento =
elementos.find(function(e){


return String(e.id)===String(id);


});




if(!elemento){

alert(
"Elemento no encontrado"
);

return;

}





document.getElementById(
"idElemento"
).value=elemento.id;



document.getElementById(
"codigo"
).value=elemento.codigo || "";



document.getElementById(
"tipo"
).value=elemento.tipo || "";



document.getElementById(
"nombre"
).value=elemento.nombre || "";



document.getElementById(
"descripcion"
).value=elemento.descripcion || "";



document.getElementById(
"caracteristicas"
).value=elemento.caracteristicas || "";



document.getElementById(
"estado"
).value=elemento.estado || "Activo";



document.getElementById(
"lat"
).value=elemento.lat || "";



document.getElementById(
"lng"
).value=elemento.lng || "";






document.getElementById(
"modalElemento"
).style.display="flex";



}









// =====================================
// GUARDAR / ACTUALIZAR
// =====================================


async function guardarElemento(){



let datos={



accion:

document.getElementById(
"idElemento"
).value

?

"editarElemento"

:

"guardarElemento",




id:

document.getElementById(
"idElemento"
).value,




codigo:

document.getElementById(
"codigo"
).value,



tipo:

document.getElementById(
"tipo"
).value,



nombre:

document.getElementById(
"nombre"
).value,



descripcion:

document.getElementById(
"descripcion"
).value,



caracteristicas:

document.getElementById(
"caracteristicas"
).value,



estado:

document.getElementById(
"estado"
).value,



lat:

document.getElementById(
"lat"
).value,



lng:

document.getElementById(
"lng"
).value



};





let respuesta =
await fetch(

API_ELEMENTOS,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify(datos)


}

);





let resultado =
await respuesta.json();





if(resultado.ok){



alert(
"Elemento guardado"
);



cerrarModal();


cargarElementos();



}

else{


alert(
resultado.mensaje
);


}



}









// =====================================
// ELIMINAR
// =====================================


async function eliminarElemento(id){



if(
!confirm(
"¿Eliminar elemento?"
)

){

return;

}





let respuesta =
await fetch(

API_ELEMENTOS,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

accion:"eliminarElemento",

id:id

})


}

);






let resultado =
await respuesta.json();





if(resultado.ok){


alert(
"Elemento eliminado"
);


cargarElementos();


}

else{


alert(
resultado.mensaje
);


}




}









// =====================================
// MODAL
// =====================================


function cerrarModal(){


document.getElementById(
"modalElemento"
).style.display="none";


}



function limpiarFormulario(){



document.getElementById(
"idElemento"
).value="";


document.getElementById(
"codigo"
).value="";


document.getElementById(
"tipo"
).value="";


document.getElementById(
"nombre"
).value="";


document.getElementById(
"descripcion"
).value="";


document.getElementById(
"caracteristicas"
).value="";


document.getElementById(
"estado"
).value="Activo";


document.getElementById(
"lat"
).value="";


document.getElementById(
"lng"
).value="";



}