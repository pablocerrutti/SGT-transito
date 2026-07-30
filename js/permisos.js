// =====================================
// SGT - CONTROL DE PERMISOS
// Dirección de Tránsito y Transportes
// =====================================



// =====================================
// OBTENER USUARIO ACTUAL
// =====================================

function obtenerUsuario(){


let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);


return usuario;


}





// =====================================
// VERIFICAR ROL DE PAGINA
// =====================================


function verificarRol(rolPermitido){



let usuario = obtenerUsuario();





if(!usuario){


window.location="../login.html";


return;


}






if(usuario.rol !== rolPermitido){



alert(

"Acceso no autorizado"

);



irDashboard();


return;


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






// ADMINISTRADOR TIENE ACCESO TOTAL

if(usuario.rol==="Administrador"){


return;


}







// MOVILIDAD

if(

usuario.rol==="Movilidad"

&&

modulo==="movilidad"

){


return;


}








// INSPECTOR FUTURO

if(

usuario.rol==="Inspector"

&&

modulo==="inspector"

){


return;


}







alert(

"No tiene permisos para este módulo"

);



irDashboard();



}









// =====================================
// IR AL DASHBOARD SEGÚN ROL
// =====================================


function irDashboard(){



let usuario = obtenerUsuario();





if(!usuario){


window.location="../login.html";


return;


}







switch(usuario.rol){



case "Administrador":



window.location="../admin/dashboard.html";


break;






case "Movilidad":



window.location="../movilidad/dashboard.html";


break;






case "Inspector":



window.location="../inspector/dashboard.html";


break;






default:



window.location="../login.html";



}



}









// =====================================
// BOTON VOLVER
// =====================================


function volverDashboard(){


irDashboard();


}









// =====================================
// CERRAR SESION
// =====================================


function cerrarSesion(){



localStorage.removeItem(

"usuarioActual"

);



window.location="../login.html";



}









// =====================================
// MOSTRAR USUARIO CONECTADO
// =====================================


function cargarUsuario(){



let usuario = obtenerUsuario();



let campo = document.querySelector(

".usuarioNombre"

);





if(campo && usuario){



campo.innerHTML=`

<i class="fa-solid fa-user"></i>

${usuario.nombre || usuario.usuario}

<br>

<small>

${usuario.rol}

</small>

`;



}



}
