//==================================================
// SGT - ESPACIO RESERVADO
// Integración completa con MOVILIDAD.
// Misma lógica que CORDÓN ROJO:
// - exactamente 2 puntos
// - segundo punto finaliza automáticamente
// - eliminación lógica mediante API
// Diferencia visual: amarillo.
//==================================================
(function(){
'use strict';

const TIPO='Espacio Reservado';
const COLOR='#FFD400';

let capa=null;
let espacios=[];
let dibujando=false;
let puntos=[];
let lineaTemporal=null;
let instalado=false;
let renderOriginal=null;
let eliminarOriginal=null;

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

function usuario(){
  try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};}catch(_){return {};}
}

function soloConsulta(){
  const r=norm(usuario().rol);
  return r==='supervisor movilidad'||r==='consulta movilidad';
}

function disponible(){
  return typeof mapa!=='undefined'&&mapa&&typeof L!=='undefined';
}

function mensaje(t,c){
  if(typeof mostrarMensaje==='function')mostrarMensaje(t,c||'');
}

function leerPuntos(v){
  let a=v;
  if(typeof a==='string'){
    try{a=JSON.parse(a);}catch(_){return [];}
  }
  if(!Array.isArray(a))return [];
  return a.map(function(p){
    if(!Array.isArray(p)||p.length<2)return null;
    const lat=Number(String(p[0]).replace(',','.'));
    const lng=Number(String(p[1]).replace(',','.'));
    return Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lng)&&lng>=-180&&lng<=180?[lat,lng]:null;
  }).filter(Boolean);
}

function activo(v){
  return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].includes(String(v==null?'':v).trim().toUpperCase());
}

function asegurarCapa(){
  if(!disponible())return null;
  if(!capa)capa=L.layerGroup().addTo(mapa);
  return capa;
}

function asegurarCategoria(){
  ['tipo','filtroTipo'].forEach(function(id){
    const s=document.getElementById(id);
    if(!s)return;
    const existe=Array.from(s.options).some(function(o){
      return norm(o.value||o.text)===norm(TIPO);
    });
    if(!existe)s.add(new Option(TIPO,TIPO));
  });
}

function restaurarClickMapa(){
  if(disponible()&&typeof seleccionarUbicacion==='function')mapa.on('click',seleccionarUbicacion);
}

function cancelar(){
  if(disponible()&&typeof seleccionarUbicacion==='function')mapa.off('click',seleccionarUbicacion);
  if(disponible())mapa.off('click',capturar);
  dibujando=false;
  puntos=[];
  if(lineaTemporal){lineaTemporal.remove();lineaTemporal=null;}
  if(disponible()){
    mapa.getContainer().style.cursor='';
    restaurarClickMapa();
  }
}

function iniciar(){
  if(soloConsulta()){
    mensaje('Este rol solo puede consultar el mapa y generar informes.','error');
    return;
  }
  if(!disponible())return;

  asegurarCategoria();
  cancelar();

  dibujando=true;
  puntos=[];
  mapa.getContainer().style.cursor='crosshair';

  const tipo=document.getElementById('tipo');
  if(tipo)tipo.value=TIPO;

  const estado=document.getElementById('estadoCordon');
  if(estado){
    estado.textContent='Marque 2 puntos sobre el borde. El segundo punto finaliza automáticamente.';
    estado.className='dibujando';
  }

  if(typeof actualizarTextoAyuda==='function'){
    actualizarTextoAyuda('Marque exactamente 2 puntos para definir el espacio reservado. El segundo punto finaliza automáticamente.');
  }

  mensaje('Dibujando espacio reservado...','');
  mapa.on('click',capturar);
}

function capturar(e){
  if(!dibujando||puntos.length>=2)return;

  puntos.push([
    Number(e.latlng.lat.toFixed(7)),
    Number(e.latlng.lng.toFixed(7))
  ]);

  if(lineaTemporal)lineaTemporal.remove();

  lineaTemporal=L.polyline(puntos,{
    color:COLOR,
    weight:5,
    opacity:.95,
    lineCap:'round',
    lineJoin:'round',
    interactive:false
  }).addTo(mapa);

  const estado=document.getElementById('estadoCordon');
  if(estado)estado.textContent='Puntos marcados: '+puntos.length+'.';

  if(puntos.length===2)finalizar();
}

