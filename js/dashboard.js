let usuario=null;try{usuario=JSON.parse(localStorage.getItem('usuarioActual'));}catch(e){usuario=null;}
if(!usuario){window.location.href='../index.html';}else{iniciarDashboard();}
function iniciarDashboard(){
 const usuarioNombre=document.getElementById('usuarioNombre'),bienvenida=document.getElementById('bienvenida');
 if(usuarioNombre)usuarioNombre.innerHTML='<strong>'+esc(usuario.nombre||usuario.usuario||'')+'</strong>';
 if(bienvenida)bienvenida.textContent='Rol: '+(usuario.rol||'');
 const items={usuarios:document.getElementById('cardUsuarios'),movilidad:document.getElementById('cardMovilidad'),fiscalizacion:document.getElementById('cardFiscalizacion'),auditoria:document.getElementById('cardAuditoria')};
 const menus={usuarios:document.getElementById('menuUsuarios'),movilidad:document.getElementById('menuMovilidad'),fiscalizacion:document.getElementById('menuFiscalizacion'),auditoria:document.getElementById('menuAuditoria')};
 Object.values(items).concat(Object.values(menus)).forEach(ocultar);
 const permisos=window.SGTPermisos?window.SGTPermisos.get(usuario):{};
 Object.keys(items).forEach(function(mod){if(permisos[mod]){mostrar(items[mod]);mostrar(menus[mod]);}});
 if(permisos.usuarios&&typeof window.SGTPermisos!=='undefined'&&!window.SGTPermisos.canManageUsers()) ocultar(items.usuarios),ocultar(menus.usuarios);
 if(permisos.usuarios){const abrir=()=>abrirConAuditoria('Usuarios','Apertura del módulo Usuarios',abrirUsuarios);if(items.usuarios)items.usuarios.onclick=abrir;if(menus.usuarios)menus.usuarios.onclick=abrir;}
 if(permisos.movilidad){const abrir=()=>abrirConAuditoria('Movilidad','Apertura del módulo Movilidad Urbana',abrirMovilidad);if(items.movilidad)items.movilidad.onclick=abrir;if(menus.movilidad)menus.movilidad.onclick=abrir;}
 if(permisos.fiscalizacion){const abrir=()=>abrirConAuditoria('Fiscalización','Apertura del módulo Fiscalización',abrirFiscalizacion);if(items.fiscalizacion)items.fiscalizacion.onclick=abrir;if(menus.fiscalizacion)menus.fiscalizacion.onclick=abrir;}
 if(permisos.auditoria){const abrir=()=>abrirConAuditoria('Auditoría','Apertura del módulo Auditoría',abrirAuditoria);if(items.auditoria)items.auditoria.onclick=abrir;if(menus.auditoria)menus.auditoria.onclick=abrir;}
}
function abrirConAuditoria(modulo,detalle,continuar){try{if(typeof apiRegistrarAuditoria==='function')apiRegistrarAuditoria({usuario:usuario.usuario||'',nombre:usuario.nombre||'',rol:usuario.rol||'',accionRealizada:'Acceso a módulo',modulo:modulo,detalle:detalle,referencia:''});}catch(e){}continuar();}
function abrirUsuarios(){location.href='usuarios.html';}function abrirMovilidad(){location.href='../modulos/movilidad/mapa.html';}function abrirFiscalizacion(){location.href='../modulos/fiscalizacion/inspecciones.html';}function abrirAuditoria(){location.href='auditoria.html';}
function mostrar(e){if(e)e.style.display='';}function ocultar(e){if(e)e.style.display='none';}function esc(v){return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');}
async function cerrarSesion(){try{if(typeof apiLogout==='function')await apiLogout();}catch(e){}localStorage.removeItem('usuarioActual');localStorage.removeItem('usuario');location.href='../index.html';}
