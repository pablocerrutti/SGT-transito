// =====================================
// SGT - GESTION USUARIOS
// GOOGLE SHEETS
// =====================================



const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let usuarios=[];






cargarUsuarios();






function cargarUsuarios(){



fetch(

API_URL+"?accion=usuarios"

)



.then(r=>r.json())



.then(data=>{



usuarios=data;



mostrarUsuarios();



})



.catch(error=>{


console.error(error);


});



}









function mostrarUsuarios(){



let tabla=document.getElementById(

"tablaUsuarios"

);



if(!tabla)

return;






tabla.innerHTML="";







usuarios.forEach(function(u){



tabla.innerHTML+=



`

<tr>

<td>${u.nombre}</td>

<td>${u.usuario}</td>

<td>${u.rol}</td>

<td>${u.estado || "Activo"}</td>

</tr>

`;


});



}
