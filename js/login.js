// =====================================
// SGT - LOGIN
// =====================================


const API_USUARIOS =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";







// =====================================
// INGRESAR
// =====================================


async function ingresar(){



let usuario = document.getElementById(

"usuario"

).value.trim();





let password = document.getElementById(

"password"

).value.trim();







if(

usuario===""

||

password===""

){



alert(

"Ingrese usuario y contraseña"

);



return;



}







try{



let respuesta = await fetch(

API_USUARIOS + "?accion=usuarios"

);



let usuarios = await respuesta.json();







let encontrado = usuarios.find(function(u){



return (

u.usuario === usuario

&&

u.password === password

);



});








if(!encontrado){



alert(

"Usuario o contraseña incorrectos"

);



return;



}








// =====================================
// VALIDAR ESTADO
// =====================================



if(

encontrado.estado !== "Activo"

){



alert(

"Usuario inactivo. Contacte al administrador."

);



return;



}









// =====================================
// GUARDAR SESION
// =====================================


localStorage.setItem(

"usuarioActual",

JSON.stringify(encontrado)

);









// =====================================
// CAMBIO OBLIGATORIO DE CLAVE
// =====================================


if(

encontrado.cambiarClave === true

||

encontrado.cambiarClave === "true"

){



window.location="cambiar-password.html";


return;



}









// =====================================
// ENTRAR AL SISTEMA
// =====================================


redireccionarRol(

encontrado.rol

);





}

catch(error){



console.error(error);



alert(

"Error conectando con el servidor"

);



}



}









// =====================================
// REDIRECCION POR ROL
// =====================================


function redireccionarRol(rol){



switch(rol){



case "SuperAdministrador":



window.location="admin/dashboard.html";


break;







case "Supervisor":



window.location="admin/dashboard.html";


break;







case "Movilidad":



window.location="movilidad/dashboard.html";


break;







case "Inspector":



window.location="inspectores/dashboard.html";


break;







default:



alert(

"Rol no configurado"

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



window.location="login.html";



}









// =====================================
// ENTER PARA INGRESAR
// =====================================


document.addEventListener(

"keydown",

function(e){



if(e.key==="Enter"){



ingresar();



}



}

);