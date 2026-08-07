//==================================================
// SGT - INFORMES
// Listado de elementos por localidad
//==================================================


let elementos = [];

let localidades = [];

let usuario = null;


//==================================================
// INICIO
//==================================================


document.addEventListener(
    "DOMContentLoaded",
    iniciar
);



async function iniciar(){


    try{

        usuario =
            JSON.parse(
                localStorage.getItem("usuarioActual")
            );


    }catch(e){}



    if(!usuario){

        location.href="../../index.html";

        return;

    }



    document
    .getElementById("usuarioNombre")
    .textContent =
        usuario.nombre ||
        usuario.usuario ||
        "";




    document
    .getElementById("btnPDF")
    .onclick =
        generarPDF;




    document
    .getElementById("btnVolver")
    .onclick=function(){

        location.href =
            "../movilidad/mapa.html";

    };




    document
    .getElementById("btnActualizar")
    .onclick =
        cargarElementos;




    document
    .getElementById("buscar")
    .addEventListener(
        "input",
        renderizar
    );




    document
    .getElementById("filtroTipo")
    .addEventListener(
        "change",
        renderizar
    );




    document
    .getElementById("filtroEstado")
    .addEventListener(
        "change",
        renderizar
    );




    document
    .getElementById("filtroLocalidad")
    .addEventListener(
        "change",
        renderizar
    );



    await cargarLocalidades();


    await cargarElementos();



}



//==================================================
// LOCALIDADES
//==================================================


async function cargarLocalidades(){


    const combo =
        document.getElementById(
            "filtroLocalidad"
        );



    combo.innerHTML =
    `
    <option value="">
    Todas las localidades
    </option>
    `;



    const respuesta =
        await apiObtenerLocalidades();



    if(!respuesta || !respuesta.ok)
        return;



    localidades =
        respuesta.datos || [];



    localidades.forEach(l=>{


        combo.add(

            new Option(
                l.nombre,
                l.nombre
            )

        );


    });



}



//==================================================
// CARGAR ELEMENTOS
//==================================================


async function cargarElementos(){


    mensaje(
        "Cargando elementos...",
        ""
    );



    const respuesta =
        await apiObtenerElementos();



    if(!respuesta || !respuesta.ok){


        mensaje(
            "No se pudieron cargar los elementos.",
            "error"
        );


        return;

    }



    elementos =
        respuesta.datos || [];



    cargarFiltros();



    renderizar();



    mensaje(
        elementos.length +
        " elementos encontrados.",
        "exito"
    );


}




///==================================================
// FILTROS
//==================================================

function cargarFiltros(){

    const tipo =
        document.getElementById("filtroTipo");

    const estado =
        document.getElementById("filtroEstado");

    const localidad =
        document.getElementById("filtroLocalidad");


    tipo.innerHTML =
        `<option value="">
        Todos los tipos
        </option>`;


    estado.innerHTML =
        `<option value="">
        Todos los estados
        </option>`;


    localidad.innerHTML =
        `<option value="">
        Todas las localidades
        </option>`;



    [...new Set(elementos.map(e=>e.tipo))]
    .filter(Boolean)
    .forEach(t=>{

        tipo.add(
            new Option(t,t)
        );

    });



    [...new Set(elementos.map(e=>e.estado))]
    .filter(Boolean)
    .forEach(e=>{

        estado.add(
            new Option(e,e)
        );

    });



    [...new Set(elementos.map(e=>e.localidadNombre))]
    .filter(Boolean)
    .forEach(l=>{

        localidad.add(
            new Option(l,l)
        );

    });


}

//==================================================
// TABLA
//==================================================

