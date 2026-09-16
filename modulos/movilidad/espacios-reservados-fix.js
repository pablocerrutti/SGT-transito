//==================================================
// SGT - ESPACIO RESERVADO
// Dibujo exactamente mediante 2 puntos, equivalente
// al cordón rojo, representado en amarillo.
//==================================================
(function(){
  'use strict';
  const TIPO='ESPACIO RESERVADO';
  let capa=null,espacios=[],dibujando=false,puntos=[],lineaTemporal=null,instalado=false;
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function usuario(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};}catch(_){return {};}}
  function soloConsulta(){const r=norm(usuario().rol);return r==='supervisor movilidad'||r==='consulta movilidad';}
  function coords(v){if(Array.isArray(v))return v;try{return JSON.parse(String(v||'[]'));}catch(_){return [];}}
  function activo(v){return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].includes(String(v||'').trim().toUpperCase());}
  function filtroActual(id){const e=document.getElementById(id);return e?String(e.value||''):'';}
  function mapaDisponible(){return typeof mapa!=='undefined'&&mapa&&typeof L!=='undefined';}

  function crearUI(){
    if(document.getElementById('barraEspacioReservado'))return;
    const barra=document.createElement('div');
    barra.className='zonaEstacionamientoBarra';barra.id='barraEspacioReservado';barra.style.display='block';
    barra.innerHTML='<button type="button" id="btnNuevoEspacioReservado"><i class="fa-solid fa-road"></i> Dibujar espacio reservado</button><button type="button" id="btnCancelarEspacioReservado" style="display:none;"><i class="fa-solid fa-xmark"></i> Cancelar espacio</button><span id="estadoEspacioReservado"></span>';
    const barras=document.querySelectorAll('.zonaEstacionamientoBarra');
    if(barras.length)barras[barras.length-1].after(barra);else{const mensaje=document.getElementById('mensajeMapa');if(mensaje)mensaje.before(barra);}
    const boton=document.getElementById('btnNuevoEspacioReservado'),cancelar=document.getElementById('btnCancelarEspacioReservado');
    if(boton)boton.addEventListener('click',iniciarDibujo);if(cancelar)cancelar.addEventListener('click',cancelarDibujo);
    if(soloConsulta&&boton){boton.disabled=true;boton.title='Este rol solo puede consultar el mapa y generar informes.';}
  }

  async function cargar(){try{const r=await api('obtenerEspaciosReservados');espacios=Array.isArray(r&&r.datos)?r.datos:[];dibujar();}catch(error){console.error('SGT: espacios reservados',error);}}
  function asegurarCapa(){if(!mapaDisponible())return null;if(!capa)capa=L.layerGroup().addTo(mapa);return capa;}

  function dibujar(){
    const grupo=asegurarCapa();if(!grupo)return;grupo.clearLayers();
    const tipo=filtroActual('filtroTipo'),localidad=filtroActual('filtroLocalidad'),texto=norm(filtroActual('buscar'));
    if(tipo&&norm(tipo)!==norm(TIPO))return;
    espacios.filter(e=>activo(e.activo)).forEach(function(e){
      if(localidad&&norm(e.localidad||e.localidadNombre)!==norm(localidad))return;
      const cadena=norm([e.id,e.codigo,e.tipo,e.nombre,e.descripcion,e.direccion,e.localidad,e.estado,e.caracteristicas].join(' '));if(texto&&!cadena.includes(texto))return;
      const p=coords(e.coordenadas);if(p.length<2)return;
      const linea=L.polyline(p,{color:'#FFD400',weight:6,opacity:0.98,lineCap:'round',lineJoin:'round'});
      if(typeof crearPopup==='function')linea.bindPopup(crearPopup({id:e.id,codigo:e.codigo||TIPO,tipo:TIPO,nombre:e.nombre||'',localidadNombre:e.localidad||e.localidadNombre||'',estado:e.estado||'Activo',direccion:e.direccion||'',descripcion:e.descripcion||'',caracteristicas:e.caracteristicas||''}));
      else linea.bindPopup('<strong>'+TIPO+'</strong><br>'+String(e.nombre||e.codigo||''));
      linea.addTo(grupo);
    });
  }

  function iniciarDibujo(){
    if(soloConsulta){mostrar('Este rol solo puede consultar el mapa y generar informes.','error');return;}
    if(!mapaDisponible())return;cancelarDibujo();dibujando=true;puntos=[];
    const boton=document.getElementById('btnNuevoEspacioReservado'),cancelar=document.getElementById('btnCancelarEspacioReservado');
    if(boton)boton.style.display='none';if(cancelar)cancelar.style.display='inline-block';estado('Seleccione el primer punto del espacio reservado.');mapa.on('click',capturarPunto);
  }

  function capturarPunto(e){
    if(!dibujando||puntos.length>=2)return;
    puntos.push([Number(e.latlng.lat.toFixed(7)),Number(e.latlng.lng.toFixed(7))]);
    if(lineaTemporal)lineaTemporal.remove();
    lineaTemporal=L.polyline(puntos,{color:'#FFD400',weight:6,dashArray:puntos.length>=2?'10,8':null,opacity:0.9}).addTo(mapa);
    if(puntos.length===1)estado('Punto 1 registrado. Seleccione el segundo punto.');
    else{estado('Dos puntos definidos. Haga clic en "Guardar espacio reservado".');confirmarGuardar();}
  }

  function confirmarGuardar(){
    if(document.getElementById('btnGuardarEspacioReservado'))return;const estadoEl=document.getElementById('estadoEspacioReservado');if(!estadoEl)return;
    const btn=document.createElement('button');btn.type='button';btn.id='btnGuardarEspacioReservado';btn.className='btn-guardar-geometria';btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Guardar espacio reservado';btn.addEventListener('click',guardar);estadoEl.appendChild(document.createTextNode(' '));estadoEl.appendChild(btn);
  }

  async function guardar(){
    if(puntos.length!==2){mostrar('El espacio reservado debe definirse con exactamente dos puntos.','error');return;}
    const btn=document.getElementById('btnGuardarEspacioReservado');if(btn){btn.disabled=true;btn.textContent='Guardando…';}
    try{
      const u=usuario();const r=await api('guardarEspacioReservado',{coordenadas:JSON.stringify(puntos),nombre:'ESPACIO RESERVADO',descripcion:'Espacio reservado definido mediante dos puntos en el mapa.',estado:'Activo',usuario:u.usuario||u.nombre||'admin',rol:u.rol||''});
      if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible guardar el espacio reservado.');
      try{await apiRegistrarAuditoria({usuario:u.usuario||'',nombre:u.nombre||'',rol:u.rol||'',accionRealizada:'Creación de espacio reservado',modulo:'Movilidad',detalle:'Creación de ESPACIO RESERVADO mediante dos puntos.',referencia:r.codigo||''});}catch(_){ }
      mostrar('Espacio reservado '+(r.codigo||'')+' guardado correctamente.','exito');cancelarDibujo();await cargar();
    }catch(error){mostrar(error.message||'No fue posible guardar el espacio reservado.','error');if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Guardar espacio reservado';}}
  }

  function cancelarDibujo(){if(mapaDisponible())mapa.off('click',capturarPunto);dibujando=false;puntos=[];if(lineaTemporal){lineaTemporal.remove();lineaTemporal=null;}const boton=document.getElementById('btnNuevoEspacioReservado'),cancelar=document.getElementById('btnCancelarEspacioReservado');if(boton)boton.style.display='inline-block';if(cancelar)cancelar.style.display='none';const guardarBtn=document.getElementById('btnGuardarEspacioReservado');if(guardarBtn)guardarBtn.remove();estado('');}
  function estado(t){const e=document.getElementById('estadoEspacioReservado');if(e)e.textContent=t;}
  function mostrar(t,c){if(typeof mostrarMensaje==='function')mostrarMensaje(t,c);else{const e=document.getElementById('mensajeMapa');if(e){e.textContent=t;e.className='mensaje '+(c||'');}}}

  function instalar(){
    if(instalado)return;if(!mapaDisponible()){setTimeout(instalar,200);return;}instalado=true;crearUI();
    ['filtroTipo','tipo'].forEach(function(id){const select=document.getElementById(id);if(!select)return;if(!Array.from(select.options).some(o=>norm(o.value||o.text)===norm(TIPO)))select.add(new Option(TIPO,TIPO));});
    if(typeof seleccionarUbicacion==='function'){mapa.off('click',seleccionarUbicacion);mapa.on('click',function(e){if(dibujando)return;seleccionarUbicacion(e);});}
    ['filtroTipo','filtroLocalidad','buscar'].forEach(function(id){const e=document.getElementById(id);if(!e)return;e.addEventListener('change',function(){setTimeout(dibujar,0);});e.addEventListener('input',function(){setTimeout(dibujar,0);});});
    const actualizar=document.getElementById('btnActualizar');if(actualizar)actualizar.addEventListener('click',function(){setTimeout(cargar,500);});cargar();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar);else instalar();
  window.sgtEspaciosReservados={cargar:cargar,dibujar:dibujar,iniciarDibujo:iniciarDibujo};
})();
