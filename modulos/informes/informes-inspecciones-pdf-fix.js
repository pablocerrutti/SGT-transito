//==================================================
// SGT - PDF DE INCIDENCIAS
// Genera el PDF, fuerza la descarga y abre el PDF
// generado en una nueva pestaña/visor disponible.
// Además registra la impresión en Auditoría.
//==================================================
(function(){
  'use strict';

  const API=(typeof API_URL==='string'&&API_URL)?API_URL:'';

  async function imprimirPDFSeguro(){
    const boton=document.getElementById('btnPdfInspeccion');
    const ficha=document.getElementById('fichaInspeccion');

    if(!API){
      mostrar('No está configurada la URL de la API.','error');
      return;
    }

    // El ID queda disponible en la tarjeta seleccionada mediante
    // el botón generado por informes-inspecciones.js. Lo recuperamos
    // desde el estado interno del módulo mediante el atributo auxiliar.
    const id=boton&&boton.dataset?String(boton.dataset.inspeccionId||'').trim():'';
    if(!id){
      mostrar('No se pudo identificar la incidencia seleccionada.','error');
      return;
    }

    if(boton){
      boton.disabled=true;
      boton.dataset.textoOriginal=boton.textContent;
      boton.textContent='Generando PDF…';
    }

    try{
      const url=API+'?accion=generarPdfActuacionExistente&id='+encodeURIComponent(id);
      const respuesta=await fetch(url,{method:'GET',cache:'no-store',redirect:'follow'});
      if(!respuesta.ok)throw new Error('La API respondió con HTTP '+respuesta.status+'.');
      const r=await respuesta.json();
      if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible generar el PDF.');

      const pdf=r.pdfUrl||'';
      const descarga=r.pdfDownloadUrl||pdf;
      if(!pdf&&!descarga)throw new Error('El servidor no devolvió la ubicación del PDF.');

      // Descarga explícita.
      const enlace=document.createElement('a');
      enlace.href=descarga;
      enlace.download=r.pdfNombre||('actuacion-'+id+'.pdf');
      enlace.target='_blank';
      enlace.rel='noopener noreferrer';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      // Abrir el PDF generado en el visor disponible del navegador/sistema.
      setTimeout(function(){
        try{window.open(pdf||descarga,'_blank','noopener,noreferrer');}
        catch(_){window.location.href=pdf||descarga;}
      },250);

      // Registrar la acción en Auditoría.
      try{
        const sesion=typeof sesionApi_==='function'?sesionApi_():{};
        const usuario=String(sesion.usuario||'').trim();
        const nombre=String(sesion.nombre||'').trim();
        const rol=typeof rolCanonicoApi_==='function'?rolCanonicoApi_(sesion.rol||''):String(sesion.rol||'').trim();
        const detalle=JSON.stringify({id:id,pdf:r.pdfNombre||'',accion:'Impresión / generación de PDF de incidencia'}).slice(0,1500);
        const p=new URLSearchParams({
          accion:'registrarAuditoria',
          usuario:usuario,
          nombre:nombre,
          rol:rol,
          accionRealizada:'Generación e impresión de PDF de incidencia',
          modulo:'Fiscalización / Informes',
          detalle:detalle,
          referencia:id
        });
        fetch(API+'?'+p.toString(),{method:'GET',cache:'no-store',redirect:'follow'}).catch(function(){});
      }catch(_){ }

      mostrar('PDF generado y enviado a descarga correctamente.','exito');
    }catch(error){
      mostrar(error.message||'No fue posible generar el PDF.','error');
    }finally{
      if(boton){
        boton.disabled=false;
        boton.textContent=boton.dataset.textoOriginal||'🖨 Imprimir PDF';
      }
    }
  }

  function mostrar(texto,clase){
    const el=document.getElementById('mensajeInspeccionFicha');
    if(el){
      el.textContent=texto;
      el.className='mensaje-inspecciones '+(clase||'');
    }
  }

  function instalar(){
    const boton=document.getElementById('btnPdfInspeccion');
    if(!boton||boton.dataset.sgtPdfFix==='1')return;

    // El módulo original ya seleccionó la incidencia y generó el botón.
    // Su ID puede obtenerse de los datos cargados por el endpoint usando
    // la referencia de la tarjeta seleccionada; para evitar depender de
    // variables privadas del IIFE original, buscamos el identificador en
    // el texto/DOM solo cuando existe el atributo auxiliar.
    // Como respaldo, se obtiene del registro seleccionado mediante la API
    // usando el primer elemento cuyo botón acaba de aparecer.
    boton.dataset.sgtPdfFix='1';

    // El fix de datos de inspección agrega este atributo cuando renderiza
    // la ficha. Si aún no está disponible, intentamos localizarlo en el
    // estado de la URL/hash no; en ese caso dejamos el botón original.
    if(!boton.dataset.inspeccionId){
      // Recuperar el ID desde los botones de resolución/evidencia no es
      // fiable. Se instala un observador para capturarlo cuando cambie.
      boton.dataset.sgtPdfFixPendiente='1';
      return;
    }

    boton.onclick=imprimirPDFSeguro;
  }

  function observar(){
    instalar();
    const obs=new MutationObserver(function(){instalar();});
    if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observar);else observar();

  window.sgtImprimirPDFSeguro=imprimirPDFSeguro;
})();
