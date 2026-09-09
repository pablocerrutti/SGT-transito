/* SGT - Permisos por módulo */
(function(){
  const N={usuarios:'usuarios',movilidad:'movilidad',fiscalizacion:'fiscalizacion',auditoria:'auditoria'};
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function defaults(rol){
    const r=norm(rol);
    if(r==='super admin'||r==='super administrador'||r==='superadministrador') return {usuarios:true,movilidad:true,fiscalizacion:true,auditoria:true};
    if(r==='supervisor') return {usuarios:false,movilidad:true,fiscalizacion:true,auditoria:true};
    if(r==='supervisor movilidad') return {usuarios:false,movilidad:true,fiscalizacion:false,auditoria:false};
    if(r==='movilidad') return {usuarios:false,movilidad:true,fiscalizacion:true,auditoria:false};
    if(r==='consulta movilidad') return {usuarios:false,movilidad:true,fiscalizacion:true,auditoria:false};
    if(r==='fiscalizacion') return {usuarios:false,movilidad:false,fiscalizacion:true,auditoria:false};
    return {usuarios:false,movilidad:false,fiscalizacion:false,auditoria:false};
  }
  function session(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||null;}catch(_){return null;}}
  function get(u){
    const base=defaults(u&&u.rol);
    let p=u&&u.permisos;
    if(typeof p==='string'){try{p=JSON.parse(p);}catch(_){p=null;}}
    p=p||{};
    Object.keys(base).forEach(k=>{if(typeof p[k]!=='boolean')p[k]=base[k];});
    if(norm(u&&u.rol).startsWith('super admin')) p.usuarios=true;
    return p;
  }
  function has(mod,u){return !!get(u||session())[N[mod]||mod];}
  function can(mod){const u=session();if(!u)return false;return has(mod,u);}
  function canManageUsers(){const u=session();return !!u && (norm(u.rol)==='super admin'||norm(u.rol)==='super administrador'||norm(u.rol)==='superadministrador') && has('usuarios',u);}
  window.SGTPermisos={normalizarRol:norm,defaults,get,has,can,canManageUsers,session};
})();
