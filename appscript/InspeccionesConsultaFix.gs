function obtenerInspeccionesSeguro_(e){
  try{
    const p=(e&&e.parameter)||{};
    const id=String(p.id||'').trim();
    const sh=hojaInspecciones_();
    asegurarColumnasInspeccionesSeguro_(sh);
    if(sh.getLastRow()<2)return {ok:true,datos:[]};

    const valores=sh.getDataRange().getDisplayValues();
    const mapa=mapaInspeccionesSeguro_(sh);
    const datos=[];

    for(let i=1;i<valores.length;i++){
      const f=valores[i];
      const rid=valorInspeccionSeguro_(f,mapa,['ID','Id','id']);
      if(!rid)continue;
      const eid=valorInspeccionSeguro_(f,mapa,['Elemento ID']);
      if(id&&eid!==id)continue;
      const activo=valorInspeccionSeguro_(f,mapa,['Activo']);
      if(['NO','N','FALSE','FALSO','0','INACTIVO'].indexOf(activo.toUpperCase())!==-1)continue;

      const incidencia=valorInspeccionSeguro_(f,mapa,['Incidencia','Detalle','Descripción','Descripcion']);
      const documentoUrl=valorInspeccionSeguro_(f,mapa,['Foto/boleta URL','Documento URL']);
      const fotoResolucionUrl=valorInspeccionSeguro_(f,mapa,['Foto Resolución URL']);

      datos.push({
        id:rid, elementoId:eid,
        codigoElemento:valorInspeccionSeguro_(f,mapa,['Código elemento','Codigo elemento']),
        inspector:valorInspeccionSeguro_(f,mapa,['Inspector']),
        beta:valorInspeccionSeguro_(f,mapa,['Beta']),
        fecha:valorInspeccionSeguro_(f,mapa,['Fecha']),
        matricula:valorInspeccionSeguro_(f,mapa,['Matrícula','Matricula']),
        tipoActuacion:valorInspeccionSeguro_(f,mapa,['Tipo actuación','Tipo de actuación']),
        numeroBoleta:valorInspeccionSeguro_(f,mapa,['Número boleta','Numero boleta']),
        nombreInfractor:valorInspeccionSeguro_(f,mapa,['Nombre infractor']),
        cedula:valorInspeccionSeguro_(f,mapa,['Cédula','Cedula']),
        incidencia:incidencia, detalle:incidencia,
        videoUrl:valorInspeccionSeguro_(f,mapa,['Video URL']),
        documentoUrl:documentoUrl,
        documentoId:idDriveSeguro_(documentoUrl),
        estado:valorInspeccionSeguro_(f,mapa,['Estado']),
        activo:activo||'SI',
        rol:valorInspeccionSeguro_(f,mapa,['Rol']),
        usuario:valorInspeccionSeguro_(f,mapa,['Usuario']),
        numeroSerie:valorInspeccionSeguro_(f,mapa,['Número serie','Numero serie','Serie']),
        pdfUrl:valorInspeccionSeguro_(f,mapa,['PDF URL']),
        incidenciaEstado:valorInspeccionSeguro_(f,mapa,['Incidencia Estado']),
        fotoResolucionUrl:fotoResolucionUrl,
        fotoResolucionId:idDriveSeguro_(fotoResolucionUrl),
        fechaResolucion:valorInspeccionSeguro_(f,mapa,['Fecha Resolución']),
        usuarioResolucion:valorInspeccionSeguro_(f,mapa,['Usuario Resolución']),
        pdfResolucionUrl:valorInspeccionSeguro_(f,mapa,['PDF Resolución URL'])
      });
    }
    return {ok:true,datos:datos};
  }catch(error){
    console.error('ERROR obtenerInspeccionesSeguro_:',error);
    return {ok:false,datos:[],mensaje:'No fue posible obtener inspecciones: '+(error.message||error)};
  }
}
