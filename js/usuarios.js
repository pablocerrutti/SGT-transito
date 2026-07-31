// =====================================
// SGT - GESTION DE USUARIOS
// =====================================


const API_USUARIOS =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let listaUsuarios=[];





// =====================================
// INICIO
// =====================================


window.onload=function(){


cargarUsuarios();


};








// =====================================
// CARGAR USUARIOS
// =====================================


async function cargarUsuarios(){


try{


let respuesta = await fetch(

API_USUARIOS+"?accion=usuarios"

);



listaUsuarios = await respuesta.json();




mostrarUsuarios();



}

catch(error){


console.error(error);


alert(

"Error cargando usuarios"

);


}



}









// =====================================
// MOSTRAR TABLA
// =====================================


function mostrarUsuarios(){



let tabla=document.getElementById(

"tablaUsuarios"

);



if(!tabla) return;



tabla.innerHTML="";






listaUsuarios.forEach(function(usuario){



let fila=document.createElement(

"tr"

);






let botonEliminar="";





if(usuario.usuario !== "Pcerrutti"){



botonEliminar =

`

<button

class="btnEliminar"

onclick="eliminarUsuario('${usuario.usuario}')">


<i class="fa-solid fa-trash"></i>


</button>

`;



}

else{


botonEliminar =

`

<i class="fa-solid fa-lock"></i>

`;



}







fila.innerHTML=



`

<td>

${usuario.nombre || ""}

</td>



<td>

${usuario.usuario || ""}

</td>



<td>

${usuario.rol || ""}

</td>



<td>

${usuario.estado || ""}

</td>



<td>

${botonEliminar}

</td>


`;







tabla.appendChild(fila);





});




}









// =====================================
// ABRIR MODAL
// =====================================


function abrirModal(){



let modal=document.getElementById(

"modal"

);



if(modal){


modal.style.display="flex";


}



}









// =====================================
// CERRAR MODAL
// =====================================


function cerrarModal(){



let modal=document.getElementById(

"modal"

);



if(modal){


modal.style.display="none";


}



}









// =====================================
// GUARDAR USUARIO
// =====================================


async function guardarUsuario(){



let datos={


accion:"crearUsuario",



nombre:
document.getElementById("nombre").value.trim(),



usuario:
document.getElementById("usuario").value.trim(),



password:
document.getElementById("password").value.trim(),



rol:
document.getElementById("rol").value,



estado:
document.getElementById("estado").value,



// obliga cambio de clave

cambiarClave:true



};







if(

datos.nombre===""

||

datos.usuario===""

||

datos.password===""

){


alert(

"Complete todos los campos"

);


return;


}








let actual=

JSON.parse(

localStorage.getItem(

"usuarioActual"

)

);








// =====================================
// CONTROL SUPERADMIN
// =====================================


if(

datos.rol==="SuperAdministrador"

&&

actual.rol!=="SuperAdministrador"

){



alert(

"Solo el SuperAdministrador puede crear otro SuperAdministrador"

);



return;



}









try{



let respuesta = await fetch(

API_USUARIOS,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify(datos)



}



);







let resultado=

await respuesta.json();







if(resultado.ok){



alert(

"Usuario creado correctamente"

);



cerrarModal();



cargarUsuarios();



}



else{



alert(

resultado.mensaje || "No se pudo crear usuario"

);



}





}

catch(error){



console.error(error);



alert(

"Error conectando con servidor"

);



}




}











// =====================================
// ELIMINAR USUARIO
// =====================================


async function eliminarUsuario(usuario){



let actual=

JSON.parse(

localStorage.getItem(

"usuarioActual"

)

);







if(usuario==="Pcerrutti"){



alert(

"No se puede eliminar el SuperAdministrador principal"

);



return;


}







if(

actual.rol!=="SuperAdministrador"

){



alert(

"Solo el SuperAdministrador puede eliminar usuarios"

);



return;



}







if(

!confirm(

"¿Eliminar usuario seleccionado?"

)

){


return;


}







try{



let respuesta=await fetch(

API_USUARIOS,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


accion:"eliminarUsuario",


usuario:usuario



})



}



);






let resultado=

await respuesta.json();








if(resultado.ok){



alert(

"Usuario eliminado"

);



cargarUsuarios();



}

else{


alert(

"No se pudo eliminar usuario"

);


}





}

catch(error){



console.error(error);



alert(

"Error eliminando usuario"

);



}




}