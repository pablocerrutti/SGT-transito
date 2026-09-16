//==================================================
// SGT - ESPACIO RESERVADO
// Integrado como categoría del listado de elementos.
// Dibujo exactamente mediante 2 puntos y una línea amarilla.
//==================================================
(function(){
  'use strict';
  const TIPO='ESPACIO RESERVADO';
  let capa=null,espacios=[],dibujando=false,puntos=[],lineaTemporal=null,instalado=false;
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function usuario(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};}catch(_){return {};}}
  function soloConsulta(){const r=norm(usuario().rol);return r==='supervisor movilidad'||r==='consulta movilidad'||r==='supervisor';}
  function coords(v){if(Array.isArray(v))return v;try{return JSON.parse(String(v||'[]'));}catch(_){return [];}}
  function activo(v){const s=String(v==null?'':v).trim().toUpperCase();return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].includes(s);}
  function disponible(){return typeof mapa!=='undefined'&&mapa&&typeof L!=='undefined';}
  function mensaje(t,c){if(typeof mostrarMensaje==='function')mostrarMensaje(t,c);}
  function asegurarCapa(){if(!disponible())return null;if(!capa)capa=L.layerGroup().addTo(mapa);return capa;}
  function asegurarCategoria(){
    const tipo=document.getElementById('tipo'),filtro=document.getElementById('filtroTipo');
    [tipo,filtro].forEach(function(sel){
      if(!sel)return;
      if(!Array.from(sel.options).some(function(o){return norm(o.value||o.text)===norm(TIPO);}))sel.add(new Option(TIPO,TIPO));
    });
  }
  function instalarObservadorSelectores(){
    const tipo=document.getElementById('tipo'),filtro=document.getElementById('filtroTipo');
    [tipo,filtro].forEach(function(sel){
      if(!sel||sel.dataset.espacioReservadoObserver==='1')return;
      const obs=new MutationObserver(function(){asegurarCategoria();});
      obs.observe(sel,{childList:true});
      sel.dataset.espacioReservadoObserver='1';
    });
  }
  async function cargar(){try{const r=await api('obtenerEspaciosReservados');if(!r||r.ok===false){console.warn('SGT: no se pudieron cargar espacios reservados',r);return;}espacios=Array.isArray(r.datos)?r.datos:[];dibujar();}catch(error){console.error('SGT: espacios reservados',error);}}
  function dibujar(){
    const grupo=asegurarCapa();if(!grupo)return;grupo.clearLayers();
    const tipo=(document.getElementById('filtroTipo')||{}).value||'',localidad=norm((document.getElementById('filtroLocalidad')||{}).value||''),texto=norm((document.getElementById('buscar')||{}).value||'');
    if(tipo&&norm(tipo)!==norm(TIPO))return;
    espacios.filter(function(e){return activo(e.activo);}).forEach(function(e){
      if(localidad&&norm(e.localidad||e.localidadNombre)!==localidad)return;
      const cadena=norm([e.id,e.codigo,e.tipo,e.nombre,e.descripcion,e.direccion,e.localidad,e.estado,e.caracteristicas].join(' '));
      if(texto&&!cadena.includes(texto))return;
      const p=coords(e.coordenadas);if(p.length!==2)return;
      const linea=L.polyline(p,{color:'#FFD400',weight:6,opacity:.98,lineCap:'round',lineJoin:'round'});
      if(typeof crearPopup==='function')linea.bindPopup(crearPopup({id:e.id,codigo:e.codigo||TIPO,tipo:TIPO,nombre:e.nombre||TIPO,localidadNombre:e.localidad||e.localidadNombre||'',estado:e.estado||'Activo',direccion:e.direccion||'',descripcion:e.descripcion||'',caracteristicas:e.caracteristicas||''}));
      linea.addTo(grupo);
    });
  }
  function cancelar(){if(disponible())mapa.off('click',capturar);dibujando=false;puntos=[];if(lineaTemporal){lineaTemporal.remove();lineaTemporal=null;}}
  function iniciar(){
    if(soloConsulta()){mensaje('Este rol solo puede consultar el mapa y generar informes.','error');return;}
    if(!disponible())return;
    asegurarCategoria();cancelar();dibujando=true;puntos=[];mensaje('ESPACIO RESERVADO: seleccione exactamente 2 puntos.','');mapa.on('click',capturar);
  }
  function capturar(e){
    if(!dibujando||puntos.length>=2)return;
    puntos.push([Number(e.latlng.lat.toFixed(7)),Number(e.latlng.lng.toFixed(7))]);
    if(lineaTemporal)lineaTemporal.remove();
    lineaTemporal=L.polyline(puntos,{color:'#FFD400',weight:6,dashArray:puntos.length===1?'8,8':null,opacity:.95}).addTo(mapa);
    if(puntos.length===1){mensaje('Punto 1 registrado. Seleccione el segundo punto.','');return;}
    mensaje('Dos puntos definidos. Guardando espacio reservado...','');guardar();
  }
  async function guardar(){
    if(puntos.length!==2){mensaje('El espacio reservado debe definirse con exactamente 2 puntos.','error');return;}
    try{
      const u=usuario();
      const r=await api('guardarEspacioReservado',{coordenadas:JSON.stringify(puntos),nombre:TIPO,descripcion:'Espacio reservado definido mediante dos puntos en el mapa.',estado:'Activo',usuario:u.usuario||u.nombre||'admin',rol:u.rol||''});
      if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible guardar el espacio reservado.');
      try{await apiRegistrarAuditoria({usuario:u.usuario||'',nombre:u.nombre||'',rol:u.rol||'',accionRealizada:'Creación de espacio reservado',modulo:'Movilidad',detalle:'Creación de ESPACIO RESERVADO mediante exactamente dos puntos.',referencia:r.codigo||''});}catch(_){ }
      mensaje('Espacio reservado '+(r.codigo||'')+' guardado correctamente.','exito');cancelar();await cargar();
    }catch(error){mensaje(error.message||'No fue posible guardar el espacio reservado.','error');cancelar();}
  }
  function instalar(){
    if(instalado)return;if(!disponible()){setTimeout(instalar,200);return;}instalado=true;
    asegurarCategoria();instalarObservadorSelectores();
    const tipo=document.getElementById('tipo'),filtro=document.getElementById('filtroTipo');
    // IMPORTANTE: seleccionar ESPACIO RESERVADO en el formulario NO debe cambiar
    // el filtro del mapa. El usuario debe poder seguir viendo todos los elementos.
    if(tipo)tipo.addEventListener('change',function(){if(norm(tipo.value)===norm(TIPO))iniciar();});
    if(filtro)filtro.addEventListener('change',function(){setTimeout(dibujar,0);if(norm(filtro.value)===norm(TIPO))asegurarCapa();});
    const buscar=document.getElementById('buscar');if(buscar)buscar.addEventListener('input',function(){setTimeout(dibujar,0);});
    const loc=document.getElementById('filtroLocalidad');if(loc)loc.addEventListener('change',function(){setTimeout(dibujar,0);});
    const actualizar=document.getElementById('btnActualizar');if(actualizar)actualizar.addEventListener('click',function(){setTimeout(cargar,500);});
    cargar();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar);else instalar();
  window.sgtEspaciosReservados={cargar:cargar,dibujar:dibujar,iniciarDibujo:iniciar};
})();
