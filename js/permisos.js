// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================




// =====================================
// OBTENER USUARIO ACTUAL
// =====================================


function obtenerUsuario(){



let usuario = localStorage.getItem(

"usuarioActual"

);





if(!usuario){



return null;



}





return JSON.parse(usuario);



}









// =====================================
// CARGAR NOMBRE USUARIO
// =====================================


function cargarUsuario(){



let usuario = obtenerUsuario();





let elemento = document.querySelector(

".usuarioNombre"

);






if(elemento && usuario){



elemento.innerHTML =



`

<i class="fa-solid fa-user"></i>

${usuario.nombre}

<br>

<small>${usuario.rol}</small>

`;



}



}









// =====================================
// PERMITIR MODULO
// =====================================


function permitirModulo(modulo){



let usuario = obtenerUsuario();







if(!usuario){



window.location="../login.html";



return;



}








let rol = usuario.rol;








// ===============================
// SUPER ADMIN
// ===============================


if(rol==="SuperAdministrador"){



return true;



}








// ===============================
// SUPERVISOR
// ===============================


if(rol==="Supervisor"){



if(modulo==="usuarios"){



bloquear();



return false;



}



return true;



}









// ===============================
// MOVILIDAD
// ===============================


if(rol==="Movilidad"){



if(

modulo==="movilidad"

||

modulo==="informes"

){



return true;



}



bloquear();


return false;



}








// ===============================
// INSPECTOR
// ===============================


if(rol==="Inspector"){



if(modulo==="inspector"){



return true;



}



bloquear();


return false;



}








bloquear();


return false;



}











// =====================================
// COMPATIBILIDAD ANTIGUA
// =====================================


function verificarRol(rolPermitido){



let usuario = obtenerUsuario();







if(!usuario){



window.location="../login.html";


return false;



}







if(usuario.rol===rolPermitido){



return true;



}







if(usuario.rol==="SuperAdministrador"){



return true;



}







bloquear();



return false;



}









// =====================================
// VOLVER SEGUN ROL
// =====================================


function volverSegunRol(){



let usuario = obtenerUsuario();






if(!usuario){



window.location="../login.html";


return;



}







switch(usuario.rol){



case "SuperAdministrador":



case "Supervisor":



window.location="../admin/dashboard.html";


break;








case "Movilidad":



window.location="../movilidad/dashboard.html";


break;








case "Inspector":



window.location="../inspectores/dashboard.html";


break;








default:



window.location="../login.html";



}





}









// =====================================
// BLOQUEAR ACCESO
// =====================================


function bloquear(){



alert(

"No tiene permisos para acceder a este módulo"

);



window.history.back();



}
