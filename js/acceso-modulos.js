/* SGT - Protección de acceso directo por permisos */
(function(){
  function normalizar(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function esSuperAdmin(rol){const r=normalizar(rol);return r==='super admin'||r==='super administrador'||r==='superadministrador';}
  function usuario(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||null;}catch(_){return null;}}
  function permisos(u){
    const base={usuarios:false,movilidad:false,fiscalizacion:false,auditoria:false};
    const r=normalizar(u&&u.rol);
    const defaults={
      'super admin':{usuarios:true,movilidad:true,fiscalizacion:true,auditoria:true},
      'super administrador':{usuarios:true,movilidad:true,fiscalizacion:true,auditoria:true},
      'superadministrador':{usuarios:true,movilidad:true,fiscalizacion:true,auditoria:true},
      'supervisor':{movilidad:true,fiscalizacion:true,auditoria:true},
      'supervisor movilidad':{movilidad:true},
      'movilidad':{movilidad:true,fiscalizacion:true},
      'consulta movilidad':{movilidad:true,fiscalizacion:true},
      'fiscalizacion':{fiscalizacion:true}
    };
    Object.assign(base,defaults[r]||{});
    let p=u&&u.permisos;if(typeof p==='string'){try{p=JSON.parse(p);}catch(_){p=null;}}
    if(p&&!esSuperAdmin(r))Object.keys(base).forEach(k=>{if(typeof p[k]==='boolean')base[k]=p[k];});
    if(esSuperAdmin(r))Object.assign(base,{usuarios:true,movilidad:true,fiscalizacion:true,auditoria:true});
    return base;
  }
  const u=usuario();
  if(!u){location.href=(location.pathname.includes('/modulos/')?'../../':'../')+'index.html';return;}
  const path=location.pathname.toLowerCase();
  let modulo='';
  if(path.includes('/modulos/movilidad/'))modulo='movilidad';
  else if(path.includes('/modulos/fiscalizacion/'))modulo='fiscalizacion';
  else if(path.endsWith('/pages/auditoria.html')||path.includes('/pages/auditoria'))modulo='auditoria';
  else if(path.endsWith('/pages/usuarios.html')||path.includes('/pages/usuarios'))modulo='usuarios';
  if(modulo&&!permisos(u)[modulo]){
    const root=path.includes('/modulos/')?'../../':'../';
    location.replace(root+'pages/dashboard.html');
  }
})();
