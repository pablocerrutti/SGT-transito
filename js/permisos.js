// =====================================
// SGT - CONTROL DE PERMISOS
// Dirección de Tránsito y Transportes
// =====================================



// Obtener usuario conectado

let usuarioActual = JSON.parse(

localStorage.getItem("usuarioActual")

);





// Si no existe sesión

if(!usuarioActual){


window.location="../login.html";


}






// =====================================
// FUNCIONES DE ROLES
// =====================================



function esAdministrador(){


return usuarioActual &&
usuarioActual.rol === "Administrador";


}





function esMovilidad(){


return usuarioActual &&
usuarioActual.rol === "Movilidad Urbana";


}





function esCamaras(){


return usuarioActual &&
usuarioActual.rol === "Cámaras e Incidencias";


}






// =====================================
// PROTECCIÓN DE MÓDULOS
// =====================================



function permitirModulo(modulo){



if(!usuarioActual){


window.location="../login.html";

return false;


}




switch(modulo){



case "admin":



if(!esAdministrador()){


alert("Acceso restringido");


window.location="../login.html";


return false;


}


break;






case "movilidad":



if(
!esAdministrador() &&
!esMovilidad()
){


alert("No tiene permisos para Movilidad Urbana");


window.location="../login.html";


return false;


}


break;







case "camaras":



if(
!esAdministrador() &&
!esCamaras()
){


alert("No tiene permisos para Cámaras e Incidencias");


window.location="../login.html";


return false;


}


break;



}




return true;


}







// =====================================
// MOSTRAR USUARIO ACTUAL
// =====================================



function cargarUsuario(){



let elementos =
document.querySelectorAll(".usuarioNombre");



elementos.forEach(function(elemento){



elemento.innerHTML = `

<i class="fa-solid fa-user"></i>

${usuarioActual.nombre}

`;



});


}