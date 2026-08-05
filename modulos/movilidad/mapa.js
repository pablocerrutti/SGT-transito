// SGT - MOVILIDAD URBANA / MAPA

let mapa;
let marcadorNuevo = null;
let capaMarcadores;
let elementos = [];
let categorias = [];


document.addEventListener(
  'DOMContentLoaded',
  iniciarPagina
);



async function iniciarPagina(){

  if(!comprobarSesion())
    return;


  iniciarMapa();


  await cargarCategorias();


  enlazarEventos();


  cargarElementos();

}



function comprobarSesion(){

  let usuario;


  try{

    usuario =
      JSON.parse(
        localStorage.getItem(
          'usuarioActual'
        )
      );

  }catch(_){

    usuario=null;

  }



  if(!usuario){

    window.location.href =
      '../../index.html';

    return false;

  }



  const rol =
    normalizar(usuario.rol);



  if(
    ![
      'super admin',
      'supervisor',
      'movilidad'
    ].includes(rol)
  ){

    window.location.href =
      '../../pages/dashboard.html';

    return false;

  }



  document.getElementById(
    'usuarioActual'
  ).textContent =
    usuario.nombre ||
    usuario.usuario ||
    '';



  return true;

}




function iniciarMapa(){


  mapa =
    L.map('map')
    .setView(
      [-34.0997,-56.2140],
      15
    );



  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {

      attribution:
        '© OpenStreetMap',

      maxZoom:19

    }

  ).addTo(mapa);



  capaMarcadores =
    L.layerGroup()
    .addTo(mapa);



  mapa.on(
    'click',
    seleccionarUbicacion
  );



  setTimeout(
    function(){

      mapa.invalidateSize();

    },
    150
  );


}




async function cargarCategorias(){


  const respuesta =
    await apiObtenerCategorias();



  if(
    !respuesta ||
    !respuesta.ok
  ){

    mostrarMensaje(
      'No se pudieron cargar las categorías',
      'error'
    );

    return;

  }



  categorias =
    (respuesta.datos || [])
    .filter(function(c){

      return String(
        c.activo
      )
      .toUpperCase()==='SI';

    });




  const tipo =
    document.getElementById(
      'tipo'
    );



  const filtro =
    document.getElementById(
      'filtroTipo'
    );



  tipo.replaceChildren();


  filtro.replaceChildren(
    new Option(
      'Todos los elementos',
      ''
    )
  );




  categorias.forEach(function(c){


    tipo.add(
      new Option(
        c.nombre,
        c.nombre
      )
    );



    filtro.add(
      new Option(
        c.nombre,
        c.nombre
      )
    );


  });


}




function obtenerCategoria(nombre){


  return categorias.find(function(c){

    return normalizar(c.nombre) ===
           normalizar(nombre);

  }) || null;


}




function enlazarEventos(){


  document
  .getElementById(
    'formElemento'
  )
  .addEventListener(
    'submit',
    guardarElemento
  );



  document
  .getElementById(
    'btnActualizar'
  )
  .addEventListener(
    'click',
    cargarElementos
  );



  document
  .getElementById(
    'filtroTipo'
  )
  .addEventListener(
    'change',
    renderizarMarcadores
  );



  document
  .getElementById(
    'buscar'
  )
  .addEventListener(
    'input',
    renderizarMarcadores
  );



  document
  .getElementById(
    'btnDashboard'
  )
  .addEventListener(
    'click',
    function(){

      window.location.href =
        '../../pages/dashboard.html';

    }
  );



  document
  .getElementById(
    'btnInspecciones'
  )
  .addEventListener(
    'click',
    function(){

      window.location.href =
        '../movilidad/inspeccion.html';

    }
  );



  document
  .getElementById(
    'btnSalir'
  )
  .addEventListener(
    'click',
    salir
  );


}
function seleccionarUbicacion(evento){


  const lat =
    evento.latlng.lat;


  const lng =
    evento.latlng.lng;



  document.getElementById('lat').value =
    lat.toFixed(7);



  document.getElementById('lng').value =
    lng.toFixed(7);




  if(marcadorNuevo)
    mapa.removeLayer(marcadorNuevo);




  marcadorNuevo =
    L.marker(
      [lat,lng],
      {
        icon:crearIcono(
          'Otro',
          true
        ),
        draggable:true
      }
    )
    .addTo(mapa)
    .bindTooltip(
      'Ubicación del nuevo elemento'
    )
    .openTooltip();




  marcadorNuevo.on(
    'dragend',
    function(e){

      const p =
        e.target.getLatLng();


      document.getElementById('lat').value =
        p.lat.toFixed(7);


      document.getElementById('lng').value =
        p.lng.toFixed(7);

    }
  );



  mostrarMensaje(
    'Ubicación seleccionada',
    'exito'
  );

}




