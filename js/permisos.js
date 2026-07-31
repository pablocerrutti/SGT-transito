// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================



// =====================================
// OBTENER USUARIO ACTUAL
// =====================================

function obtenerUsuarioActual(){


    let usuario =
    localStorage.getItem(
        "usuarioActual"
    );


    if(!usuario){

        return null;

    }



    try{

        return JSON.parse(usuario);

    }
    catch(e){

        console.error(e);

        return null;

    }


}








// =====================================
// OBTENER ROL
// =====================================

function obtenerRolActual(){


    let usuario =
    obtenerUsuarioActual();



    if(!usuario){

        return null;

    }



    return usuario.rol || usuario.Rol;


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
    usuario.rol || usuario.Rol;





    // SUPER ADMIN ACCESO TOTAL

    if(
        rol==="SuperAdministrador"
    ){


        return true;


    }






    // SUPERVISOR ACCESO ADMIN

    if(
        rol==="Supervisor"
        &&
        rolPermitido!=="SuperAdministrador"
    ){


        return true;


    }






    // ROL EXACTO

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



    let rol =
    obtenerRolActual();




    if(!rol){


        window.location.href="../login.html";

        return false;


    }







    // ADMINISTRADORES

    if(
        rol==="SuperAdministrador" ||
        rol==="Supervisor"
    ){


        return true;


    }








    // MOVILIDAD

    if(
        modulo==="movilidad" &&
        rol==="Movilidad"
    ){


        return true;


    }







    // INSPECTOR

    if(
        modulo==="inspector" &&
        rol==="Inspector"
    ){


        return true;


    }






    alert(
        "No tiene permisos para este módulo"
    );



    window.history.back();



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
    usuario.nombre || usuario.Nombre || "";



    let rol =
    usuario.rol || usuario.Rol || "";






    let elementos =
    document.querySelectorAll(
        ".usuarioNombre"
    );






    elementos.forEach(function(e){



        e.innerHTML =
        `
        <i class="fa-solid fa-user"></i>
        ${nombre}
        <br>
        <small>${rol}</small>
        `;



    });



}








// =====================================
// VOLVER DASHBOARD SEGUN ROL
// =====================================

function volverDashboard(){



    let rol =
    obtenerRolActual();




    switch(rol){



        case "SuperAdministrador":

        case "Supervisor":

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