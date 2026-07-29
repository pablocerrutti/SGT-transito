// =====================================
// SGT - CONTROL DE PERMISOS
// Dirección de Tránsito y Transportes
// =====================================


let usuarioActual = JSON.parse(

localStorage.getItem("usuarioActual")

);




// CONTROL DE SESIÓN

if(!usuarioActual){


window.location="../login.html";


}






// =====================================
// ROLES
// =====================================


function esAdministrador(){


return usuarioActual &&
usuarioActual.rol === "Administrador";


}





function esMovilidad(){


return usuarioActual &&
usuarioActual.rol === "Movilidad Urbana";


}





function esInspector(){


return usuarioActual &&
usuarioActual.rol === "Inspector";


}








// =====================================
// ACCESO A MÓDULOS
// =====================================


function permitirModulo(modulo){



if(!usuarioActual){


window.location="../login.html";

return false;


}






// ADMINISTRADOR ACCEDE A TODO


if(esAdministrador()){


return true;


}







switch(modulo){



case "admin":



alert("Acceso exclusivo de administración");

window.location="../login.html";

return false;






case "movilidad":



if(esMovilidad()){


return true;


}



alert(

"No tiene permisos para Movilidad Urbana"

);


window.location="../login.html";


return false;








case "inspector":



if(esInspector()){


return true;


}



alert(

"Acceso exclusivo de inspectores"

);


window.location="../login.html";


return false;



}




return false;


}









// =====================================
// PERMISOS DE MOVILIDAD
// =====================================


// Administrador y Movilidad pueden crear puntos


function puedeCrearElementos(){



return (

esAdministrador()

||

esMovilidad()

);



}







// Administrador y Movilidad pueden registrar actuaciones


function puedeRegistrarActuaciones(){



return (

esAdministrador()

||

esMovilidad()

);



}







// =====================================
// MOSTRAR USUARIO
// =====================================


function cargarUsuario(){



let elementos =

document.querySelectorAll(".usuarioNombre");




elementos.forEach(function(e){



e.innerHTML =

usuarioActual.nombre +

" | " +

usuarioActual.rol;



});



}