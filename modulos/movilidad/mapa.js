
//======================================================
// SGT - MOVILIDAD
// MAPA
//======================================================

let mapa;
let marcadorNuevo = null;
let marcadores = [];

//======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

    iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

});

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

function comprobarSesion() {

    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

    if (!usuario) {

        window.location.href = "../../index.html";

        return;

    }

    document.getElementById("usuarioActual").innerHTML = usuario.nombre;

}

//======================================================

function iniciarMapa() {

    mapa = L.map("map").setView([-34.0997,-56.2140],15);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap"

        }

    ).addTo(mapa);

    setTimeout(function () {

    mapa.invalidateSize();

}, 300);

    mapa.on("click",function(e){

        document.getElementById("lat").value=e.latlng.lat;
        document.getElementById("lng").value=e.latlng.lng;

        if(marcadorNuevo){

            mapa.removeLayer(marcadorNuevo);

        }

        marcadorNuevo=L.marker(e.latlng).addTo(mapa);

    });

}

//======================================================

function cargarTipos(){

    const tipos=[

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

    const tipo=document.getElementById("tipo");
    const filtro=document.getElementById("filtroTipo");

    tipo.innerHTML="";
    filtro.innerHTML="<option value=''>Todos</option>";

    tipos.forEach(function(t){

        tipo.innerHTML+=`<option value="${t}">${t}</option>`;
        filtro.innerHTML+=`<option value="${t}">${t}</option>`;

    });

}

//======================================================

async function cargarElementos(){

    marcadores.forEach(function(m){

        mapa.removeLayer(m);

    });

    marcadores=[];

    const respuesta=await apiObtenerElementos();

    console.log("RESPUESTA API");
    console.log(respuesta);

    if(!respuesta.ok){

        alert(respuesta.mensaje);

        return;

    }

    respuesta.datos.forEach(function(e){

        console.log(e);

        const lat=parseFloat(e.latitud);
        const lng=parseFloat(e.longitud);

        if(isNaN(lat) || isNaN(lng)){

            console.warn("Elemento sin coordenadas",e);

            return;

        }

   const marcador = L.marker([lat,lng]).addTo(mapa);

        marcador.bindPopup(

            "<b>"+e.nombre+"</b><br>"+
            e.tipo+"<br>"+
            e.direccion

        );

        marcador.datos=e;

        marcadores.push(marcador);

    });

    console.log("Marcadores cargados:",marcadores.length);

}

//======================================================

async function guardarElemento(ev){

    ev.preventDefault();

    const elemento={

        codigo:document.getElementById("codigo").value,
        tipo:document.getElementById("tipo").value,
        serie:document.getElementById("serie").value,
        nombre:document.getElementById("nombre").value,
        descripcion:document.getElementById("descripcion").value,
        latitud:document.getElementById("lat").value,
        longitud:document.getElementById("lng").value,
        direccion:document.getElementById("direccion").value,
        estado:document.getElementById("estado").value,
        caracteristicas:document.getElementById("caracteristicas").value

    };

    console.log(elemento);

    const r=await apiGuardarElemento(elemento);

    console.log(r);

    if(!r.ok){

        alert(r.mensaje);

        return;

    }

    alert("Elemento guardado.");

    document.getElementById("formElemento").reset();

    if(marcadorNuevo){

        mapa.removeLayer(marcadorNuevo);

        marcadorNuevo=null;

    }

    cargarElementos();

}

//======================================================

function filtrar(){

}

//======================================================

function salir(){

    localStorage.removeItem("usuarioActual");

    window.location.href="../../index.html";

}
