
// =====================================
// SGT - INFORMES DE INSPECCION
// Google Sheets API
// =====================================


// URL API

const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let inspecciones=[];

let elementos=[];





// =====================================
// CARGA INICIAL
// =====================================


cargarDatos();





function cargarDatos(){



Promise.all([


fetch(API_URL+"?accion=inspecciones")
.then(r=>r.json()),



fetch(API_URL+"?accion=elementos")
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

"ERROR CARGANDO INFORMES",

error

);



document.getElementById(

"tablaInformes"

).innerHTML=


`

<tr>

<td colspan="6">

Error al cargar datos

</td>

</tr>

`;



});



}









// =====================================
// MOSTRAR TABLA
// =====================================


function mostrarInformes(){



let tabla=document.getElementById(

"tablaInformes"

);



tabla.innerHTML="";





if(inspecciones.length===0){



tabla.innerHTML=


`

<tr>

<td colspan="6">

No existen inspecciones registradas

</td>

</tr>

`;



return;


}







inspecciones.forEach(function(i){



let elemento=elementos.find(function(e){



return String(e.id) === String(i.elementoId);



});







let nombreElemento=



elemento

?

elemento.nombre

:

"Elemento no encontrado";







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







let claseEstado="";





switch(i.estado){


case "Bueno":

claseEstado="Bueno";

break;


case "Observado":

claseEstado="Observado";

break;


case "Deteriorado":

claseEstado="Deteriorado";

break;


case "Fuera de servicio":

claseEstado="Fuera";

break;


}









tabla.innerHTML +=



`

<tr>


<td>

${formatearFecha(i.fecha)}

</td>



<td>

${nombreElemento}

<br>

<small>

${elemento ? elemento.tipo:""}

</small>

</td>




<td>

<span class="estado ${claseEstado}">

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



</tr>

`;





});



}










// =====================================
// FORMATO FECHA
// =====================================


function formatearFecha(fecha){



if(!fecha){

return "-";

}



let f=new Date(fecha);



return f.toLocaleDateString(

"es-UY",

{

day:"2-digit",

month:"2-digit",

year:"numeric",

hour:"2-digit",

minute:"2-digit"

}

);



}









// =====================================
// ACTUALIZAR
// =====================================


setInterval(function(){


cargarDatos();


},300000);
