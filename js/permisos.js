// =====================================
// SGT - CONTROL DE PERMISOS
// =====================================


function obtenerUsuarioActual(){


    let usuario = localStorage.getItem(
        "usuarioActual"
    );


    if(!usuario){

        return null;

    }


    try{


        return JSON.parse(usuario);


    }
    catch(e){


        return null;


    }


}





// =====================================
// VERIFICAR ROL
// =====================================


function verificarRol(rolPermitido){



    let usuario = obtenerUsuarioActual();



    if(!usuario){


        window.location.href="../login.html";

        return false;


    }





    let rol = usuario.rol;



    // SUPER ADMIN TIENE ACCESO TOTAL

    if(rol==="SuperAdministrador"){


        return true;


    }





    // SUPERVISOR

    if(
        rol==="Supervisor" &&
        rolPermitido!=="SuperAdministrador"
    ){


        return true;


    }





    // ROL EXACTO

    if(rol===rolPermitido){


        return true;


    }






    alert(
        "No tiene permisos para acceder a este módulo"
    );


    window.history.back();



    return false;


}







// =====================================
// MOSTRAR USUARIO
// =====================================


function cargarUsuario(){



    let usuario = obtenerUsuarioActual();



    if(!usuario){

        return;

    }



    let elementos =
    document.querySelectorAll(
        ".usuarioNombre"
    );



    elementos.forEach(function(e){


        e.innerHTML =
        `
        <i class="fa-solid fa-user"></i>
        ${usuario.nombre}
        <br>
        <small>${usuario.rol}</small>
        `;


    });



}
