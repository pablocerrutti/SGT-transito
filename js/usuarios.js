// =====================================
// SGT - GESTIÓN DE USUARIOS
// Dirección de Tránsito y Transportes
// =====================================


// =====================================
// CREACIÓN INICIAL DE ADMINISTRADORES
// =====================================


let usuarios = JSON.parse(

localStorage.getItem("usuariosSGT")

);



if(!usuarios){



usuarios = [


{
nombre:"Pablo Cerrutti",
usuario:"Pcerrutti",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
},



{
nombre:"Marcelo Perez",
usuario:"Mperez",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
},



{
nombre:"Gustavo Bentancur",
usuario:"Gbentancur",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
}


];



localStorage.setItem(

"usuariosSGT",

JSON.stringify(usuarios)

);



}



// =====================================
// CONTROL DE ACCESO
// =====================================


let usuarioActual = JSON.parse(

localStorage.getItem("usuarioActual")

);



if(
!usuarioActual ||
usuarioActual.rol !== "Administrador"
){


alert("Acceso restringido");


window.location="../login.html";


}






// =====================================
// CARGAR TABLA
// =====================================


mostrarUsuarios();




function mostrarUsuarios(){



let tabla = document.getElementById(

"tablaUsuarios"

);



if(!tabla){

return;

}




tabla.innerHTML="";





usuarios.forEach(function(usuario,index){



let fila = tabla.insertRow();




fila.innerHTML = `



<td>

${usuario.nombre}

</td>



<td>

${usuario.usuario}

</td>



<td>

${usuario.rol}

</td>



<td>

${usuario.estado}

</td>



<td>


<button onclick="eliminarUsuario(${index})">

Eliminar

</button>


</td>


`;



});



}







// =====================================
// CREAR NUEVO USUARIO
// =====================================



function guardarUsuario(){



let nombre =
document.getElementById("nombre").value;



let usuario =
document.getElementById("usuario").value;



let password =
document.getElementById("password").value;



let rol =
document.getElementById("rol").value;



let estado =
document.getElementById("estado").value;






if(
nombre=="" ||
usuario=="" ||
password==""
){


alert("Complete todos los campos");


return;


}







// evitar usuarios repetidos


let existe = usuarios.find(

u=>u.usuario===usuario

);



if(existe){


alert("El usuario ya existe");


return;


}







let nuevoUsuario = {



nombre:nombre,


usuario:usuario,


password:password,


rol:rol,


estado:estado,


debeCambiarPassword:true



};







usuarios.push(nuevoUsuario);





localStorage.setItem(

"usuariosSGT",

JSON.stringify(usuarios)

);





alert("Usuario creado correctamente");





mostrarUsuarios();





cerrarModal();



}







// =====================================
// ELIMINAR USUARIO
// =====================================



function eliminarUsuario(index){



if(confirm("¿Eliminar usuario?")){



usuarios.splice(index,1);





localStorage.setItem(

"usuariosSGT",

JSON.stringify(usuarios)

);





mostrarUsuarios();



}



}







// =====================================
// MODAL
// =====================================



function abrirModal(){



document.getElementById("modal")

.style.display="flex";



}





function cerrarModal(){



document.getElementById("modal")

.style.display="none";



}