async function cargarElementos(){


  const boton =
    document.getElementById(
      'btnActualizar'
    );



  if(boton)
    boton.disabled=true;



  const respuesta =
    await apiObtenerElementos();




  if(boton)
    boton.disabled=false;




  if(
    !respuesta ||
    !respuesta.ok
  ){

    mostrarMensaje(
      respuesta.mensaje ||
      'No se pudieron cargar los elementos.',
      'error'
    );

    return;

  }



  elementos =
    Array.isArray(
      respuesta.datos
    )
    ? respuesta.datos
    : [];



  renderizarMarcadores();

}




function renderizarMarcadores(){


  if(!capaMarcadores)
    return;




  const tipo =
    document.getElementById(
      'filtroTipo'
    ).value;



  const texto =
    normalizar(
      document.getElementById(
        'buscar'
      ).value
    );




  const validos =
    elementos.filter(
      esElementoUbicable
    );




  const visibles =
    validos.filter(function(e){


      if(
        tipo &&
        normalizar(e.tipo)!==
        normalizar(tipo)
      )
        return false;



      return !texto ||
      normalizar(
        [
          e.codigo,
          e.nombre,
          e.tipo,
          e.direccion,
          e.estado
        ].join(' ')
      )
      .includes(texto);



    });




  capaMarcadores.clearLayers();




  visibles.forEach(function(e){


    const lat =
      coordenada(e.latitud);


    const lng =
      coordenada(e.longitud);




    const marcador =
      L.marker(
        [lat,lng],
        {
          icon:
            crearIcono(
              e.tipo
            )
        }
      );




    marcador.bindPopup(
      crearPopup(e),
      {
        maxWidth:380
      }
    );




    marcador.on(
      'popupopen',
      function(){

        enlazarAccionesPopup(
          marcador,
          e
        );

      }
    );




    marcador.addTo(
      capaMarcadores
    );


  });




  const contador =
    document.getElementById(
      'contadorResultados'
    );



  if(contador){

    contador.textContent =
      visibles.length+
      ' de '+
      validos.length+
      ' elementos';

  }


}





function esElementoUbicable(e){


  const id =
    String(e.id || '')
    .trim();



  const codigo =
    String(e.codigo || '')
    .trim();



  const lat =
    coordenada(
      e.latitud
    );



  const lng =
    coordenada(
      e.longitud
    );



  const inactivo =
    [
      'no',
      'false',
      '0'
    ]
    .includes(
      normalizar(e.activo)
    );



  return Boolean(
    id &&
    codigo &&
    !inactivo &&
    lat!==null &&
    lng!==null
  );


}





// ICONOS DEL MAPA DESDE CATEGORIAS

function crearIcono(tipo,pendiente){


  const categoria =
    obtenerCategoria(tipo);



  let simbolo =
    '📍';



  if(categoria){


    const iconos = {


      'traffic-light':'🚦',

      'camera':'📡',

      'person-walking':'🚶',

      'road':'⚠️',

      'signs-post':'🪧',

      'location-dot':'📍',

      'parking':'🅿️',

      'bi-taxi':'🚕',

      'disc. parking':'♿',

      'Otros':'•'


    };



    simbolo =
      iconos[categoria.icono] ||
      '📍';


  }





  return L.divIcon({


    className:
      'icono-elemento '+
      (
        categoria
        ? categoria.color
        : 'gris'
      )
      +
      (
        pendiente
        ? ' pendiente'
        : ''
      ),




    html:
      '<span class="icono-mapa">'+
      simbolo+
      '</span>',




    iconSize:[
      42,
      42
    ],



    iconAnchor:[
      21,
      42
    ],



    popupAnchor:[
      0,
      -42
    ]


  });


}
function crearPopup(e){

  return `
  <article class="popup-elemento">

    <h3>
      ${escapar(e.codigo || 'Sin código')}
    </h3>

    ${campoPopup('Tipo',e.tipo)}
    ${campoPopup('Nombre',e.nombre)}
    ${campoPopup('Serie',e.serie)}
    ${campoPopup('Estado',e.estado)}
    ${campoPopup('Dirección',e.direccion)}
    ${campoPopup('Descripción',e.descripcion)}
    ${campoPopup('Características',e.caracteristicas)}
    ${campoPopup('Fecha alta',e.fechaAlta)}
    ${campoPopup('Usuario',e.usuarioAlta)}


    <button
      type="button"
      class="btn-eliminar-elemento"
      data-accion="eliminar-elemento">

      <i class="fa-solid fa-trash"></i>
      Eliminar elemento

    </button>


  </article>
  `;

}




