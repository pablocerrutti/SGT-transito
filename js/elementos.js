// =====================================
// SGT - INVENTARIO Y FICHAS TÉCNICAS
// Dirección de Tránsito y Transportes
// =====================================



let elementos = JSON.parse(

localStorage.getItem("elementosSGT")

) || [];




let elementoActual = null;




let tabla = document.getElementById(

"tablaElementos"

);






// =====================================
// CARGAR TABLA
// =====================================



function cargarTabla(){



tabla.innerHTML="";





if(elementos.length===0){



tabla.innerHTML=`

<tr>

<td colspan="5">

No existen elementos registrados

</td>

</tr>

`;

return;


}







elementos.forEach(function(elemento,index){



let fila = tabla.insertRow();





fila.innerHTML=`



<td>

${elemento.codigo || "SIN CÓDIGO"}

</td>



<td>

${elemento.tipo}

</td>



<td>

${elemento.nombre}

</td>



<td>

${elemento.estado}

</td>




<td>



<button class="btn btnFicha"

onclick="abrirFicha(${index})">

<i class="fa-solid fa-file-lines"></i>

Ficha

</button>





<button class="btn btnEliminar"

onclick="eliminarElemento(${index})">

<i class="fa-solid fa-trash"></i>

</button>



</td>



`;



});



}









// =====================================
// ABRIR FICHA
// =====================================



function abrirFicha(index){



elementoActual=index;



let elemento=elementos[index];





document.getElementById("tituloFicha")

.innerHTML=

`

${elemento.tipo}

<br>

${elemento.codigo}

`;







let caracteristicas="";




if(elemento.caracteristicas){



caracteristicas=

elemento.caracteristicas

.map(c=>`<li>${c}</li>`)

.join("");



}







let actuaciones="";




if(elemento.actuaciones){



actuaciones=

elemento.actuaciones

.map(a=>`

<li>

<b>${a.fecha}</b>

<br>

${a.accion}

<br>

Responsable:

${a.responsable}

</li>

<br>

`)

.join("");



}









document.getElementById("contenidoFicha")

.innerHTML=



`

<h3>

${elemento.nombre}

</h3>



<p>

<b>Estado:</b>

${elemento.estado}

</p>




<p>

<b>Descripción:</b>

<br>

${elemento.descripcion || "Sin datos"}

</p>




<h3>

Características

</h3>


<ul>

${caracteristicas || "Sin características"}

</ul>






<h3>

Historial de actuaciones

</h3>



<ul>

${actuaciones || "Sin actuaciones"}

</ul>





`;







document.getElementById("modalFicha")

.style.display="flex";



}









// =====================================
// CERRAR FICHA
// =====================================



function cerrarFicha(){



document.getElementById("modalFicha")

.style.display="none";



elementoActual=null;



}









// =====================================
// GUARDAR ACTUACIÓN
// =====================================



function guardarActuacion(){



if(elementoActual===null){


return;


}





let fecha =

document.getElementById("fechaActuacion").value;



let accion =

document.getElementById("accionActuacion").value;



let responsable =

document.getElementById("responsableActuacion").value;







if(

fecha===""

||

accion===""

){


alert(

"Complete fecha y actuación"

);


return;


}








if(!elementos[elementoActual].actuaciones){


elementos[elementoActual].actuaciones=[];


}







elementos[elementoActual]

.actuaciones

.push({



fecha:fecha,


accion:accion,


responsable:

responsable || "Sin asignar"



});







localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);







alert(

"Actuación registrada correctamente"

);






abrirFicha(elementoActual);






}









// =====================================
// ELIMINAR ELEMENTO
// =====================================



function eliminarElemento(index){



if(

confirm(

"¿Eliminar este elemento?"

)

){



elementos.splice(index,1);






localStorage.setItem(

"elementosSGT",

JSON.stringify(elementos)

);






cargarTabla();



}



}









cargarTabla();