// =====================================
// SGT - LOGIN
// Google Sheets API
// =====================================


const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";





// =====================================
// LOGIN USUARIO
// =====================================


document
.querySelector(".btnUsuario")
.addEventListener("click",function(){



let usuario =

document.querySelectorAll("input")[0]

.value

.trim();




let clave =

document.querySelectorAll("input")[1]

.value

.trim();




validarLogin(usuario,clave);



});








// =====================================
// LOGIN ADMIN
// =====================================


document
.querySelector(".btnAdmin")
.addEventListener("click",function(){



let usuario =

document.querySelectorAll("input")[2]

.value

.trim();




let clave =

document.querySelectorAll("input")[3]

.value

.trim();




validarLogin(usuario,clave);



});









// =====================================
// VALIDAR LOGIN
// =====================================


function validarLogin(usuario,clave){





fetch(

API_URL+"?accion=usuarios"

)



.then(function(respuesta){


return respuesta.json();


})



.then(function(usuarios){





console.log(

"USUARIOS SGT:",

usuarios

);







if(!Array.isArray(usuarios)){


alert(

"Error cargando usuarios"

);


return;


}









let encontrado = usuarios.find(function(u){



return (



String(u.usuario)

.toLowerCase()

===

usuario.toLowerCase()



&&



String(u.password)

===

clave



);



});








if(!encontrado){



alert(

"Usuario o contraseña incorrectos"

);



return;


}












// CREAR SESION


let usuarioActual={



id:

encontrado.id,



nombre:

encontrado.nombre,



usuario:

encontrado.usuario,



rol:

encontrado.rol,



cambiarPassword:

encontrado.cambiarPassword || "NO"



};









localStorage.setItem(

"usuarioActual",

JSON.stringify(usuarioActual)

);











// =====================================
// CAMBIO OBLIGATORIO PASSWORD
// =====================================




if(

String(encontrado.cambiarPassword)

.toUpperCase()

===

"SI"

){



window.location="cambiar-password.html";


return;



}









entrarSistema(usuarioActual);





})



.catch(function(error){



console.error(

"ERROR LOGIN:",

error

);



alert(

"No se pudo conectar con la base de datos"

);



});



}











// =====================================
// REDIRECCION SEGUN ROL
// =====================================


function entrarSistema(usuario){





switch(usuario.rol){





case "Administrador":



window.location="admin/dashboard.html";



break;







case "Movilidad":



window.location="movilidad/dashboard.html";



break;







default:



alert(

"Rol no configurado: "+usuario.rol

);



break;



}





}
