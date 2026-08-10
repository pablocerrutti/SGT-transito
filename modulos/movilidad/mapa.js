/*====================================================
  SGT - MAPA DE MOVILIDAD URBANA
  Responsive + POI + Panel desplegable
====================================================*/


/*====================================================
  ESTRUCTURA GENERAL
====================================================*/

.contenedorPrincipal{

    position:relative;

    display:grid;

    grid-template-columns:
        minmax(0, 1fr)
        340px;

    gap:16px;

    width:100%;

    min-height:0;

}


/*====================================================
  MAPA
====================================================*/

#map{

    width:100%;

    height:
        calc(100vh - 205px);

    min-height:420px;

    border-radius:14px;

    overflow:hidden;

    box-shadow:
        0 4px 16px rgba(0,0,0,.18);

}


/* Evita que Leaflet interfiera con el layout */

.leaflet-container{

    width:100%;

    height:100%;

    font-family:
        Arial,
        sans-serif;

}


/*====================================================
  PANEL NUEVO ELEMENTO
====================================================*/

.panel{

    width:100%;

    max-height:
        calc(100vh - 205px);

    overflow-y:auto;

    background:#ffffff;

    border-radius:14px;

    padding:18px;

    box-sizing:border-box;

    box-shadow:
        0 4px 16px rgba(0,0,0,.15);

}


/*====================================================
  FORMULARIO
====================================================*/

.panel h2{

    margin-top:0;

    margin-bottom:18px;

    color:#0d47a1;

    font-size:20px;

}


.panel label{

    display:block;

    margin-top:12px;

    margin-bottom:5px;

    font-weight:600;

    font-size:14px;

    color:#333;

}


.panel input,
.panel select,
.panel textarea{

    width:100%;

    box-sizing:border-box;

    padding:9px 10px;

    border:
        1px solid #ccc;

    border-radius:7px;

    font-family:inherit;

    font-size:14px;

}


.panel textarea{

    min-height:70px;

    resize:vertical;

}


.panel input:focus,
.panel select:focus,
.panel textarea:focus{

    outline:none;

    border-color:#1976d2;

    box-shadow:
        0 0 0 2px rgba(25,118,210,.12);

}


.panel button[type="submit"]{

    width:100%;

    margin-top:18px;

    padding:11px;

    border:none;

    border-radius:8px;

    background:#1976d2;

    color:#ffffff;

    font-weight:bold;

    font-size:15px;

    cursor:pointer;

}


.panel button[type="submit"]:hover{

    background:#1565c0;

}


/*====================================================
  BARRA SUPERIOR
====================================================*/

.barraSuperior{

    display:flex;

    align-items:center;

    gap:10px;

    flex-wrap:wrap;

    margin-bottom:10px;

}


.barraSuperior select,
.barraSuperior input{

    min-height:38px;

    box-sizing:border-box;

}


.barraSuperior input{

    flex:
        1 1 260px;

}


.barraSuperior button{

    min-height:38px;

    white-space:nowrap;

}


/*====================================================
  CONTROL DE CAPAS
====================================================*/

.leaflet-control-layers{

    border-radius:10px !important;

    box-shadow:
        0 3px 12px rgba(0,0,0,.25) !important;

    border:
        1px solid #ddd !important;

}


.leaflet-control-layers-expanded{

    padding:
        10px 12px !important;

}


.leaflet-control-layers label{

    font-size:14px;

    line-height:1.8;

}


/*====================================================
  POI - MARCADORES
====================================================*/

/*
  Leaflet no debe agregar fondo,
  borde ni dimensiones propias.
*/

.poi-elemento{

    background:transparent !important;

    border:none !important;

}


/*
  POI PRINCIPAL

  La punta inferior del marcador
  corresponde a la coordenada exacta.
*/

.poi-pin{

    position:relative;

    width:44px;

    height:56px;

    display:flex;

    justify-content:center;

    align-items:flex-start;

    filter:
        drop-shadow(
            0 3px 4px rgba(0,0,0,.35)
        );

}


/*
  CUERPO DEL POI

  Forma clásica tipo Google Maps.
*/

.poi-pin::before{

    content:"";

    position:absolute;

    top:0;

    left:2px;

    width:40px;

    height:40px;

    border-radius:
        50%
        50%
        50%
        0;

    transform:
        rotate(-45deg);

    background:#757575;

    border:
        3px solid #ffffff;

    box-sizing:border-box;

}


/*
  ICONO CENTRAL
*/

.poi-icono{

    position:absolute;

    top:8px;

    left:0;

    width:44px;

    height:30px;

    display:flex;

    align-items:center;

    justify-content:center;

    z-index:2;

    color:#ffffff;

    font-size:19px;

    line-height:1;

}


/*
  El icono nunca se rota.
*/

.poi-icono i{

    transform:none;

}


/*====================================================
  COLORES POI
====================================================*/

.poi-elemento.rojo .poi-pin::before{

    background:#e53935;

}


.poi-elemento.verde .poi-pin::before{

    background:#43a047;

}


.poi-elemento.azul .poi-pin::before{

    background:#1e88e5;

}


.poi-elemento.amarillo .poi-pin::before{

    background:#fbc02d;

}


.poi-elemento.naranja .poi-pin::before{

    background:#fb8c00;

}


.poi-elemento.violeta .poi-pin::before{

    background:#8e24aa;

}


