// =====================================
// SGT - INFORMES DE INSPECCION + PDF
// Google Sheets API
// =====================================


// URL API

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let inspecciones=[];

let elementos=[];







// =====================================
// CARGA DATOS
// =====================================


cargarDatos();





function cargarDatos(){



Promise.all([



fetch(

API_URL+"?accion=inspecciones"

)

.then(r=>r.json()),





fetch(

API_URL+"?accion=elementos"

)

.then(r=>r.json())



])



.then(resultado=>{



inspecciones=resultado[0];

elementos=resultado[1];



console.log(

"INSPECCIONES",

inspecciones

);



console.log(

"ELEMENTOS",

elementos

);



mostrarInformes();



})



.catch(error=>{



console.error(

"ERROR DATOS",

error

);



document.getElementById(

"tablaInformes"

).innerHTML=



`

<tr>

<td colspan="7">

Error cargando información

</td>

</tr>

`;



});



}









// =====================================
// TABLA INFORMES
// =====================================


function mostrarInformes(){



let tabla=document.getElementById(

"tablaInformes"

);



tabla.innerHTML="";





if(!inspecciones.length){



tabla.innerHTML=


`

<tr>

<td colspan="7">

No existen inspecciones

</td>

</tr>

`;



return;


}







inspecciones.forEach(function(i){



let elemento=elementos.find(function(e){



return String(e.id)===String(i.elementoId);



});







let nombreElemento = elemento

?

elemento.nombre

:

"Elemento desconocido";







let foto="";





if(i.foto){



foto=


`

<a href="${i.foto}" target="_blank">


<img src="${i.foto}">


</a>

`;



}

else{


foto="-";


}









let clase="";





switch(i.estado){



case "Bueno":

clase="Bueno";

break;



case "Observado":

clase="Observado";

break;



case "Deteriorado":

clase="Deteriorado";

break;



case "Fuera de servicio":

clase="Fuera";

break;



}









tabla.innerHTML +=



`

<tr>



<td>

${formatearFecha(i.fecha)}

</td>





<td>


<b>

${nombreElemento}

</b>


<br>


${elemento ? elemento.tipo:""}


</td>





<td>


<span class="estado ${clase}">


${i.estado || "-"}


</span>


</td>





<td>


${i.observacion || "-"}


</td>





<td>


${i.usuario || "-"}


</td>





<td>


${foto}


</td>





<td>


<button class="btn-pdf"

onclick="generarPDF('${i.id}')">


📄 PDF


</button>


</td>




</tr>



`;




});



}









// =====================================
// FORMATEAR FECHA
// =====================================


function formatearFecha(fecha){



if(!fecha)

return "-";



let f=new Date(fecha);



return f.toLocaleString(

"es-UY"

);



}









// =====================================
// GENERAR PDF
// =====================================


function generarPDF(id){



let inspeccion=inspecciones.find(function(i){



return String(i.id)===String(id);



});





if(!inspeccion){



alert(

"No encontrada"

);



return;


}







let elemento=elementos.find(function(e){



return String(e.id)===String(inspeccion.elementoId);



});







let ventana=window.open("");






ventana.document.write(



`

<!DOCTYPE html>

<html>


<head>


<title>

Informe SGT

</title>



<style>


body{


font-family:Arial;

padding:40px;

}


h1{


color:#0f6fae;

}


h2{


border-bottom:1px solid #ccc;

padding-bottom:10px;

}


.dato{


margin:8px 0;

}


.foto{


width:450px;

border-radius:10px;

}


button{


padding:12px;

background:#0f6fae;

color:white;

border:0;

border-radius:8px;

cursor:pointer;

}



</style>



</head>




<body>



<h1>

SGT

</h1>


<h2>

Informe de Inspección

</h2>




<div class="dato">

<b>Elemento:</b>

${elemento ? elemento.nombre:"-"}

</div>



<div class="dato">

<b>Tipo:</b>

${elemento ? elemento.tipo:"-"}

</div>




<div class="dato">

<b>Código:</b>

${elemento ? elemento.codigo:"-"}

</div>





<div class="dato">

<b>Coordenadas:</b>

${elemento ? elemento.lat+" / "+elemento.lng:"-"}

</div>




<hr>



<h2>

Inspección

</h2>



<div class="dato">

<b>Fecha:</b>

${formatearFecha(inspeccion.fecha)}

</div>




<div class="dato">

<b>Inspector:</b>

${inspeccion.usuario || "-"}

</div>





<div class="dato">

<b>Estado:</b>

${inspeccion.estado || "-"}

</div>





<div class="dato">

<b>Observación:</b>

</div>


<p>

${inspeccion.observacion || "-"}

</p>







${
inspeccion.foto

?

`

<h2>

Evidencia

</h2>


<img class="foto"

src="${inspeccion.foto}">


`

:

""

}




<br><br>



<button onclick="window.print()">

Guardar PDF

</button>




</body>


</html>



`



);



}
