// =====================================
// SGT - LOGIN FIREBASE
// Dirección de Tránsito y Transportes
// =====================================


import { auth, db } from "./firebase-config.js";

import {

signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

ref,
get

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";






// LOGIN USUARIO


const botonUsuario = document.querySelector(".btnUsuario");



botonUsuario.addEventListener(

"click",

function(){



let usuario = document.querySelectorAll("input")[0].value;


let password = document.querySelectorAll("input")[1].value;





if(usuario==="" || password===""){


alert("Complete usuario y contraseña");


return;


}






// Convertimos usuario a correo

let correo = usuario;



if(!usuario.includes("@")){


correo = usuario.toLowerCase()+"@sgt.local";


}






iniciarSesion(correo,password);



}



);









// LOGIN ADMIN


const botonAdmin = document.querySelector(".btnAdmin");



botonAdmin.addEventListener(

"click",

function(){



let usuario = document.querySelectorAll("input")[2].value;


let password = document.querySelectorAll("input")[3].value;





if(usuario==="" || password===""){


alert("Complete usuario y contraseña");


return;


}





let correo = usuario;



if(!usuario.includes("@")){


correo = usuario.toLowerCase()+"@sgt.local";


}





iniciarSesion(correo,password);



}

);









// =====================================
// AUTENTICAR
// =====================================


function iniciarSesion(correo,password){





signInWithEmailAndPassword(

auth,

correo,

password

)



.then(async function(resultado){



let uid = resultado.user.uid;





// Buscar datos del usuario

let usuarioRef = ref(

db,

"usuarios/"+uid

);





let datos = await get(usuarioRef);







if(datos.exists()){



let usuario = datos.val();





localStorage.setItem(

"usuarioActual",

JSON.stringify(usuario)

);







if(usuario.rol==="Administrador"){



window.location="admin/dashboard.html";


}

else if(usuario.rol==="Movilidad Urbana"){



window.location="movilidad/dashboard.html";


}

else if(usuario.rol==="Inspector"){



window.location="inspector/dashboard.html";


}

else{


alert("Rol no configurado");


}



}

else{


alert(

"Usuario sin configuración en el sistema"

);



}



})



.catch(function(error){



console.log(error);



alert(

"Usuario o contraseña incorrectos"

);



});



}