.poi-elemento.celeste .poi-pin::before{

    background:#00acc1;

}


.poi-elemento.gris .poi-pin::before{

    background:#757575;

}


.poi-elemento.blanco .poi-pin::before{

    background:#ffffff;

    border:
        3px solid #777;

}


.poi-elemento.blanco .poi-icono{

    color:#333;

}


.poi-elemento.rosa .poi-pin::before{

    background:#ec407a;

}


.poi-elemento.cian .poi-pin::before{

    background:#00bcd4;

}


/*====================================================
  POI NUEVO
====================================================*/

.poi-elemento.nuevo .poi-pin::before{

    background:#1976d2;

    border:
        3px solid #ffffff;

}


.poi-elemento.nuevo .poi-icono{

    color:#ffffff;

}


/*====================================================
  HOVER
====================================================*/

.poi-elemento:hover .poi-pin{

    filter:
        drop-shadow(
            0 5px 8px rgba(0,0,0,.45)
        );

    transform:
        translateY(-2px);

}


.poi-elemento:hover .poi-pin::before{

    filter:
        brightness(1.08);

}


/*====================================================
  POPUP
====================================================*/

.popup-card{

    width:280px;

    max-width:
        calc(100vw - 50px);

    font-family:
        Arial,
        sans-serif;

}


.popup-card h2{

    margin:0;

    font-size:20px;

    color:#0d47a1;

}


.popup-linea{

    margin-top:10px;

    font-size:15px;

    line-height:1.5;

}


.popup-botones{

    display:flex;

    gap:10px;

    margin-top:15px;

}


.btn-inspeccion,
.btn-eliminar{

    flex:1;

    color:#ffffff;

    border:none;

    padding:10px;

    border-radius:8px;

    cursor:pointer;

    font-weight:bold;

}


.btn-inspeccion{

    background:#1976d2;

}


.btn-inspeccion:hover{

    background:#1565c0;

}


.btn-eliminar{

    background:#d32f2f;

}


.btn-eliminar:hover{

    background:#b71c1c;

}


.estado-popup{

    font-weight:bold;

    color:#2e7d32;

    font-size:16px;

}


/*====================================================
  MENSAJES
====================================================*/

.mensaje{

    min-height:20px;

}


/*====================================================
  TABLET
====================================================*/

@media (max-width:1000px){

    .contenedorPrincipal{

        grid-template-columns:
            minmax(0,1fr)
            300px;

        gap:10px;

    }


    #map{

        height:
            calc(100vh - 215px);

        min-height:400px;

    }


    .panel{

        padding:14px;

    }

}


/*====================================================
  CELULAR
====================================================*/

@media (max-width:700px){

    /*
      La página vuelve a ser vertical.
    */

    .contenedorPrincipal{

        display:flex;

        flex-direction:column;

        gap:10px;

    }


    /*
      El mapa ocupa una altura razonable
      y NO bloquea el scroll.
    */

    #map{

        width:100%;

        height:55vh;

        min-height:320px;

        max-height:520px;

        border-radius:12px;

    }


    /*
      Panel inicialmente compacto.
      JavaScript podrá agregar la clase .abierto.
    */

    .panel{

        width:100%;

        max-height:none;

        overflow:visible;

        padding:15px;

        border-radius:12px;

    }


    /*
      Cuando JavaScript utilice .panel-cerrado,
      ocultamos el formulario.
    */

    .panel.panel-cerrado{

        display:none;

    }


    /*
      Barra superior vertical.
    */

    .barraSuperior{

        display:grid;

        grid-template-columns:
            1fr 1fr;

        gap:8px;

    }


    .barraSuperior select,
    .barraSuperior input,
    .barraSuperior button{

        width:100%;

    }


    .barraSuperior input{

        grid-column:
            1 / -1;

    }


    #contadorResultados{

        grid-column:
            1 / -1;

        text-align:center;

    }


    /*
      Popup más cómodo para celular.
    */

    .popup-card{

        width:
            min(280px, calc(100vw - 70px));

    }


    .popup-botones{

        flex-direction:column;

    }


    .btn-inspeccion,
    .btn-eliminar{

        width:100%;

    }


    /*
      Control de capas más pequeño.
    */

    .leaflet-control-layers-expanded{

        font-size:13px;

        padding:8px !important;

    }

}


/*====================================================
  CELULARES PEQUEÑOS
====================================================*/

@media (max-width:450px){

    #map{

        height:50vh;

        min-height:280px;

    }


    .barraSuperior{

        grid-template-columns:1fr;

    }


    .barraSuperior input{

        grid-column:auto;

    }


    #contadorResultados{

        grid-column:auto;

    }


    .poi-pin{

        width:40px;

        height:52px;

    }


    .poi-pin::before{

        width:37px;

        height:37px;

    }


    .poi-icono{

        width:40px;

        font-size:17px;

    }

}


/*====================================================
  PANTALLAS CON POCA ALTURA
====================================================*/

@media (max-height:700px) and (min-width:701px){

    #map{

        height:
            calc(100vh - 175px);

        min-height:320px;

    }


    .panel{

        max-height:
            calc(100vh - 175px);

    }

}


/*====================================================
  EVITAR QUE LEAFLET BLOQUEE EL SCROLL EN CELULAR
====================================================*/

@media (max-width:700px){

    .leaflet-container{

        touch-action:
            pan-x pan-y;

    }

}