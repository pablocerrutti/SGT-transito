// =====================================================
// SGT
// Dashboard Principal
// =====================================================

let usuario = null;
try { usuario = JSON.parse(localStorage.getItem("usuarioActual")); } catch (_) {}

//======================================================
// VALIDAR SESIÓN
//======================================================

if (!usuario) {
    window.location.href = "../index.html";
} else {

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

switch (String(usuario.rol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) {

    case "super admin":

        break;

    case "supervisor":
        ocultar(cardUsuarios);
        ocultar(menuUsuarios);
        break;

    case "movilidad":

        ocultar(cardUsuarios);
        ocultar(cardFiscalizacion);

        ocultar(menuUsuarios);
        ocultar(menuFiscalizacion);

        break;

    case "fiscalizacion":

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
        "../modulos/fiscalizacion/inspecciones.html";

};

menuFiscalizacion.onclick = () => {

    window.location.href =
        "../modulos/fiscalizacion/inspecciones.html";

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
}
