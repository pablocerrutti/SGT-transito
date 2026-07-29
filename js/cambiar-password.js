// =====================================
// SGT - CAMBIO DE CONTRASEÑA
// =====================================



let usuarioActual =

JSON.parse(

localStorage.getItem("usuarioActual")

);





if(!usuarioActual){


window.location="login.html";


}







function cambiarPassword(){



let nueva =

document
.getElementById("nuevaPassword")
.value;



let confirmar =

document
.getElementById("confirmarPassword")
.value;





if(nueva==="" || confirmar===""){


alert("Complete ambos campos");


return;


}






if(nueva!==confirmar){


alert("Las contraseñas no coinciden");


return;


}






if(nueva.length < 6){


alert("La contraseña debe tener al menos 6 caracteres");


return;


}







usuarioActual.clave=nueva;


usuarioActual.cambiarPassword=false;






localStorage.setItem(

"usuarioActual",

JSON.stringify(usuarioActual)

);






// Guardar también en usuarios locales

let usuarios =

JSON.parse(

localStorage.getItem("usuariosSGT")

)

|| [];







let existe = usuarios.find(

u=>u.usuario===usuarioActual.usuario

);






if(existe){


existe.clave=nueva;


existe.cambiarPassword=false;


}

else{


usuarios.push(usuarioActual);


}






localStorage.setItem(

"usuariosSGT",

JSON.stringify(usuarios)

);







alert(

"Contraseña actualizada correctamente"

);







if(usuarioActual.rol==="Administrador"){


window.location="admin/dashboard.html";


}

else if(usuarioActual.rol==="Movilidad Urbana"){


window.location="movilidad/dashboard.html";


}

else{


window.location="inspector/dashboard.html";


}



}