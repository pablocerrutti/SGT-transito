// =====================================================
// SGT
// Dashboard Principal
// =====================================================

const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

//======================================================
// VALIDAR SESIÓN
//======================================================

if (!usuario) {

    window.location.href = "../index.html";

}

//======================================================
// MOSTRAR USUARIO
//======================================================

document.getElementById("usuarioNombre").innerHTML =
    "<strong>" + usuario.nombre + "</strong>";

document.getElementById("bienvenida").innerHTML =
    "Rol: " + usuario.rol;

//======================================================
// REFERENCIAS
//======================================================

const cardUsuarios = document.getElementById("cardUsuarios");
const cardMovilidad = document.getElementById("cardMovilidad");
const cardFiscalizacion = document.getElementById("cardFiscalizacion");

const menuUsuarios = document.getElementById("menuUsuarios");
const menuMovilidad = document.getElementById("menuMovilidad");
const menuFiscalizacion = document.getElementById("menuFiscalizacion");

//======================================================
// PERMISOS
//======================================================

switch (usuario.rol) {

    case "Super Admin":

        break;

    case "Supervisor":

        break;

    case "Movilidad":

        ocultar(cardUsuarios);
        ocultar(cardFiscalizacion);

        ocultar(menuUsuarios);
        ocultar(menuFiscalizacion);

        break;

    case "Fiscalizacion":

        ocultar(cardUsuarios);
        ocultar(cardMovilidad);

        ocultar(menuUsuarios);
        ocultar(menuMovilidad);

        break;

    default:

        cerrarSesion();

}

//======================================================
// EVENTOS
//======================================================

cardUsuarios.onclick = () => {

    window.location.href = "usuarios.html";

};

menuUsuarios.onclick = () => {

    window.location.href = "usuarios.html";

};

cardMovilidad.onclick = () => {

    window.location.href = "../modulos/movilidad/mapa.html";

};

menuMovilidad.onclick = () => {

    window.location.href = "../modulos/movilidad/mapa.html";

};

cardFiscalizacion.onclick = () => {

    window.location.href =
        "../modulos/fiscalizacion/dashboard.html";

};

menuFiscalizacion.onclick = () => {

    window.location.href =
        "../modulos/fiscalizacion/dashboard.html";

};

//======================================================

function ocultar(objeto) {

    if (objeto) {

        objeto.style.display = "none";

    }

}

//======================================================

function cerrarSesion() {

    localStorage.removeItem("usuarioActual");

    window.location.href = "../index.html";

}