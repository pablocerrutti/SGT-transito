```javascript
// =====================================================
// SGT
// Dashboard Principal
// =====================================================

let usuario = null;


//======================================================
// OBTENER USUARIO
//======================================================

try {

    usuario = JSON.parse(
        localStorage.getItem("usuarioActual")
    );

} catch (_) {

    usuario = null;

}


//======================================================
// VALIDAR SESIÓN
//======================================================

if (!usuario) {

    window.location.href =
        "../index.html";

} else {


    //==================================================
    // MOSTRAR USUARIO
    //==================================================

    const usuarioNombre =
        document.getElementById(
            "usuarioNombre"
        );


    const bienvenida =
        document.getElementById(
            "bienvenida"
        );


    if (usuarioNombre) {

        usuarioNombre.innerHTML =
            "<strong>" +
            (usuario.nombre || usuario.usuario || "") +
            "</strong>";

    }


    if (bienvenida) {

        bienvenida.textContent =
            "Rol: " +
            (usuario.rol || "");

    }


    //==================================================
    // REFERENCIAS
    //==================================================

    const cardUsuarios =
        document.getElementById(
            "cardUsuarios"
        );


    const cardMovilidad =
        document.getElementById(
            "cardMovilidad"
        );


    const cardFiscalizacion =
        document.getElementById(
            "cardFiscalizacion"
        );


    const menuUsuarios =
        document.getElementById(
            "menuUsuarios"
        );


    const menuMovilidad =
        document.getElementById(
            "menuMovilidad"
        );


    const menuFiscalizacion =
        document.getElementById(
            "menuFiscalizacion"
        );


    //==================================================
    // NORMALIZAR ROL
    //==================================================

    const rol =
        String(
            usuario.rol || ""
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();


    console.log(
        "Usuario:",
        usuario
    );


    console.log(
        "Rol:",
        rol
    );


    //==================================================
    // PERMISOS
    //==================================================

    switch (rol) {


        //==============================================
        // SUPER ADMIN
        //==============================================

        case "super admin":

            // Todo visible

            break;


        //==============================================
        // SUPERVISOR
        //==============================================

        case "supervisor":

            ocultar(
                cardUsuarios
            );

            ocultar(
                menuUsuarios
            );

            break;


        //==============================================
        // MOVILIDAD
        //==============================================

        case "movilidad":

            ocultar(
                cardUsuarios
            );

            ocultar(
                menuUsuarios
            );

            // Movilidad mantiene:
            // - Movilidad Urbana
            // - Fiscalización

            break;


        //==============================================
        // FISCALIZACION
        //==============================================

        case "fiscalizacion":

            ocultar(
                cardUsuarios
            );

            ocultar(
                cardMovilidad
            );

            ocultar(
                menuUsuarios
            );

            ocultar(
                menuMovilidad
            );

            break;


        //==============================================
        // ROL NO RECONOCIDO
        //==============================================

        default:

            console.error(
                "Rol no reconocido:",
                usuario.rol
            );

            cerrarSesion();

            return;

    }


    //==================================================
    // EVENTOS - USUARIOS
    //==================================================

    if (cardUsuarios) {

        cardUsuarios.onclick =
            function () {

                window.location.href =
                    "usuarios.html";

            };

    }


    if (menuUsuarios) {

        menuUsuarios.onclick =
            function () {

                window.location.href =
                    "usuarios.html";

            };

    }


    //==================================================
    // EVENTOS - MOVILIDAD
    //==================================================

    if (cardMovilidad) {

        cardMovilidad.onclick =
            function () {

                window.location.href =
                    "../modulos/movilidad/mapa.html";

            };

    }


    if (menuMovilidad) {

        menuMovilidad.onclick =
            function () {

                window.location.href =
                    "../modulos/movilidad/mapa.html";

            };

    }


    //==================================================
    // EVENTOS - FISCALIZACION
    //==================================================

    if (cardFiscalizacion) {

        cardFiscalizacion.onclick =
            function () {

                window.location.href =
                    "../modulos/fiscalizacion/inspecciones.html";

            };

    }


    if (menuFiscalizacion) {

        menuFiscalizacion.onclick =
            function () {

                window.location.href =
                    "../modulos/fiscalizacion/inspecciones.html";

            };

    }


}


//======================================================
// OCULTAR ELEMENTO
//======================================================

function ocultar(objeto) {

    if (objeto) {

        objeto.style.display =
            "none";

    }

}


//======================================================
// CERRAR SESIÓN
//======================================================

function cerrarSesion() {

    localStorage.removeItem(
        "usuarioActual"
    );

    window.location.href =
        "../index.html";

}
```