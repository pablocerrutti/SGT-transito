// =====================================
// SGT - LOGIN
// =====================================


const API_USUARIOS =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";




// =====================================
// INGRESAR
// =====================================


async function ingresar(){


let usuarioInput = document.getElementById("usuario");

let passwordInput = document.getElementById("password");



if(!usuarioInput || !passwordInput){


alert("Error: campos de login no encontrados");

return;


}



let usuario = usuarioInput.value.trim();

let password = passwordInput.value.trim();




if(usuario==="" || password===""){


alert("Ingrese usuario y contraseña");

return;


}




try{


let respuesta = await fetch(

API_USUARIOS + "?accion=usuarios"

);



let usuarios = await respuesta.json();



console.log(
"Usuarios recibidos:",
usuarios
);





// =====================================
// BUSCAR USUARIO
// =====================================


let encontrado = usuarios.find(function(u){



let userSheet = String(

u.Usuario || ""

)

.trim()

.toLowerCase();




let passSheet = String(

u.Password || ""

)

.trim();





return (

userSheet === usuario.toLowerCase()

&&

passSheet === password

);



});







if(!encontrado){


alert(
"Usuario o contraseña incorrectos"
);


return;


}








// =====================================
// CREAR SESION NORMALIZADA
// =====================================


let sesion = {



id:

encontrado.id,



nombre:

encontrado.Nombre,



usuario:

encontrado.Usuario,



rol:

encontrado.Rol,



estado:

encontrado.Estado,



cambiarClave:

encontrado.DebeCambiar



};







localStorage.setItem(


"usuarioActual",


JSON.stringify(sesion)


);







console.log(

"Sesion guardada:",

localStorage.getItem("usuarioActual")

);







// =====================================
// CAMBIO OBLIGATORIO DE CLAVE
// =====================================


if(

sesion.cambiarClave===true ||

String(sesion.cambiarClave)==="true"

){



window.location.href =

"cambiar-password.html";


return;


}








// =====================================
// REDIRECCION POR ROL
// =====================================


switch(sesion.rol){



case "SuperAdministrador":



window.location.href =

"admin/dashboard.html";


break;





case "Supervisor":



window.location.href =

"admin/dashboard.html";


break;





case "Movilidad":



window.location.href =

"movilidad/dashboard.html";


break;





case "Inspector":



window.location.href =

"inspector/dashboard.html";


break;





default:



alert(

"Rol no configurado: "

+ sesion.rol

);



break;



}



}





catch(error){



console.error(

"Error login:",

error

);



alert(

"Error conectando con el servidor"

);



}



}








// =====================================
// CERRAR SESION
// =====================================


function cerrarSesion(){



localStorage.removeItem(

"usuarioActual"

);



window.location.href="login.html";



}








// =====================================
// ENTER PARA INGRESAR
// =====================================


document.addEventListener(

"keydown",

function(e){



if(e.key==="Enter"){



let usuario = document.getElementById("usuario");

let password = document.getElementById("password");



if(usuario && password){



ingresar();



}



}



}

);
