// =====================================
// SGT - CONTROL DE PERMISOS
// Dirección de Tránsito y Transportes
// =====================================



// =====================================
// OBTENER USUARIO ACTUAL
// =====================================


function obtenerUsuario(){


return JSON.parse(

localStorage.getItem("usuarioActual")

);


}





// =====================================
// DASHBOARD SEGUN ROL
// =====================================

function irDashboard(){


let usuario = obtenerUsuario();



if(!usuario){


window.location="../login.html";


return;


}



switch(usuario.rol){



case "Administrador":


window.location="dashboard.html";


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
// PERMITIR MODULO
// =====================================


function permitirModulo(modulo){



let usuario = obtenerUsuario();





if(!usuario){


window.location="../login.html";


return;


}





// ADMINISTRADOR TODO


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
// DASHBOARD SEGUN ROL
// =====================================


function irDashboard(){



let usuario = obtenerUsuario();





if(!usuario){


window.location="../login.html";


return;


}






switch(usuario.rol){



case "Administrador":


window.location="/admin/dashboard.html";


break;




case "Movilidad":


window.location="/movilidad/dashboard.html";


break;




case "Inspector":


window.location="/inspector/dashboard.html";


break;




default:


window.location="../login.html";


}



}









// =====================================
// VOLVER AL DASHBOARD
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
// MOSTRAR USUARIO
// =====================================


function cargarUsuario(){



let usuario=obtenerUsuario();



let campo=document.querySelector(

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
