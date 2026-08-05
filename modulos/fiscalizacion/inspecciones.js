/********************************************************
 SGT
 MODULO FISCALIZACION
 ACTUACIONES DE TRANSITO
********************************************************/


let usuario = null;


try {

    usuario = JSON.parse(localStorage.getItem("usuarioActual"));

} catch(e){}



const rol = String((usuario || {}).rol || "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase()
.trim();



if(!usuario){

    location.href="../../index.html";


}else if(!["super admin","supervisor","fiscalizacion"].includes(rol)){


    location.href="../../pages/dashboard.html";


}else{


    document.getElementById("usuarioNombre").textContent =
    usuario.nombre || usuario.usuario || "";


    iniciar();

}





//======================================================
// INICIO
//======================================================

function iniciar(){


    document.getElementById("btnVolver").onclick = () =>
    location.href="../../pages/dashboard.html";


    cargarInspector();


    document.getElementById("formInspeccion").onsubmit = guardar;


    cargar();


}





//======================================================
// DATOS DEL INSPECTOR
//======================================================

function cargarInspector(){


    const beta = document.getElementById("beta");
    const inspector = document.getElementById("inspector");


    inspector.value =
    usuario.nombre || usuario.usuario || "";


    beta.value =
    usuario.beta || "";



    /*
      Solo los usuarios de fiscalización
      necesitan Beta obligatorio
    */

    if(
        rol === "fiscalizacion" &&
        !usuario.beta
    ){

        mensaje(
        "El inspector no tiene Número Beta asignado. Contacte al administrador.",
        "error"
        );


    }


}





//======================================================
// SUBIR ARCHIVOS
//======================================================

async function archivoBase64(file,max){


    if(!file) return "";


    if(file.size > max){

        throw new Error(
        file.name+" supera el tamaño permitido."
        );

    }



    const data = await new Promise((ok,no)=>{


        const r = new FileReader();


        r.onload = () =>
        ok(
        String(r.result).split(",")[1]
        );


        r.onerror=no;


        r.readAsDataURL(file);


    });



    const respuesta =
    await apiSubirArchivo({

        archivoBase64:data,
        nombreArchivo:file.name,
        mimeType:file.type

    });



    if(!respuesta.ok){

        throw new Error(respuesta.mensaje);

    }



    return respuesta.url;


}





//======================================================
// GUARDAR ACTUACION
//======================================================

async function guardar(ev){


    ev.preventDefault();



    const boton = ev.submitter;

    boton.disabled=true;



    try{


        if(
            rol==="fiscalizacion" &&
            !usuario.beta
        ){

            throw new Error(
            "No tiene Número Beta asignado."
            );

        }



        const tipo =
        document.getElementById("tipoActuacion").value;



        const requiereFoto =
        tipo==="Multa" ||
        tipo==="Apercibimiento";



        const video =
        await archivoBase64(
            document.getElementById("video").files[0],
            30*1024*1024
        );



        const documento =
        await archivoBase64(
            document.getElementById("documento").files[0],
            10*1024*1024
        );



        if(requiereFoto && !documento){

            throw new Error(
            "Debe adjuntar fotografía de la actuación."
            );

        }





        const datos={


            beta:usuario.beta || "",


            inspector:
            usuario.nombre ||
            usuario.usuario,



            matricula:
            document.getElementById("matricula").value
            .trim()
            .toUpperCase(),



            tipoActuacion:tipo,



            numeroBoleta:
            document.getElementById("numeroBoleta").value
            .trim(),



            nombreInfractor:
            document.getElementById("nombreInfractor").value
            .trim(),



            cedula:
            document.getElementById("cedula").value
            .trim(),



            detalle:
            document.getElementById("detalle").value
            .trim(),



            videoUrl:video,


            documentoUrl:documento


        };





        const r =
        await apiGuardarInspeccion(datos);



        if(!r.ok){

            throw new Error(r.mensaje);

        }



        mensaje(
        r.mensaje,
        "exito"
        );



        ev.target.reset();



        cargarInspector();



        cargar();



    }
    catch(error){


        mensaje(
        error.message,
        "error"
        );


    }
    finally{


        boton.disabled=false;


    }


}






//======================================================
// LISTADO
//======================================================

async function cargar(){


    const r =
    await apiObtenerInspecciones();



    const lista =
    document.getElementById("lista");



    lista.replaceChildren();



    if(!r.ok)return;



    (r.datos || []).forEach(i=>{


        const x =
        document.createElement("article");



        x.className="inspeccion";



        x.innerHTML=`

        <strong>
        ${esc(i.matricula || "")}
        -
        ${esc(i.tipoActuacion || "")}
        </strong>


        <p>
        ${esc(i.detalle || "")}
        </p>


        <small>

        ${esc(i.inspector || "")}

        ${i.beta ? " - Beta "+esc(i.beta):""}

        -

        ${esc(i.fecha || "")}

        </small>


        ${
        i.videoUrl
        ?
        `<br><a target="_blank" href="${esc(i.videoUrl)}">
        Video BodyCam
        </a>`
        :""
        }


        ${
        i.documentoUrl
        ?
        `<br><a target="_blank" href="${esc(i.documentoUrl)}">
        Foto actuación
        </a>`
        :""
        }


        `;


        lista.append(x);



    });



}





//======================================================
// MENSAJES
//======================================================

function mensaje(t,c){


    const e =
    document.getElementById("mensaje");


    e.textContent=t;

    e.className=c;


}





//======================================================
// SEGURIDAD HTML
//======================================================

function esc(v){


    return String(v || "")

    .replace(/&/g,"&amp;")

    .replace(/</g,"&lt;")

    .replace(/"/g,"&quot;");


}