function campoPopup(etiqueta,valor){

  if(
    valor===undefined ||
    valor===null ||
    String(valor).trim()===''
  )
    return '';


  return `

  <p>
    <span class="etiqueta-popup">
      ${escapar(etiqueta)}:
    </span>

    ${escapar(valor)}

  </p>

  `;

}




function enlazarAccionesPopup(marcador,elemento){


  const contenido =
    marcador.getPopup()
    .getElement();



  const boton =
    contenido &&
    contenido.querySelector(
      '[data-accion="eliminar-elemento"]'
    );



  if(boton){


    boton.addEventListener(

      'click',

      function(){

        eliminarElementoDesdeMapa(
          elemento
        );

      },

      {
        once:true
      }

    );

  }

}





async function eliminarElementoDesdeMapa(elemento){


  const codigo =
    elemento.codigo ||
    'este elemento';



  if(
    !confirm(
      '¿Eliminar '+
      codigo+
      '?'
    )
  )
    return;




  const respuesta =
    await apiEliminarElemento(
      elemento.id
    );



  if(
    !respuesta ||
    !respuesta.ok
  ){

    mostrarMensaje(
      respuesta.mensaje ||
      'No fue posible eliminar.',
      'error'
    );

    return;

  }




  mapa.closePopup();



  elementos =
    elementos.filter(function(e){

      return String(e.id)!==
             String(elemento.id);

    });




  renderizarMarcadores();



  mostrarMensaje(
    'Elemento eliminado.',
    'exito'
  );


}







async function guardarElemento(evento){


  evento.preventDefault();



  const latitud =
    document.getElementById('lat').value;



  const longitud =
    document.getElementById('lng').value;




  if(
    !latitud ||
    !longitud
  ){

    mostrarMensaje(
      'Seleccione una ubicación en el mapa.',
      'error'
    );

    return;

  }




  const tipo =
    valor('tipo');



  const categoria =
    obtenerCategoria(tipo);




  const usuario =
    (()=>{

      try{

        const u =
          JSON.parse(
            localStorage.getItem(
              'usuarioActual'
            )
          );


        return u.nombre ||
               u.usuario;


      }
      catch(_){

        return '';

      }


    })();





  const elemento = {


    tipo:tipo,


    icono:
      categoria
      ? categoria.icono
      : '',



    color:
      categoria
      ? categoria.color
      : '',




    nombre:
      valor('nombre'),



    descripcion:
      valor('descripcion'),



    latitud:
      latitud,



    longitud:
      longitud,



    direccion:
      valor('direccion'),



    estado:
      valor('estado'),



    caracteristicas:
      valor('caracteristicas'),



    usuario:
      usuario


  };





  const boton =
    document.querySelector(
      '#formElemento button[type="submit"]'
    );



  if(boton)
    boton.disabled=true;





  const respuesta =
    await apiGuardarElemento(
      elemento
    );





  if(boton)
    boton.disabled=false;





  if(
    !respuesta ||
    !respuesta.ok
  ){

    mostrarMensaje(
      respuesta.mensaje ||
      'No se pudo guardar.',
      'error'
    );

    return;

  }





  document.getElementById('codigo').value =
    respuesta.codigo || '';



  document.getElementById('serie').value =
    respuesta.serie || '';





  document
    .getElementById('formElemento')
    .reset();





  if(marcadorNuevo){


    mapa.removeLayer(
      marcadorNuevo
    );


    marcadorNuevo=null;


  }






  mostrarMensaje(

    'Elemento guardado: '+
    respuesta.codigo,

    'exito'

  );





  await cargarElementos();



}







function valor(id){

  const e =
    document.getElementById(id);


  return e
    ? e.value.trim()
    : '';

}





function coordenada(valor){


  const numero =
    Number(
      String(valor || '')
      .replace(',','.')
    );



  return Number.isFinite(numero)
    ? numero
    : null;


}






function normalizar(valor){


  return String(valor || '')

    .normalize('NFD')

    .replace(
      /[\u0300-\u036f]/g,
      ''
    )

    .toLowerCase()

    .trim();


}







function escapar(valor){


  return String(valor || '')

    .replace(/&/g,'&amp;')

    .replace(/</g,'&lt;')

    .replace(/>/g,'&gt;')

    .replace(/"/g,'&quot;')

    .replace(/'/g,'&#039;');


}







function mostrarMensaje(texto,tipo){


  const mensaje =
    document.getElementById(
      'mensajeMapa'
    );



  if(!mensaje)
    return;



  mensaje.textContent =
    texto || '';



  mensaje.className =
    'mensaje '+
    (tipo || '');



}







function salir(){


  localStorage.removeItem(
    'usuarioActual'
  );



  window.location.href =
    '../../index.html';


}
