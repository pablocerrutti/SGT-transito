// =====================================
// SGT CONTROL DE PERMISOS
// =====================================



function verificarRol(rolPermitido){



let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);





if(!usuario){


window.location="../login.html";


return;


}





if(usuario.rol !== rolPermitido){



alert(
"Acceso no autorizado"
);



if(usuario.rol==="Administrador"){


window.location="../admin/dashboard.html";


}

else{


window.location="../movilidad/dashboard.html";


}



}



}








function permitirModulo(modulo){



let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);





if(!usuario){


window.location="../login.html";


return;


}





// ADMIN TIENE TODO


if(usuario.rol==="Administrador"){


return;


}






// MOVILIDAD SOLO SU MODULO


if(

usuario.rol==="Movilidad"

&&

modulo==="movilidad"

){


return;


}







alert(
"No tiene permisos para este módulo"
);



window.history.back();



}







function cargarUsuario(){



let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);



let campo=document.querySelector(
".usuarioNombre"
);





if(campo && usuario){


campo.innerHTML=`

<i class="fa-solid fa-user"></i>

${usuario.nombre}

<br>

<small>${usuario.rol}</small>

`;



}



}
