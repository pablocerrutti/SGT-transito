//==================================================
// SGT - ROL CONSULTA MOVILIDAD
// Mapa y Fiscalización exclusivamente en consulta.
// No crea, modifica, elimina ni inspecciona.
//==================================================
(function(){
 function normalizarRol(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
 function usuario(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null');}catch(_){return null;}}
 function esConsulta(){const u=usuario();return !!u&&normalizarRol(u.rol)==='consulta movilidad';}
 function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
 function aviso(){const m=document.getElementById('mensajeMapa');if(!m)return;m.textContent='Consulta Movilidad: este usuario solo puede consultar información y generar informes.';m.className='mensaje error';setTimeout(()=>{m.textContent='';},2800);}
 function bloquearEdicion(){
  if(!esConsulta())return;
  ['.panel','#btnNuevaZona','#btnCancelarZona','#btnNuevoCordon','#btnCancelarCordon'].forEach(s=>document.querySelectorAll(s).forEach(e=>e.style.display='none'));
  document.querySelectorAll('.zonaEstacionamientoBarra').forEach(e=>e.style.display='none');
  const c=document.querySelector('.contenedorPrincipal');if(c)c.style.gridTemplateColumns='1fr';
  const p=document.querySelector('header p');if(p)p.textContent='Consulta de elementos existentes. Seleccione un elemento para ver descripción y características.';
  const form=document.getElementById('formElemento');if(form)form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();aviso();},true);
  if(typeof mapa!=='undefined'&&mapa){try{if(typeof seleccionarUbicacion==='function')mapa.off('click',seleccionarUbicacion);if(typeof finalizarDibujoGeometrico==='function')mapa.off('contextmenu',finalizarDibujoGeometrico);}catch(_){}try{if(typeof iniciarSeleccionUbicacion==='function')mapa.off('click',iniciarSeleccionUbicacion);}catch(_){} }
  document.addEventListener('click',function(e){const t=e.target&&e.target.closest?e.target.closest('#btnNuevaZona,#btnNuevoCordon,#btnCancelarZona,#btnCancelarCordon,#btnGuardarElemento,#formElemento button[type="submit"],.btn-inspeccionar,.btn-eliminar,.btn-editar,.btnEliminar,.btnEditar'):null;if(!t)return;e.preventDefault();e.stopImmediatePropagation();aviso();},true);
 }
 function popupConsulta(elemento){
  const e=elemento||{};
  return '<div class="popup-card consulta-movilidad-popup">'+
   '<h2>'+esc(e.nombre||e.tipo||'Elemento')+'</h2>'+
   (e.descripcion?'<div class="popup-linea"><strong>Descripción</strong><br>'+esc(e.descripcion)+'</div>':'')+
   '<div class="popup-linea"><strong>Características</strong><br>'+esc(e.caracteristicas||'-')+'</div>'+ 
   '</div>';
 }
 function instalarPopup(){
  if(!esConsulta())return;
  if(typeof window.crearPopup==='function')window.crearPopup=popupConsulta;
  // Algunos popups pueden ser creados por otros módulos; eliminamos botones
  // de inspección/edición/eliminación después de cada inserción.
  const limpiar=()=>document.querySelectorAll('.leaflet-popup-content button,.leaflet-popup-content .btn-inspeccionar,.leaflet-popup-content .btn-eliminar,.leaflet-popup-content .btn-editar').forEach(e=>e.remove());
  limpiar();
  if(document.body)new MutationObserver(limpiar).observe(document.body,{childList:true,subtree:true});
 }
 function iniciar(){if(!esConsulta())return;bloquearEdicion();instalarPopup();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
