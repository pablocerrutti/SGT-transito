//======================================================
// SGT - MOVILIDAD URBANA
// mapa.js
//======================================================

let mapa;
let marcadorNuevo = null;
let marcadores = [];

//======================================================
// INICIAR
//======================================================

window.onload = function () {

    comprobarSesion();

    iniciarMapa();

    cargarTipos();

    cargarElementos();

    document
        .getElementById("formElemento")
        .addEventListener("submit", guardarElemento);

    document
        .getElementById("btnActualizar")
        .addEventListener("click", cargarElementos);

    document
        .getElementById("filtroTipo")
        .addEventListener("change", filtrar);

    document
        .getElementById("buscar")
        .addEventListener("keyup", filtrar);

    document
        .getElementById("btnDashboard")
        .onclick = function () {

            window.location.href = "../../pages/dashboard.html";

        };

    document
        .getElementById("btnSalir")
        .onclick = salir;

};

//======================================================
// COMPROBAR SESIÓN
//======================================================

function comprobarSesion() {

    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

    if (!usuario) {

        window.location.href = "../../index.html";
        return;

    }

    document.getElementById("usuarioActual").innerHTML =
        "<strong>" + usuario.nombre + "</strong>";

}

//======================================================
// MAPA
//======================================================

function iniciarMapa() {

    mapa = L.map("map").setView([-34.0997, -56.2140], 15);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(mapa);

    mapa.on("click", function (e) {

        document.getElementById("lat").value = e.latlng.lat;
        document.getElementById("lng").value = e.latlng.lng;

        if (marcadorNuevo) {

            mapa.removeLayer(marcadorNuevo);

        }

        marcadorNuevo = L.marker(e.latlng).addTo(mapa);

    });

}

//======================================================
// TIPOS
//======================================================

function cargarTipos() {

    const tipos = [

        "Semáforo",
        "Radar",
        "Cruce Peatonal",
        "Lomo de Burro",
        "Cartel",
        "Señal Vertical",
        "Señal Horizontal",
        "Cámara",
        "Otro"

    ];

    const select = document.getElementById("tipo");
    const filtro = document.getElementById("filtroTipo");

    select.innerHTML = "";
    filtro.innerHTML = '<option value="">Todos los elementos</option>';

    tipos.forEach(function (tipo) {

        select.innerHTML += `<option value="${tipo}">${tipo}</option>`;

        filtro.innerHTML += `<option value="${tipo}">${tipo}</option>`;

    });

}

//======================================================
// CARGAR ELEMENTOS
//======================================================

async function cargarElementos() {

    marcadores.forEach(function (m) {

        mapa.removeLayer(m);

    });

    marcadores = [];

    const respuesta = await apiObtenerElementos();

    if (!respuesta.ok) {

        alert(respuesta.mensaje);
        return;

    }

    respuesta.datos.forEach(function (e) {

        if (!e.latitud || !e.longitud) return;

        const marcador = L.marker([

            Number(e.latitud),

            Number(e.longitud)

        ]).addTo(mapa);

        marcador.bindPopup(

            `
            <b>${e.nombre}</b><br>
            ${e.tipo}<br>
            Estado: ${e.estado}<br>
            ${e.direccion}
            `

        );

        marcador.datos = e;

        marcadores.push(marcador);

    });

}

//======================================================
// GUARDAR ELEMENTO
//======================================================

async function guardarElemento(evento) {

    evento.preventDefault();

    const elemento = {

        tipo: document.getElementById("tipo").value,
        codigo: document.getElementById("codigo").value,
        serie: document.getElementById("serie").value,
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        direccion: document.getElementById("direccion").value,
        estado: document.getElementById("estado").value,
        caracteristicas: document.getElementById("caracteristicas").value,
        latitud: document.getElementById("lat").value,
        longitud: document.getElementById("lng").value

    };

    if (elemento.latitud === "" || elemento.longitud === "") {

        alert("Debe seleccionar un punto en el mapa.");

        return;

    }

    const respuesta = await apiGuardarElemento(elemento);

    if (!respuesta.ok) {

        alert(respuesta.mensaje);

        return;

    }

    alert("Elemento guardado correctamente.");

    document.getElementById("formElemento").reset();

    document.getElementById("lat").value = "";
    document.getElementById("lng").value = "";

    if (marcadorNuevo) {

        mapa.removeLayer(marcadorNuevo);

        marcadorNuevo = null;

    }

    cargarElementos();

}

//======================================================
// FILTRAR
//======================================================

function filtrar() {

    const texto = document
        .getElementById("buscar")
        .value
        .toLowerCase();

    const tipo = document
        .getElementById("filtroTipo")
        .value;

    marcadores.forEach(function (marcador) {

        const d = marcador.datos;

        let visible = true;

        if (tipo !== "" && d.tipo !== tipo) {

            visible = false;

        }

        if (texto !== "") {

            const nombre = (d.nombre || "").toLowerCase();
            const codigo = (d.codigo || "").toLowerCase();
            const direccion = (d.direccion || "").toLowerCase();

            if (

                !nombre.includes(texto) &&
                !codigo.includes(texto) &&
                !direccion.includes(texto)

            ) {

                visible = false;

            }

        }

        if (visible) {

            if (!mapa.hasLayer(marcador)) {

                marcador.addTo(mapa);

            }

        } else {

            if (mapa.hasLayer(marcador)) {

                mapa.removeLayer(marcador);

            }

        }

    });

}

//======================================================
//