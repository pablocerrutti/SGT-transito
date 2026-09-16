//==================================================
// SGT - PDF DE INCIDENCIAS
// Intercepta la función API usada por el botón original.
// Genera PDF, descarga y abre el documento.
// Registra la acción en Auditoría.
//==================================================
(function(){
  'use strict';
  const API=(typeof API_URL==='string'&&API_URL)?API_URL:'';

  function registrarAuditoriaPdf(id,r){
    if(!API)return;
    try{
      const sesion=typeof sesionApi_==='function'?sesionApi_():{};
      const rol=typeof rolCanonicoApi_==='function'?rolCanonicoApi_(sesion.rol||''):String(sesion.rol||'');
      const detalle=JSON.stringify({id:String(id||''),pdf:String((r&&r.pdfNombre)||''),accion:'Generación e impresión de PDF de incidencia'}).slice(0,1500);
      const p=new URLSearchParams({accion:'registrarAuditoria',usuario:String(sesion.usuario||''),nombre:String(sesion.nombre||''),rol:rol,accionRealizada:'Generación e impresión de PDF de incidencia',modulo:'Fiscalización / Informes',detalle:detalle,referencia:String(id||'')});
      fetch(API+'?'+p.toString(),{method:'GET',cache:'no-store',redirect:'follow'}).catch(function(){});
    }catch(_){ }
  }

  function forzarDescarga(url,nombre){
    if(!url)return;
    const a=document.createElement('a');
    a.href=url;
    a.download=nombre||'actuacion.pdf';
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){a.remove();},1000);
  }

  function instalar(){
    if(typeof window.apiGenerarPdfActuacionExistente!=='function')return;
    if(window.apiGenerarPdfActuacionExistente.__sgtPdfFix)return;

    const original=window.apiGenerarPdfActuacionExistente;

    async function versionCorregida(id){
      const r=await original(id);
      if(!r||!r.ok)return r;

      const descarga=r.pdfDownloadUrl||r.pdfUrl||'';
      const vista=r.pdfUrl||descarga;

      forzarDescarga(descarga,r.pdfNombre||('actuacion-'+id+'.pdf'));

      if(vista){
        setTimeout(function(){
          try{window.open(vista,'_blank','noopener,noreferrer');}catch(_){ }
        },350);
      }

      registrarAuditoriaPdf(id,r);
      return r;
    }

    versionCorregida.__sgtPdfFix=true;
    window.apiGenerarPdfActuacionExistente=versionCorregida;
  }

  function esperar(){
    instalar();
    if(typeof window.apiGenerarPdfActuacionExistente==='function')return;
    setTimeout(esperar,150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',esperar);else esperar();
})();
