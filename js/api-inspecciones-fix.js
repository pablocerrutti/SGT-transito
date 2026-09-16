// SGT - FIX API DE INSPECCIONES
// Debe cargarse después de api.js y antes de informes-inspecciones.js.
(function(){
  if(typeof API_URL!=='string'||!API_URL)return;
  window.apiObtenerInspecciones=async function(idElemento){
    try{
      const params=new URLSearchParams({accion:'obtenerInspecciones'});
      if(idElemento!==undefined&&idElemento!==null&&String(idElemento)!=='')params.set('id',String(idElemento));
      const respuesta=await fetch(API_URL+'?'+params.toString(),{method:'GET',cache:'no-store',redirect:'follow'});
      if(!respuesta.ok)return{ok:false,mensaje:'La API respondió con error '+respuesta.status+'.'};
      const texto=await respuesta.text();
      try{return JSON.parse(texto);}catch(_){return{ok:false,mensaje:'La API devolvió una respuesta no válida.'};}
    }catch(error){
      return{ok:false,mensaje:'No se pudo obtener las inspecciones: '+error.message};
    }
  };
})();
