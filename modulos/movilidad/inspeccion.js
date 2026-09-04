//==================================================
// SGT - INSPECCIONES
//==================================================

let usuario;
try { usuario = JSON.parse(localStorage.getItem("usuarioActual")); } catch (_) {}
if(!usuario) location.href="../../index.html";

document.getElementById("usuarioNombre").textContent = usuario.nombre || usuario.usuario || "";
document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar(){
    document.getElementById("btnVolver").onclick=function(){ location.href="../movilidad/mapa.html"; };
    document.getElementById("formInspeccion").addEventListener("submit", guardar);
    await cargarElementoSeleccionado();
    await cargarInspecciones();
}

function obtenerParametro(nombre){
    return new URLSearchParams(window.location.search).get(nombre);
}

async function cargarElementoSeleccionado(){
    const id=obtenerParametro("elemento");
    const texto=document.getElementById("elementoTexto");
    const campoId=document.getElementById("elemento");
    if(!id){ texto.value="No se seleccionó ningún elemento"; return; }

    const respuesta=await apiObtenerElementos();
    if(!respuesta.ok){ texto.value="Error cargando elemento"; return; }
    const elemento=(respuesta.datos||[]).find(e=>e.id==id);

    if(!elemento){
        const respZona=await apiObtenerZonasEstacionamiento();
        if(respZona && respZona.ok && respZona.datos){
            const zona=respZona.datos.find(e=>e.id==id);
            if(zona){
                campoId.value=zona.id;
                texto.value=`${zona.codigo||"ET"} - ${zona.nombre||"Zona estacionamiento"}`;
                return;
            }
        }
        const respCordon=await apiObtenerCordonesRojos();
        if(respCordon && respCordon.ok && respCordon.datos){
            const cordon=respCordon.datos.find(e=>e.id==id);
            if(cordon){
                campoId.value=cordon.id;
                texto.value=`${cordon.codigo||"CR"} - ${cordon.nombre||"Cordón rojo"}`;
                return;
            }
        }
        texto.value="Elemento no encontrado";
        return;
    }
    campoId.value=elemento.id;
    texto.value=`${elemento.codigo} - ${elemento.nombre||elemento.tipo}`;
}

async function archivoBase64(file,maximo){
    if(!file) return "";
    if(file.size>maximo) throw new Error(file.name+" supera el tamaño permitido.");
    const base64=await new Promise((ok,error)=>{
        const reader=new FileReader();
        reader.onload=()=>ok(reader.result.split(",")[1]);
        reader.onerror=error;
        reader.readAsDataURL(file);
    });
    const subida=await apiSubirArchivo({archivoBase64:base64,nombreArchivo:file.name,mimeType:file.type});
    if(!subida.ok) throw new Error(subida.mensaje);
    return subida.url;
}

async function guardar(ev){
    ev.preventDefault();
    const boton=ev.submitter;
    boton.disabled=true;
    try{
        const elemento=document.getElementById("elemento");
        const archivos=Array.from(document.getElementById("documento").files||[]);
        if(archivos.length>4) throw new Error("Puede adjuntar como máximo 4 fotografías.");
        for(const archivo of archivos){
            if(!archivo.type || archivo.type.indexOf("image/")!==0) throw new Error("Solo se permiten fotografías.");
        }
        const urls=[];
        for(const archivo of archivos){
            const url=await archivoBase64(archivo,10*1024*1024);
            if(url) urls.push(url);
        }

        const respuesta=await apiGuardarInspeccion({
            elementoId:elemento.value,
            codigoElemento:document.getElementById("elementoTexto").value,
            inspector:usuario.nombre||usuario.usuario,
            incidencia:document.getElementById("incidencia").value.trim(),
            documentoUrl:urls.join("\n"),
            // Movilidad no utiliza tipo de actuación en este formulario.
            // El backend asigna automáticamente "Inspección de elemento".
            tipoActuacion:"Inspección de elemento",
            rol:usuario.rol||"movilidad",
            usuario:usuario.usuario||usuario.nombre||""
        });

        if(!respuesta.ok) throw new Error(respuesta.mensaje);
        mensaje(respuesta.mensaje,"exito");
        ev.target.reset();
        await cargarElementoSeleccionado();
        await cargarInspecciones();
    }catch(err){
        mensaje(err.message,"error");
    }
    boton.disabled=false;
}

async function cargarInspecciones(){
    const respuesta=await apiObtenerInspecciones();
    const lista=document.getElementById("lista");
    lista.innerHTML="";
    if(!respuesta.ok) return;
    (respuesta.datos||[]).forEach(i=>{
        const art=document.createElement("article");
        art.className="inspeccion";
        art.innerHTML=`<strong>${esc(i.codigoElemento)}</strong><p>${esc(i.incidencia)}</p><small>${esc(i.inspector)} - ${esc(i.fecha)}</small>`+
            (i.documentoUrl?`<br><a target="_blank" href="${i.documentoUrl.split(/[\n,;]+/)[0]}">📷 Ver fotografía</a>`:"");
        lista.appendChild(art);
    });
}

function mensaje(texto,clase){
    const m=document.getElementById("mensaje");
    m.textContent=texto;
    m.className=clase;
}

function esc(valor){
    return String(valor||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