function finalizar(){
  if(!dibujando||puntos.length!==2)return;

  mapa.off('click',capturar);
  dibujando=false;
  mapa.getContainer().style.cursor='';

  const c=document.getElementById('coordenadas');
  if(c)c.value=JSON.stringify(puntos.slice(0,2));

  const tipo=document.getElementById('tipo');
  if(tipo)tipo.value=TIPO;

  const nombre=document.getElementById('nombre');
  if(nombre&&!nombre.value)nombre.value=TIPO;

  if(typeof mostrarPanelNuevoElemento==='function')mostrarPanelNuevoElemento();
  if(typeof actualizarTextoAyuda==='function')actualizarTextoAyuda('Complete los datos del espacio reservado y guarde.');

  mensaje('Espacio reservado definido. Complete los datos y guarde.','');
}

async function guardar(e){
  if(e){
    e.preventDefault();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
  }

  const c=document.getElementById('coordenadas');
  const ps=leerPuntos(c&&c.value);

  if(ps.length!==2){
    mensaje('El espacio reservado debe definirse con exactamente 2 puntos.','error');
    return false;
  }

  try{
    const x=usuario();
    const val=function(id){const z=document.getElementById(id);return z?z.value:'';};

    const datos={
      tipo:TIPO,
      nombre:val('nombre')||TIPO,
      descripcion:val('descripcion'),
      direccion:val('direccion'),
      estado:val('estado')||'Activo',
      caracteristicas:val('caracteristicas'),
      coordenadas:JSON.stringify(ps),
      usuario:x.usuario||x.nombre||'admin',
      usuarioAlta:x.usuario||x.nombre||'admin',
      rol:x.rol||''
    };

    const r=await api('guardarEspacioReservado',datos);

    if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible guardar el espacio reservado.');

    mensaje('Espacio reservado '+(r.codigo||'')+' guardado correctamente.','exito');

    const form=document.getElementById('formElemento');
    if(form)form.reset();

    if(lineaTemporal){lineaTemporal.remove();lineaTemporal=null;}

    await cargar();
    restaurarClickMapa();

    if(typeof actualizarTextoAyuda==='function'){
      actualizarTextoAyuda('Seleccione un punto del mapa para registrar un nuevo elemento.');
    }

    return false;
  }catch(err){
    mensaje(err.message||'No fue posible guardar el espacio reservado.','error');
    restaurarClickMapa();
    return false;
  }
}

async function cargar(){
  try{
    const r=await api('obtenerEspaciosReservados');
    if(!r||r.ok===false)return;
    espacios=Array.isArray(r.datos)?r.datos:[];
    dibujar();
  }catch(e){
    console.warn('SGT espacio reservado:',e);
  }
}

function dibujar(){
  const g=asegurarCapa();
  if(!g)return;

  g.clearLayers();

  const filtro=(document.getElementById('filtroTipo')||{}).value||'';
  const loc=norm((document.getElementById('filtroLocalidad')||{}).value||'');
  const txt=norm((document.getElementById('buscar')||{}).value||'');

  if(filtro&&norm(filtro)!==norm(TIPO))return;

  espacios.forEach(function(e){
    if(!activo(e.activo))return;

    const localidad=norm(e.localidad||e.localidadNombre||'');
    if(loc&&localidad!==loc)return;

    const cadena=norm([
      e.id,e.codigo,e.tipo,e.serie,e.nombre,e.descripcion,
      e.direccion,e.estado,e.caracteristicas,e.localidad
    ].join(' '));

    if(txt&&!cadena.includes(txt))return;

    const ps=leerPuntos(e.coordenadas);
    if(ps.length!==2)return;

    const linea=L.polyline(ps,{
      color:COLOR,
      weight:6,
      opacity:.98,
      lineCap:'round',
      lineJoin:'round',
      interactive:true
    });

    if(typeof crearPopup==='function'){
      linea.bindPopup(crearPopup({
        id:e.id,
        codigo:e.codigo||'ER',
        tipo:TIPO,
        serie:e.serie||'',
        nombre:e.nombre||TIPO,
        descripcion:e.descripcion||'-',
        direccion:e.direccion||'-',
        estado:e.estado||'Activo',
        caracteristicas:e.caracteristicas||'-',
        localidadNombre:e.localidad||e.localidadNombre||'Sin localidad'
      }));
    }

    linea.addTo(g);
  });
}

