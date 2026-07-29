function cambiarPassword(){


let actual=
document.getElementById("actual").value;


let nueva=
document.getElementById("nueva").value;


let confirmar=
document.getElementById("confirmar").value;



let usuario=
JSON.parse(
localStorage.getItem("usuarioActual")
);



if(!usuario){

alert("Sesión no válida");

window.location="../login.html";

return;

}




if(usuario.password!==actual){

alert("La contraseña actual no es correcta");

return;

}




if(nueva.length<6){

alert("La nueva contraseña debe tener al menos 6 caracteres");

return;

}



if(nueva!==confirmar){

alert("Las contraseñas no coinciden");

return;

}




let usuarios=
JSON.parse(
localStorage.getItem("usuariosSGT")
);



let posicion=
usuarios.findIndex(

u=>u.usuario===usuario.usuario

);



usuarios[posicion].password=nueva;

usuarios[posicion].debeCambiarPassword=false;



localStorage.setItem(
"usuariosSGT",
JSON.stringify(usuarios)
);



localStorage.setItem(
"usuarioActual",
JSON.stringify(usuarios[posicion])
);



alert("Contraseña actualizada correctamente");



window.location="dashboard.html";


}