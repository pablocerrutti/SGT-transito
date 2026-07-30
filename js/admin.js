// =====================================
// SGT - CONTROL PANEL ADMINISTRADOR
// =====================================


// Verificar sesión

let usuarioActual = JSON.parse(
    localStorage.getItem("usuarioActual")
);



if(!usuarioActual){

    alert("Debe iniciar sesión");

    window.location="../login.html";

}




// Verificar permisos

if(usuarioActual.rol !== "Administrador"){


    alert("Acceso restringido");


    window.location="../login.html";


}




// Mostrar administrador conectado

let etiquetaUsuario = document.querySelector("header span");


if(etiquetaUsuario){


    etiquetaUsuario.innerHTML = `

    <i class="fa-solid fa-user-shield"></i>

    ${usuarioActual.nombre}

    `;


}




// Cerrar sesión

function cerrarSesion(){


    localStorage.removeItem("usuarioActual");


    window.location="../login.html";


}




console.log(
"Administrador conectado:",
usuarioActual
);