// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================



// =====================================
// OBTENER USUARIO
// =====================================

function obtenerUsuario(){

    return JSON.parse(
        localStorage.getItem("usuarioActual")
    );

}



// =====================================
// VERIFICAR ROL ESPECÍFICO
// =====================================

function verificarRol(rolPermitido){

    let usuario = obtenerUsuario();

    if(!usuario){

        window.location="../login.html";

        return;

    }

    if(usuario.rol !== rolPermitido){

        alert("Acceso no autorizado");

        volverDashboard();

    }

}



// =====================================
// PERMITIR ACCESO A MODULO
// =====================================

function permitirModulo(modulo){

    let usuario = obtenerUsuario();

    if(!usuario){

        window.location="../login.html";

        return;

    }

    // El administrador tiene acceso total
    if(usuario.rol==="Administrador"){

        return;

    }

    // Movilidad
    if(
        usuario.rol==="Movilidad"
        &&
        modulo==="movilidad"
    ){

        return;

    }

    // Inspector (preparado para cuando exista)
    if(
        usuario.rol==="Inspector"
        &&
        modulo==="inspector"
    ){

        return;

    }

    alert("No tiene permisos para este módulo");

    volverDashboard();

}



// =====================================
// VOLVER AL DASHBOARD SEGÚN EL ROL
// =====================================

function volverDashboard(){

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
// CARGAR NOMBRE DEL USUARIO
// =====================================

function cargarUsuario(){

    let usuario = obtenerUsuario();

    let campo = document.querySelector(".usuarioNombre");

    if(campo && usuario){

        campo.innerHTML = `

            <i class="fa-solid fa-user"></i>

            ${usuario.nombre}

            <br>

            <small>${usuario.rol}</small>

        `;

    }

}



// =====================================
// CERRAR SESIÓN
// =====================================

function cerrarSesion(){

    localStorage.removeItem("usuarioActual");

    window.location="../login.html";

}
