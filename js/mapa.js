// =====================================
// SGT - MAPA MOVILIDAD URBANA
// FIREBASE
// =====================================

import { db } from "./firebase-config.js";

import {
    ref,
    push,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let mapa;
let marcadorTemporal = null;
let ubicacionSeleccionada = null;
let marcadores = [];

const usuarioActual =
JSON.parse(localStorage.getItem("usuarioActual")) || {};

mapa = L.map("mapa").setView(
    [-34.0958,-56.2142],
    15
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom:19,
        attribution:"© OpenStreetMap"
    }
).addTo(mapa);

mapa.on("click",function(e){

    ubicacionSeleccionada=e.latlng;

    if(marcadorTemporal){

        mapa.removeLayer(marcadorTemporal);

    }

    marcadorTemporal=L.marker([
        e.latlng.lat,
        e.latlng.lng
    ]).addTo(mapa);

    marcadorTemporal
    .bindPopup("Ubicación seleccionada")
    .openPopup();

});

window.abrirNuevo=function(){

    document
    .getElementById("modal")
    .style.display="flex";

}

window.cerrarNuevo=function(){

    document
    .getElementById("modal")
    .style.display="none";

}

window.guardarElemento=function(){

    if(!ubicacionSeleccionada){

        alert("Seleccione una ubicación.");

        return;

    }

    const elemento={

        tipo:
        document.getElementById("tipo").value,

        codigo:
        document.getElementById("codigo").value,

        nombre:
        document.getElementById("nombre").value,

        descripcion:
        document.getElementById("descripcion").value,

        caracteristicas:
        document.getElementById("caracteristicas")
        .value
        .split("\n")
        .filter(x=>x.trim()!==""),

        actuaciones:[
            {

                fecha:
                new Date()
                .toLocaleDateString("es-UY"),

                accion:
                document
                .getElementById("actuacion")
                .value,

                responsable:
                usuarioActual.nombre || "Sistema"

            }
        ],

        estado:"Activo",

        lat:ubicacionSeleccionada.lat,

        lng:ubicacionSeleccionada.lng

    };

    const nuevoRef=
    push(ref(db,"elementos"));

    set(
        nuevoRef,
        elemento
    );

    cerrarNuevo();

}
// =====================================
// SINCRONIZAR FIREBASE
// =====================================

onValue(ref(db, "elementos"), function(snapshot){

    marcadores.forEach(function(m){

        mapa.removeLayer(m);

    });

    marcadores=[];

    if(!snapshot.exists()) return;

    snapshot.forEach(function(item){

        crearMarcador(item.val());

    });

});



// =====================================
// CREAR MARCADOR
// =====================================

function crearMarcador(elemento){

    let icono="📍";

    switch(elemento.tipo){

        case "Semáforo":
            icono="🚦";
            break;

        case "Paso peatonal":
            icono="🚸";
            break;

        case "Parada de taxi":
            icono="🚕";
            break;

        case "Carga y descarga":
            icono="🚚";
            break;

        case "Cordón reservado":
            icono="🅿️";
            break;

    }

    let marcador=L.marker([
        elemento.lat,
        elemento.lng
    ]).addTo(mapa);

    marcadores.push(marcador);

    marcador.bindTooltip(
        `
        <b>${icono} ${elemento.tipo}</b>
        <br>
        ${elemento.codigo}
        <br>
        ${elemento.nombre}
        `
    );

    marcador.bindPopup(
        `
        <h3>${elemento.nombre}</h3>

        <b>Código:</b>
        ${elemento.codigo}

        <br><br>

        <b>Tipo:</b>
        ${elemento.tipo}

        <br><br>

        <b>Estado:</b>
        ${elemento.estado}

        <br><br>

        <b>Descripción:</b>
        ${elemento.descripcion}

        <br><br>

        <b>Características:</b>

        <ul>

        ${
            (elemento.caracteristicas || [])
            .map(c=>`<li>${c}</li>`)
            .join("")
        }

        </ul>

        <b>Actuaciones:</b>

        <ul>

        ${
            (elemento.actuaciones || [])
            .map(a=>`
                <li>
                    ${a.fecha}
                    <br>
                    ${a.accion}
                    <br>
                    ${a.responsable}
                </li>
            `)
            .join("")
        }

        </ul>
        `
    );

}