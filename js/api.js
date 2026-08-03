const API_URL="https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";

async function api(accion,datos={}){

    const params=new URLSearchParams();

    params.append("accion",accion);

    for(const k in datos){

        params.append(k,datos[k]);

    }

    const r=await fetch(

        API_URL+"?"+params.toString()

    );

    return await r.json();

}

async function apiLogin(usuario,password){

    return await api("login",{

        usuario,

        password

    });

}

async function apiObtenerUsuarios(){

    return await api("obtenerUsuarios");

}

async function apiObtenerElementos(){

    return await api("obtenerElementos");

}
