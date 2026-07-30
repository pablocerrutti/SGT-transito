<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">


<title>SGT | Elementos Urbanos</title>


<link rel="stylesheet"
href="../css/admin.css">


<link rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">


<style>


.barra{

display:flex;

gap:10px;

margin-bottom:20px;

}



.barra input{

flex:1;

padding:12px;

border-radius:8px;

border:1px solid #ccc;

}




.modal{

display:none;

position:fixed;

inset:0;

background:rgba(0,0,0,.65);

justify-content:center;

align-items:center;

z-index:2000;

}




.ficha{

background:white;

color:#222;

width:500px;

max-height:85vh;

overflow:auto;

padding:30px;

border-radius:15px;

}



.btn{

padding:10px 15px;

border:none;

border-radius:8px;

cursor:pointer;

}



.btnFicha{

background:#0d6efd;

color:white;

}



.btnEliminar{

background:#b30000;

color:white;

}



</style>


</head>





<body>





<div class="sidebar">


<div class="logo">


<img src="../img/logo.png">


<h2>SGT</h2>


<p>

Dirección de Tránsito y Transportes

</p>


</div>





<ul>


<li onclick="location='dashboard.html'">


<i class="fa-solid fa-house"></i>


Dashboard


</li>





<li onclick="location='mapa.html'">


<i class="fa-solid fa-map"></i>


Mapa


</li>





<li class="activo">


<i class="fa-solid fa-location-dot"></i>


Elementos


</li>





<li onclick="cerrarSesion()">


<i class="fa-solid fa-right-from-bracket"></i>


Salir


</li>



</ul>



</div>






<div class="contenido">



<header>


<div>


<h1>

Inventario Urbano

</h1>


<p>

Elementos geolocalizados de tránsito

</p>


</div>


<div class="usuarioNombre"></div>


</header>





<div class="barra">


<input

placeholder="Buscar elemento..."

onkeyup="buscarTabla(this.value)">



</div>





<table>


<thead>


<tr>


<th>

Código

</th>


<th>

Tipo

</th>


<th>

Nombre

</th>


<th>

Estado

</th>


<th>

Actuaciones

</th>


<th>

Acción

</th>


</tr>


</thead>


<tbody id="tablaElementos">


</tbody>


</table>




<div class="modal" id="modalFicha">


<div class="ficha">


<h2 id="tituloFicha">

Elemento

</h2>





<div id="contenidoFicha">

</div>





<hr>



<h3>

Nueva actuación

</h3>




<input

id="fechaActuacion"

type="date">





<textarea

id="accionActuacion"

placeholder="Trabajo realizado"

style="width:100%;height:80px;">

</textarea>





<input

id="responsableActuacion"

placeholder="Responsable">





<br><br>





<button

class="btn btnFicha"

onclick="guardarActuacion()">

Guardar actuación

</button>





<button

class="btn"

onclick="cerrarFicha()">

Cerrar

</button>





</div>


</div>








<script src="../js/permisos.js"></script>


<script src="../js/elementos.js"></script>



<script>


permitirModulo("movilidad");


cargarUsuario();




function cerrarSesion(){


localStorage.removeItem("usuarioActual");


window.location="../login.html";


}






function buscarTabla(texto){


texto=texto.toLowerCase();



let filas=document.querySelectorAll(
"#tablaElementos tr"
);



filas.forEach(function(fila){



fila.style.display=


fila.innerText
.toLowerCase()
.includes(texto)

?

""

:

"none";



});



}




</script>



</body>

</html>