function renderizar(){


    const tabla =
        document.getElementById(
            "tablaElementos"
        );


    tabla.innerHTML="";



    const texto =
        normalizar(
            document
            .getElementById("buscar")
            .value
        );



    const tipo =
        document
        .getElementById("filtroTipo")
        .value;



    const estado =
        document
        .getElementById("filtroEstado")
        .value;



    const localidad =
        document
        .getElementById("filtroLocalidad")
        .value;





    const lista =
    elementos.filter(e=>{


        if(tipo && e.tipo !== tipo){

            return false;

        }



        if(estado && e.estado !== estado){

            return false;

        }



        if(localidad && e.localidadNombre !== localidad){

            return false;

        }





        const cadena = [

            e.codigo,

            e.nombre,

            e.tipo,

            e.direccion,

            e.estado,

            e.localidadNombre

        ].join(" ");





        return normalizar(cadena)
        .includes(texto);



    });






    lista.forEach(e=>{


        const fila =
        document.createElement("tr");



        fila.innerHTML = `


        <td>
            ${esc(e.codigo)}
        </td>


        <td>
            ${esc(e.localidadNombre || "Sin localidad")}
        </td>


        <td>
            ${esc(e.tipo)}
        </td>


        <td>
            ${esc(e.nombre)}
        </td>


        <td>
            ${esc(e.direccion)}
        </td>


        <td>
            ${esc(e.estado)}
        </td>


        `;



        tabla.appendChild(fila);


    });



}
    //==========================================
    // FILTRAR
    //==========================================

    const lista =
        elementos.filter(e=>{

            if(tipo && e.tipo !== tipo)
                return false;

            if(estado && e.estado !== estado)
                return false;

            if(localidad && e.localidadNombre !== localidad)
                return false;

            const cadena = [

                e.codigo,
                e.nombre,
                e.tipo,
                e.direccion,
                e.estado,
                e.localidadNombre

            ].join(" ");

            return normalizar(cadena)
                .includes(texto);

        });


    // Guardamos la lista filtrada para el PDF
    elementosFiltrados = lista;


    //==========================================
    // MOSTRAR TABLA
    //==========================================
console.log("LISTA A MOSTRAR", lista);

    lista.forEach(e=>{

        const fila =
            document.createElement("tr");

        fila.innerHTML = `

            <td>${esc(e.codigo)}</td>

            <td>${esc(e.localidadNombre || "-")}</td>

            <td>${esc(e.tipo)}</td>

            <td>${esc(e.nombre)}</td>

            <td>${esc(e.direccion)}</td>

            <td>${esc(e.estado)}</td>

        `;

        tabla.appendChild(fila);

    });


    mensaje(
        lista.length +
        " elementos encontrados.",
        "exito"
    );





//==================================================
// PDF
//==================================================


function generarPDF(){


    const {jsPDF}=window.jspdf;


    const doc =
        new jsPDF();



    const localidad =
        document
        .getElementById("filtroLocalidad")
        .value || "Todas";



    const tipo =
        document
        .getElementById("filtroTipo")
        .value || "Todos";



    doc.setFontSize(18);


    doc.text(
        "SGT - Informe de elementos",
        14,
        20
    );



    doc.setFontSize(10);



    doc.text(
        "Localidad: "+localidad,
        14,
        30
    );


    doc.text(
        "Tipo: "+tipo,
        14,
        37
    );



    doc.text(
        "Fecha: "+
        new Date()
        .toLocaleDateString(),
        14,
        44
    );




    const filas =
        Array.from(
            document.querySelectorAll(
                "#tablaElementos tr"
            )
        )
        .map(tr=>
            Array.from(
                tr.children
            )
            .map(td=>td.textContent)
        );




    doc.autoTable({

        startY:55,

        head:[[
            "Código",
            "Localidad",
            "Tipo",
            "Nombre",
            "Dirección",
            "Estado"
        ]],


        body:filas,


        styles:{
            fontSize:8
        }

    });




    doc.save(
        "Informe_SGT_"+localidad+".pdf"
    );

}



//==================================================
// UTILIDADES
//==================================================


function normalizar(texto){

return String(texto || "")

.normalize("NFD")

.replace(/[\u0300-\u036f]/g,"")

.toLowerCase()

.trim();

}




function esc(valor){

return String(valor || "")

.replace(/&/g,"&amp;")

.replace(/</g,"&lt;")

.replace(/>/g,"&gt;")

.replace(/"/g,"&quot;");

}




function mensaje(texto,clase){


const m =
document.getElementById("mensaje");


if(!m)
return;


m.textContent=texto;


m.className=clase || "";


}