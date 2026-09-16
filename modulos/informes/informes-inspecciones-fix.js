//==================================================
// SGT - FIX FOTOGRAFÍAS DE INCIDENCIAS
// Carga fotografías privadas de Google Drive mediante
// el endpoint seguro de Apps Script y las convierte en
// data URI para que <img> pueda mostrarlas sin publicar
// los archivos.
//==================================================
(function(){
  const API=(typeof API_URL==='string'&&API_URL)?API_URL:'';
  if(!API)return;

  function extraerId(url){
    const s=String(url||'').trim();
    if(!s)return '';
    let m=s.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if(m)return m[1];
    m=s.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if(m&&/drive\.google\.com/i.test(s))return m[1];
    m=s.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    return m?m[1]:'';
  }

  async function cargarImagen(img){
    if(!img||img.dataset.sgtFotoCargada==='1'||img.dataset.sgtFotoCargando==='1')return;
    const a=img.closest('a');
    const original=(a&&a.getAttribute('href'))||'';
    const id=extraerId(original);
    if(!id)return;

    img.dataset.sgtFotoCargando='1';
    try{
      const url=API+'?accion=obtenerFotoInspeccion&id='+encodeURIComponent(id);
      const respuesta=await fetch(url,{method:'GET',cache:'no-store',redirect:'follow'});
      if(!respuesta.ok)throw new Error('HTTP '+respuesta.status);
      const resultado=await respuesta.json();
      if(!resultado||!resultado.ok||!resultado.imagen){
        throw new Error((resultado&&resultado.mensaje)||'No se recibió la imagen.');
      }
      img.src=resultado.imagen;
      img.dataset.sgtFotoCargada='1';
      img.removeAttribute('onerror');
    }catch(error){
      console.error('SGT: no se pudo cargar fotografía',error);
    }finally{
      delete img.dataset.sgtFotoCargando;
    }
  }

  function procesar(){
    document.querySelectorAll('#fichaInspeccion .foto-evidencia img').forEach(cargarImagen);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',procesar);
  }else{
    procesar();
  }

  const observador=new MutationObserver(function(){procesar();});
  observador.observe(document.body,{childList:true,subtree:true});
})();
