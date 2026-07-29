// =====================================
// SGT - LOGIN MULTIROL
// Dirección de Tránsito y Transportes
// =====================================


// CREAR ADMINISTRADORES INICIALES


let usuarios = JSON.parse(

localStorage.getItem("usuariosSGT")

);



if(!usuarios){


usuarios=[


{
nombre:"Pablo Cerrutti",
usuario:"Pcerrutti",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
},


{
nombre:"Marcelo Perez",
usuario:"Mperez",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
},


{
nombre:"Gustavo Bentancur",
usuario:"Gbentancur",
password:"Admin123",
rol:"Administrador",
estado:"Activo",
debeCambiarPassword:true
}


];



localStorage.setItem(

"usuariosSGT",

JSON.stringify(usuarios)

);


}





// LOGIN ADMIN


document.querySelector(".btnAdmin").onclick=function(){



let usuario = 
document.querySelector(".admin input[type=text]").value;



let password =
document.querySelector(".admin input[type=password]").value;



iniciarSesion(usuario,password);



};







// LOGIN USUARIO


document.querySelector(".btnUsuario").onclick=function(){



let panel =
document.querySelector(".btnUsuario").parentElement;



let usuario =
panel.querySelector("input[type=text]").value;



let password =
panel.querySelector("input[type=password]").value;



iniciarSesion(usuario,password);



};








function iniciarSesion(usuario,password){



let usuarios = JSON.parse(

localStorage.getItem("usuariosSGT")

) || [];





let encontrado = usuarios.find(

u =>

u.usuario === usuario &&

u.password === password &&

u.estado === "Activo"

);






if(!encontrado){


alert("Usuario o contraseña incorrectos");


return;


}





localStorage.setItem(

"usuarioActual",

JSON.stringify(encontrado)

);






if(encontrado.debeCambiarPassword){


window.location="admin/cambiar-password.html";


return;


}






switch(encontrado.rol){



case "Administrador":


window.location="admin/dashboard.html";


break;



case "Movilidad Urbana":


window.location="movilidad/dashboard.html";


break;



case "Cámaras e Incidencias":


window.location="camaras/dashboard.html";


break;



default:


alert("Rol no configurado");


}



}