async function eliminar(id){
  if(!confirm('¿Está seguro de eliminar este espacio reservado?'))return;

  try{
    const r=await api('eliminarEspacioReservado',{
      id:id,
      usuario:usuario().usuario||usuario().nombre||'admin',
      rol:usuario().rol||''
    });

    if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible eliminar el espacio reservado.');

    mensaje('Espacio reservado eliminado correctamente.','exito');
    await cargar();
  }catch(err){
    mensaje(err.message||'No fue posible eliminar el espacio reservado.','error');
  }
}

function envolverRender(){
  if(typeof window.renderizarMapaCompleto==='function'){
    renderOriginal=window.renderizarMapaCompleto;

    window.renderizarMapaCompleto=function(){
      const filtro=(document.getElementById('filtroTipo')||{}).value||'';

      if(norm(filtro)===norm(TIPO)){
        if(typeof capaMarcadores!=='undefined'&&capaMarcadores)capaMarcadores.clearLayers();
        if(typeof capaZonasEstacionamiento!=='undefined'&&capaZonasEstacionamiento)capaZonasEstacionamiento.clearLayers();
        if(typeof capaCordonesRojos!=='undefined'&&capaCordonesRojos)capaCordonesRojos.clearLayers();
        dibujar();
        actualizarContador();
        return;
      }

      renderOriginal.apply(this,arguments);
      if(!filtro)dibujar();
    };
  }
}

function actualizarContador(){
  const c=document.getElementById('contadorResultados');
  if(!c)return;

  const filtro=(document.getElementById('filtroTipo')||{}).value||'';
  if(norm(filtro)!==norm(TIPO))return;

  let n=0;
  espacios.forEach(function(e){
    if(!activo(e.activo))return;
    const ps=leerPuntos(e.coordenadas);
    if(ps.length!==2)return;
    n++;
  });
  c.textContent=n+' espacios reservados';
}

function envolverEliminar(){
  if(typeof window.eliminarElemento!=='function')return;

  eliminarOriginal=window.eliminarElemento;

  window.eliminarElemento=function(id){
    if(String(id||'').toUpperCase().indexOf('ER-')===0||String(id||'').toUpperCase().indexOf('ER')===0){
      return eliminar(id);
    }
    return eliminarOriginal.apply(this,arguments);
  };
}

function instalar(){
  if(instalado)return;
  if(!disponible()){
    setTimeout(instalar,200);
    return;
  }

  instalado=true;

  asegurarCategoria();
  envolverRender();
  envolverEliminar();

  const tipo=document.getElementById('tipo');
  if(tipo){
    tipo.addEventListener('change',function(){
      if(norm(tipo.value)===norm(TIPO))iniciar();
    });
  }

  const form=document.getElementById('formElemento');
  if(form){
    form.addEventListener('submit',function(e){
      if(norm((document.getElementById('tipo')||{}).value)===norm(TIPO)){
        guardar(e);
      }
    },true);
  }

  ['filtroTipo','filtroLocalidad'].forEach(function(id){
    const el=document.getElementById(id);
    if(el)el.addEventListener('change',function(){
      setTimeout(function(){
        if(norm((document.getElementById('filtroTipo')||{}).value)===norm(TIPO)){
          if(typeof capaMarcadores!=='undefined'&&capaMarcadores)capaMarcadores.clearLayers();
          if(typeof capaZonasEstacionamiento!=='undefined'&&capaZonasEstacionamiento)capaZonasEstacionamiento.clearLayers();
          if(typeof capaCordonesRojos!=='undefined'&&capaCordonesRojos)capaCordonesRojos.clearLayers();
        }
        dibujar();
        actualizarContador();
      },0);
    });
  });

  const buscar=document.getElementById('buscar');
  if(buscar)buscar.addEventListener('input',function(){
    setTimeout(function(){dibujar();actualizarContador();},0);
  });

  const act=document.getElementById('btnActualizar');
  if(act)act.addEventListener('click',function(){
    setTimeout(function(){cargar();},500);
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&dibujando)cancelar();
  });

  cargar();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar);
else instalar();

window.sgtEspaciosReservados={
  cargar:cargar,
  dibujar:dibujar,
  iniciarDibujo:iniciar,
  cancelar:cancelar,
  eliminar:eliminar
};

})();
