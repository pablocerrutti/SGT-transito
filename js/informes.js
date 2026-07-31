// =====================================
// SGT - INFORMES MOVILIDAD
// =====================================


const API_INFORMES =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let datosInforme={};




// =====================================
// INICIO
// =====================================


window.onload=function(){


cargarInforme();


};





// =====================================
// CARGAR INFORME
// =====================================


async function cargarInforme(){



try{


let respuesta = await fetch(

API_INFORMES+"?accion=informeElementos"

);



let datos = await respuesta.json();




if(!datos.ok){


alert(

"No hay información disponible"

);


return;


}





datosInforme = datos.categorias;



mostrarInforme();



}



catch(error){


console.error(error);


alert(

"Error cargando informe"

);



}


}








// =====================================
// MOSTRAR RESUMEN
// =====================================


function mostrarInforme(){



let tabla=document.querySelector(

"#tablaInforme tbody"

);



if(!tabla)return;




tabla.innerHTML="";





let totalGeneral=0;





for(let categoria in datosInforme){



let item=datosInforme[categoria];



totalGeneral += item.total;





let estados="";





for(let estado in item.estados){



estados +=

estado+

": "+

item.estados[estado]+

"<br>";



}







let fila=document.createElement(

"tr"

);






fila.innerHTML=



`

<td>

${categoria}

</td>


<td>

${item.total}

</td>


<td>

${estados}

</td>


`;





tabla.appendChild(fila);





}







let titulo=document.getElementById(

"totalElementos"

);



if(titulo){


titulo.innerHTML=

"Total elementos registrados: "

+totalGeneral;


}




}










// =====================================
// GENERAR PDF
// =====================================


function generarPDF(){



let ventana = window.open(

"",

"_blank"

);






let contenido=



`

<html>

<head>

<title>

Informe SGT

</title>


<style>

body{

font-family:Arial;

padding:30px;

}


table{

width:100%;

border-collapse:collapse;

}


td,th{

border:1px solid #333;

padding:8px;

}


</style>


</head>



<body>


<h1>

SGT - Informe de Movilidad Urbana

</h1>


<p>

Fecha:

${new Date().toLocaleDateString()}

</p>




<table>


<tr>

<th>

Categoría

</th>


<th>

Cantidad

</th>


<th>

Estados

</th>


</tr>



`;







for(let categoria in datosInforme){



let item=datosInforme[categoria];


let estados="";



for(let estado in item.estados){


estados +=

estado+

": "+

item.estados[estado]+
"<br>";



}






contenido +=


`

<tr>

<td>

${categoria}

</td>


<td>

${item.total}

</td>


<td>

${estados}

</td>


</tr>


`;



}







contenido +=


`

</table>


</body>

</html>

`;







ventana.document.write(contenido);


ventana.document.close();



ventana.print();





}