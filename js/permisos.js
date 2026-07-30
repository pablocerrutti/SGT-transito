// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================


function verificarRol(rolPermitido){



let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);





if(!usuario){


window.location="../login.html";


return;


}





// Administrador tiene acceso total

if(usuario.rol==="Administrador"){


return;


}





// Validar módulo

if(usuario.rol!==rolPermitido){



alert(

"Acceso restringido"

);



window.location="../login.html";


}



}






function cargarUsuario(){



let usuario = JSON.parse(

localStorage.getItem("usuarioActual")

);




let zona=document.querySelector(".usuarioNombre");



if(zona && usuario){


zona.innerHTML=


`

${usuario.nombre}

<br>

<small>${usuario.rol}</small>

`;


}



}
