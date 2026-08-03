/********************************************************
 SGT
 USUARIOS
********************************************************/

function login(datos) {

  const sh = hoja("Usuarios");

  const valores = sh.getDataRange().getValues();

  for (let i = 1; i < valores.length; i++) {

    const usuario = String(valores[i][1]).trim();
    const password = String(valores[i][2]).trim();
    const activo = String(valores[i][5]).trim().toUpperCase();

    if (
      usuario === datos.usuario &&
      password === datos.password &&
      activo === "SI"
    ) {

      return {

        ok: true,

        usuario: {

          id: valores[i][0],
          usuario: valores[i][1],
          nombre: valores[i][3],
          rol: valores[i][4]

        }

      };

    }

  }

  return {

    ok: false,

    mensaje: "Usuario o contraseña incorrectos."

  };

}

/************************************************/

function obtenerUsuarios() {

  const sh = hoja("Usuarios");

  const datos = sh.getDataRange().getValues();

  let lista = [];

  for (let i = 1; i < datos.length; i++) {

    lista.push({

      id: datos[i][0],
      usuario: datos[i][1],
      nombre: datos[i][3],
      rol: datos[i][4],
      activo: datos[i][5]

    });

  }

  return {

    ok: true,

    datos: lista

  };

}

/************************************************/

function guardarUsuario(d) {

  const sh = hoja("Usuarios");

  sh.appendRow([

    generarID("US"),

    d.usuario,

    d.password,

    d.nombre,

    d.rol,

    "SI",

    ahora()

  ]);

  return {

    ok: true

  };

}

/************************************************/

function eliminarUsuario(d) {

  const sh = hoja("Usuarios");

  const fila = buscarFila(sh, d.id);

  if (fila > 0) {

    sh.deleteRow(fila);

  }

  return {

    ok: true

  };

}