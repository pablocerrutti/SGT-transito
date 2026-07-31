// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================


// =====================================
// OBTENER USUARIO ACTUAL
// =====================================

function obtenerUsuarioActual(){


    let datos =
    localStorage.getItem("usuarioActual");


    if(!datos){

        return null;

    }



    try{


        return JSON.parse(datos);


    }
    catch(error){


        console.error(
            "Error leyendo usuario",
            error
        );


        return null;


    }


}







// =====================================
// OBTENER ROL ACTUAL
// =====================================

function obtenerRolActual(){


    let usuario =
    obtenerUsuarioActual();



    if(!usuario){

        return null;

    }



    return (
        usuario.rol ||
        usuario.Rol ||
        ""
    );


}








// =====================================
// VERIFICAR ROL
// =====================================

function verificarRol(rolPermitido){



    let usuario =
    obtenerUsuarioActual();



    if(!usuario){


        window.location.href="../login.html";

        return false;


    }




    let rol =
    obtenerRolActual();






    // ADMINISTRADOR TOTAL

    if(
        rol==="SuperAdministrador"
    ){

        return true;

    }






    // SUPERVISOR

    if(
        rol==="Supervisor"
    ){

        return true;

    }






    // ROL ESPECIFICO

    if(
        rol===rolPermitido
    ){

        return true;

    }





    alert(
        "No tiene permisos para acceder a este módulo"
    );



    window.history.back();



    return false;



}









// =====================================
// PERMITIR MODULO
// =====================================

function permitirModulo(modulo){



    let usuario =
    obtenerUsuarioActual();



    if(!usuario){


        window.location.href="../login.html";

        return false;


    }





    let rol =
    obtenerRolActual();






    // ADMINISTRADORES PUEDEN TODO

    if(
        rol==="SuperAdministrador" ||
        rol==="Supervisor"
    ){

        return true;

    }






    // MODULO MOVILIDAD

    if(
        modulo==="movilidad" &&
        rol==="Movilidad"
    ){

        return true;

    }






    // MODULO INSPECTOR

    if(
        modulo==="inspector" &&
        rol==="Inspector"
    ){

        return true;

    }






    alert(
        "No tiene permisos para este módulo"
    );


    return false;



}









// =====================================
// MOSTRAR USUARIO
// =====================================

function cargarUsuario(){



    let usuario =
    obtenerUsuarioActual();



    if(!usuario){

        return;

    }




    let nombre =
    usuario.nombre ||
    usuario.Nombre ||
    "";



    let rol =
    usuario.rol ||
    usuario.Rol ||
    "";






    let campos =
    document.querySelectorAll(
        ".usuarioNombre"
    );





    campos.forEach(function(elemento){


        elemento.innerHTML = `

        <i class="fa-solid fa-user"></i>

        ${nombre}

        <br>

        <small>${rol}</small>

        `;


    });



}









// =====================================
// VOLVER DASHBOARD
// =====================================

function volverDashboard(){


    volverSegunRol();


}









// =====================================
// VOLVER SEGUN ROL
// =====================================

function volverSegunRol(){



    let rol =
    obtenerRolActual();





    switch(rol){



        case "SuperAdministrador":


        case "Supervisor":



            window.location.href=
            "../admin/dashboard.html";


        break;






        case "Movilidad":



            window.location.href=
            "../movilidad/dashboard.html";


        break;






        case "Inspector":



            window.location.href=
            "../inspector/dashboard.html";


        break;






        default:



            window.location.href=
            "../login.html";



    }



}









// =====================================
// CERRAR SESION
// =====================================

function cerrarSesion(){


    localStorage.removeItem(
        "usuarioActual"
    );


    window.location.href=
    "../login.html";


}
