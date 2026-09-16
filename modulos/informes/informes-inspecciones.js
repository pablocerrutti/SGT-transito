//==================================================
// SGT - INFORMES / ELEMENTOS INSPECCIONADOS
//==================================================
(function(){
    let catalogo=[];
    let inspecciones=[];
    let grupos=[];
    let seleccionado=null;

    function normalizar(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
    function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
    function fechaValor(v){
        const s=String(v||'').trim();
        if(!s)return 0;
        const m=s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
        if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
        const d=Date.parse(s);return Number.isFinite(d)?d:0;
    }
    function elementoDe(i){
        const id=String(i.elementoId||'').trim(),codigo=normalizar(i.codigoElemento);
        return catalogo.find(e=>String(e.id||'').trim()===id) || catalogo.find(e=>codigo&&normalizar(e.codigo)===codigo) || {id:id,codigo:i.codigoElemento||'',tipo:'Elemento',nombre:'Elemento inspeccionado',direccion:'',localidad:'',estado:'',caracteristicas:''};
    }
    function construirGrupos(){
        const mapa={};
        inspecciones.filter(i=>String(i.elementoId||'').trim()).forEach(i=>{
            const clave=String(i.elementoId||'').trim();
            if(!mapa[clave] || fechaValor(i.fecha)>=fechaValor(mapa[clave].inspeccion.fecha)) mapa[clave]={elemento:elementoDe(i),inspeccion:i};
        });
        grupos=Object.keys(mapa).map(k=>mapa[k]).sort((a,b)=>normalizar(a.elemento.nombre||a.elemento.codigo).localeCompare(normalizar(b.elemento.nombre||b.elemento.codigo),'es'));
    }
    async function iniciar(){
        const seccion=document.getElementById('seccionInspecciones');
        if(!seccion)return;
        try{
            const [ce,ci]=await Promise.all([apiObtenerCatalogoElementosInformables(),apiObtenerInspecciones()]);
            catalogo=Array.isArray(ce&&ce.datos)?ce.datos:[];
            inspecciones=Array.isArray(ci&&ci.datos)?ci.datos:[];
            construirGrupos();renderLista();
            const buscar=document.getElementById('buscarInspeccion');if(buscar)buscar.addEventListener('input',renderLista);
        }catch(e){mostrarMensaje(e.message||'No fue posible cargar los elementos inspeccionados.','error');}
    }
    function renderLista(){
        const cont=document.getElementById('listaElementosInspeccionados');if(!cont)return;
        const q=normalizar(document.getElementById('buscarInspeccion')?.value||'');
        const lista=grupos.filter(g=>!q||normalizar([g.elemento.codigo,g.elemento.tipo,g.elemento.nombre,g.elemento.direccion,g.elemento.localidad,g.inspeccion.incidencia].join(' ')).includes(q));
        if(!lista.length){cont.innerHTML='<div class="sin-inspecciones">No hay elementos con inspecciones registradas.</div>';return;}
        cont.innerHTML=lista.map((g,idx)=>{
            const i=g.inspeccion,e=g.elemento,res=normalizar(i.incidenciaEstado||'pendiente')==='resuelta';
            return '<article class="elemento-inspeccionado '+(seleccionado&&seleccionado.inspeccion.id===i.id?'seleccionado':'')+'" data-idx="'+idx+'"><div class="codigo">'+esc(e.codigo||i.codigoElemento||'Sin código')+'</div><strong>'+esc(e.nombre||'Sin nombre')+'</strong><div class="meta">'+esc(e.tipo||'Sin tipo')+' · '+esc(e.direccion||'Sin dirección')+'</div><div class="meta">Última inspección: '+esc(i.fecha||'Sin fecha')+'</div><span class="estado-incidencia '+(res?'estado-resuelta':'estado-pendiente')+'">'+(res?'INCIDENCIA RESUELTA':'INCIDENCIA PENDIENTE')+'</span></article>';
        }).join('');
        Array.from(cont.querySelectorAll('.elemento-inspeccionado')).forEach(card=>card.addEventListener('click',()=>seleccionar(lista[Number(card.dataset.idx)])));
    }
    function seleccionar(g){seleccionado=g;renderLista();renderFicha();}

    function listaFotos(v){
        if(Array.isArray(v)) return v.flatMap(listaFotos).map(x=>String(x||'').trim()).filter(Boolean);
        const s=String(v||'').trim();
        if(!s)return [];
        return s.split(/[\n\r;,]+/).map(x=>x.trim()).filter(x=>/^https?:\/\//i.test(x));
    }

    function urlImagen(url){
        let u=String(url||'').trim();
        if(!u)return '';
        let m=u.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
        if(m)return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(m[1])+'&sz=w1600';
        m=u.match(/[?&]id=([^&#]+)/i);
        if(m&&/drive\.google\.com/i.test(u))return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(m[1])+'&sz=w1600';
        m=u.match(/drive\.google\.com\/uc(?:\\?|\/[^?]*)[^?]*[?&]id=([^&#]+)/i);
        if(m)return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(m[1])+'&sz=w1600';
        return u;
    }

    function fotosRelacionadas(i){
        const campos=[i.fotos,i.fotografias,i.imagenes,i.imagenesUrl,i.fotosUrl,i.documentoUrl,i.fotoUrl,i.foto,i.fotoInspeccion,i.evidenciaUrl,i.evidencias,i.archivoUrl,i.archivosUrl];
        const resultado=[];
        campos.forEach(c=>listaFotos(c).forEach(url=>{if(!resultado.some(x=>x.original===url))resultado.push({original:url,imagen:urlImagen(url)});}));
        return resultado;
    }

    function renderGaleria(i){
        const fotos=fotosRelacionadas(i);
        if(!fotos.length)return '<div class="sin-evidencia">No hay fotografías asociadas a esta inspección.</div>';
        return '<div class="galeria-evidencia">'+fotos.map((foto,n)=>'<figure class="foto-evidencia"><a href="'+esc(foto.original)+'" target="_blank" rel="noopener noreferrer"><img src="'+esc(foto.imagen)+'" alt="Evidencia fotográfica '+(n+1)+'" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.insertAdjacentHTML(\'afterend\',\'<div class=\"foto-error\">No se pudo cargar la imagen. <a href=\"'+esc(foto.original)+'\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir fotografía</a></div>\')"></a><figcaption>Fotografía '+(n+1)+'</figcaption></figure>').join('')+'</div>';
    }

    function renderFotoResolucion(url){
        if(!url)return '';
        const img=urlImagen(url);
        return '<div class="bloque-evidencia resolucion-evidencia"><h4>EVIDENCIA FOTOGRÁFICA DE LA RESOLUCIÓN</h4><div class="galeria-evidencia"><figure class="foto-evidencia"><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><img src="'+esc(img)+'" alt="Fotografía de incidencia resuelta" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.insertAdjacentHTML(\'afterend\',\'<div class=\"foto-error\">No se pudo cargar la imagen. <a href=\"'+esc(url)+'\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir fotografía</a></div>\')"></a><figcaption>Incidencia finalizada</figcaption></figure></div></div>';
    }

    function campoObjeto(e,nombre,valor){
        const v=String(valor==null?'':valor).trim();
        if(!v)return '';
        return '<div class="ficha-dato"><strong>'+esc(nombre)+'</strong>'+esc(v)+'</div>';
    }

    function renderFicha(){
        const cont=document.getElementById('fichaInspeccion');if(!cont||!seleccionado)return;
        const e=seleccionado.elemento,i=seleccionado.inspeccion,res=normalizar(i.incidenciaEstado||'pendiente')==='resuelta';
        const fotoFinal=i.fotoResolucionUrl||'';
        cont.innerHTML='<h3>'+esc(e.nombre||e.codigo||'Elemento inspeccionado')+'</h3>'+ 
        '<div class="ficha-grid">'+
        campoObjeto(e,'Tipo de elemento',e.tipo)+campoObjeto(e,'Código',e.codigo||i.codigoElemento)+campoObjeto(e,'Nombre',e.nombre)+campoObjeto(e,'Número de serie',e.serie)+
        campoObjeto(e,'Dirección',e.direccion)+campoObjeto(e,'Localidad',e.localidad)+campoObjeto(e,'Ciudad',e.ciudad)+campoObjeto(e,'Zona',e.zona)+
        campoObjeto(e,'Estado del objeto',e.estado)+campoObjeto(e,'Características',e.caracteristicas)+campoObjeto(e,'Descripción del objeto',e.descripcion)+
        campoObjeto(e,'Coordenadas',e.coordenadas)+campoObjeto(e,'Geometría',e.geometria)+campoObjeto(e,'Fecha de alta',e.fechaAlta)+campoObjeto(e,'Usuario de alta',e.usuarioAlta)+
        '<div class="ficha-dato"><strong>Fecha del reporte</strong>'+esc(i.fecha||'-')+'</div><div class="ficha-dato"><strong>Inspector</strong>'+esc(i.inspector||'-')+'</div><div class="ficha-dato"><strong>Número de serie de actuación</strong>'+esc(i.numeroSerie||i.id||'-')+'</div><div class="ficha-dato"><strong>Estado de la incidencia</strong>'+esc(res?'RESUELTA':'PENDIENTE')+'</div>'+ 
        (res?'<div class="ficha-dato"><strong>Fecha de resolución</strong>'+esc(i.fechaResolucion||'-')+'</div><div class="ficha-dato"><strong>Usuario que resolvió</strong>'+esc(i.usuarioResolucion||'-')+'</div>':'')+ 
        '</div>'+ 
        '<div class="ficha-detalle"><strong>INSPECCIÓN / INCIDENCIA</strong><br>'+esc(i.incidencia||i.detalle||'Sin detalle')+'</div>'+ 
        '<div class="ficha-detalle"><strong>DATOS COMPLETOS DE LA ACTUACIÓN</strong><br>'+ 
        esc(['Tipo de actuación: '+(i.tipoActuacion||''),'Beta: '+(i.beta||'No posee'),'Matrícula: '+(i.matricula||'No informada'),'Número de boleta: '+(i.numeroBoleta||'No informado'),'Nombre del infractor: '+(i.nombreInfractor||'No informado'),'Cédula: '+(i.cedula||'No informada'),'Usuario: '+(i.usuario||''),'Rol: '+(i.rol||'')].filter(x=>x.replace(/[: ]/g,'')).join('\n'))+'</div>'+ 
        '<div class="bloque-evidencia"><h4>EVIDENCIA FOTOGRÁFICA DE LA INSPECCIÓN</h4>'+renderGaleria(i)+'</div>'+ 
        renderFotoResolucion(fotoFinal)+
        '<div class="acciones-incidencia"><button type="button" id="btnPdfInspeccion" class="btn-incidencia btn-pdf-inspeccion">🖨 Imprimir PDF</button>'+(res?'':'<button type="button" id="btnResolverInspeccion" class="btn-incidencia btn-resolver-inspeccion">✓ Incidencia resuelta</button>')+'</div>'+ 
        (res?'':'<div id="panelResolverInspeccion" class="resolucion-panel" hidden><label for="fotoResolucion">Fotografía obligatoria de la incidencia finalizada</label><input id="fotoResolucion" type="file" accept="image/*" capture="environment"><div class="acciones-incidencia"><button type="button" id="btnConfirmarResolucion" class="btn-incidencia btn-resolver-inspeccion">Confirmar resolución</button></div></div>')+'<p id="mensajeInspeccionFicha" class="mensaje-inspecciones"></p>';
        document.getElementById('btnPdfInspeccion').onclick=imprimirPDF;
        if(!res)document.getElementById('btnResolverInspeccion').onclick=()=>{document.getElementById('panelResolverInspeccion').hidden=false;};
        if(!res)document.getElementById('btnConfirmarResolucion').onclick=resolver;
    }
    async function imprimirPDF(){
        const btn=document.getElementById('btnPdfInspeccion');if(btn)btn.disabled=true;
        try{const r=await apiGenerarPdfActuacionExistente(seleccionado.inspeccion.id);if(!r||!r.ok)throw new Error(r?.mensaje||'No fue posible generar el PDF.');}
        catch(e){mostrarMensajeFicha(e.message||'No fue posible generar el PDF.','error');}
        finally{if(btn)btn.disabled=false;}
    }
    async function resolver(){
        const input=document.getElementById('fotoResolucion'),btn=document.getElementById('btnConfirmarResolucion');
        if(!input||!input.files||!input.files[0]){mostrarMensajeFicha('Debe adjuntar una fotografía de la incidencia finalizada.','error');return;}
        const archivo=input.files[0];if(!archivo.type.startsWith('image/')){mostrarMensajeFicha('La evidencia final debe ser una imagen.','error');return;}
        btn.disabled=true;btn.textContent='Subiendo fotografía…';
        try{
            const base64=await leerBase64(archivo);const subida=await apiSubirArchivo({archivoBase64:base64,nombreArchivo:'resolucion-'+seleccionado.inspeccion.id+'-'+archivo.name,mimeType:archivo.type});
            if(!subida||!subida.ok)throw new Error(subida?.mensaje||'No fue posible subir la fotografía.');
            btn.textContent='Registrando resolución…';
            const r=await apiResolverIncidencia({id:seleccionado.inspeccion.id,fotoResolucionUrl:subida.url});
            if(!r||!r.ok)throw new Error(r?.mensaje||'No fue posible registrar la resolución.');
            seleccionado.inspeccion.incidenciaEstado='RESUELTA';seleccionado.inspeccion.fotoResolucionUrl=subida.url;seleccionado.inspeccion.fechaResolucion=r.fechaResolucion||'';seleccionado.inspeccion.usuarioResolucion=r.usuarioResolucion||'';seleccionado.inspeccion.pdfUrl=r.pdfUrl||seleccionado.inspeccion.pdfUrl;
            mostrarMensajeFicha('Incidencia marcada como RESUELTA correctamente.','exito');renderLista();renderFicha();
        }catch(e){btn.disabled=false;btn.textContent='Confirmar resolución';mostrarMensajeFicha(e.message||'No fue posible cerrar la incidencia.','error');}
    }
    function leerBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=reject;r.readAsDataURL(file);});}
    function mostrarMensaje(t,c){const el=document.getElementById('mensajeInspecciones');if(el){el.textContent=t;el.className='mensaje-inspecciones '+(c||'');}}
    function mostrarMensajeFicha(t,c){const el=document.getElementById('mensajeInspeccionFicha');if(el){el.textContent=t;el.className='mensaje-inspecciones '+(c||'');}}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
