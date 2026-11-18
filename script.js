/* =====================================================
   ExceptionLog - JavaScript del sitio
   Un solo archivo para las 7 páginas. Cada función solo
   se ejecuta en la página que le corresponde (al final
   del archivo se decide cuál).

   Los datos (usuarios, sesión, hilos nuevos) se guardan
   en localStorage, que es la memoria del navegador.
   ===================================================== */


/* =====================================================
   1. FUNCIONES GENERALES
   ===================================================== */

// Devuelve el nombre del archivo de la página actual (index.html, foro.html...)
function nombrePagina() {
  var ruta = window.location.pathname;
  var nombre = ruta.substring(ruta.lastIndexOf("/") + 1);
  if (nombre === "") {
    nombre = "index.html";
  }
  return nombre;
}

// Lee un dato de localStorage. Si no existe, devuelve el valor por defecto.
function leerDatos(clave, valorPorDefecto) {
  try {
    var texto = localStorage.getItem(clave);
    if (texto === null) {
      return valorPorDefecto;
    }
    return JSON.parse(texto);
  } catch (error) {
    return valorPorDefecto;
  }
}

// Guarda un dato en localStorage (convertido a texto JSON)
function guardarDatos(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    // si el navegador no deja guardar, la página sigue funcionando
  }
}

function borrarDatos(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
  }
}

// Revisa que un correo tenga la forma texto@dominio.extension
function correoValido(texto) {
  var patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(texto);
}

// Pone un cero delante si el número tiene un solo dígito (5 -> "05")
function dosDigitos(numero) {
  return ("0" + numero).slice(-2);
}

/* ---------- Mensajes dentro de los formularios ---------- */

// Crea el párrafo de mensajes justo encima del botón del formulario
function crearMensaje(formulario) {
  var parrafo = document.createElement("p");
  parrafo.className = "mensaje";
  parrafo.setAttribute("role", "alert");
  formulario.insertBefore(parrafo, formulario.lastElementChild);
  return parrafo;
}

// tipo puede ser: "error", "exito" o "info" (cada uno tiene su color en styles.css)
function mostrarMensaje(parrafo, texto, tipo) {
  parrafo.textContent = texto;
  parrafo.className = "mensaje " + tipo;
}

function ocultarMensaje(parrafo) {
  parrafo.textContent = "";
  parrafo.className = "mensaje";
}


/* =====================================================
   2. MENÚ Y SESIÓN (todas las páginas con menú)
   - Marca la página actual en el menú.
   - Si hay una sesión iniciada, cambia "Iniciar sesión"
     por "Cerrar sesión" y "Registrarse" por el usuario.
   ===================================================== */

function configurarMenu() {
  var enlaces = document.querySelectorAll("header nav a");
  var sesion = leerDatos("sesion", null);
  var pagina = nombrePagina();

  for (var i = 0; i < enlaces.length; i++) {
    var destino = enlaces[i].getAttribute("href");

    if (destino === pagina) {
      enlaces[i].className = "activo";
    }

    if (sesion !== null) {
      if (destino === "iniciar-sesion.html") {
        enlaces[i].textContent = "Cerrar sesión";
        enlaces[i].setAttribute("href", "#");
        enlaces[i].addEventListener("click", cerrarSesion);
      } else if (destino === "registro.html") {
        enlaces[i].textContent = "👤 " + sesion.usuario;
        enlaces[i].setAttribute("href", "perfil.html");
      }
    }
  }
}

function cerrarSesion(evento) {
  evento.preventDefault();
  borrarDatos("sesion");
  window.location.href = "index.html";
}


/* =====================================================
   3. INICIO (index.html)
   ===================================================== */

// Si hay sesión, la bienvenida muestra el usuario en lugar de los botones
function mostrarSaludo() {
  var sesion = leerDatos("sesion", null);
  var parrafo = document.querySelector("main > section:first-of-type p:last-child");
  if (sesion === null || parrafo === null) {
    return;
  }

  parrafo.textContent = "Sesión iniciada como " + sesion.usuario + " | ";
  var enlace = document.createElement("a");
  enlace.setAttribute("href", "perfil.html");
  enlace.textContent = "Ir a mi perfil";
  parrafo.appendChild(enlace);
}

// Las cifras de "Estadísticas" suben desde 0 hasta su valor
function animarContadores() {
  var titulos = document.querySelectorAll("section h2");

  for (var i = 0; i < titulos.length; i++) {
    if (titulos[i].textContent.trim() === "Estadísticas") {
      var cifras = titulos[i].parentElement.querySelectorAll("td b");
      for (var j = 0; j < cifras.length; j++) {
        animarNumero(cifras[j]);
      }
    }
  }
}

function animarNumero(elemento) {
  var textoFinal = elemento.textContent;               // ejemplo: "1,438" o "4.2k"
  var tieneK = textoFinal.indexOf("k") !== -1;
  var valorFinal = parseFloat(textoFinal.replace(/,/g, ""));
  var decimales = 0;
  if (textoFinal.indexOf(".") !== -1) {
    decimales = textoFinal.split(".")[1].replace("k", "").length;
  }

  var pasos = 40;
  var paso = 0;
  var reloj = setInterval(function () {
    paso++;
    var valor = valorFinal * paso / pasos;
    var texto = valor.toLocaleString("en-US", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
    if (tieneK) {
      texto = texto + "k";
    }
    elemento.textContent = texto;

    if (paso >= pasos) {
      clearInterval(reloj);
      elemento.textContent = textoFinal;               // deja el valor exacto
    }
  }, 30);
}

// Un tip distinto cada día del año
function mostrarTipDelDia() {
  var tips = [
    "Usa <code>console.trace()</code> para ver la pila de llamadas exacta en el momento del error.",
    "Copia el mensaje de error completo y lee primero la primera línea: casi siempre dice qué falló.",
    "Reduce el problema: comenta código hasta que el error desaparezca y encontrarás la línea culpable.",
    "En JavaScript, <code>console.log(typeof variable)</code> te ayuda a descubrir un <code>TypeError</code> por tipos inesperados.",
    "Un <code>NullPointerException</code> casi siempre significa que olvidaste inicializar un objeto antes de usarlo.",
    "Para un <code>RecursionError</code>, revisa que tu función tenga un caso base que de verdad se alcance.",
    "En Java, la causa original del error suele estar en la línea <code>Caused by</code> al final de la traza.",
    "Si el error aparece solo en producción, compara variables de entorno y versiones con las de tu entorno local."
  ];

  var hoy = new Date();
  var inicioAnio = new Date(hoy.getFullYear(), 0, 0);
  var diaDelAnio = Math.floor((hoy - inicioAnio) / 86400000);
  var indice = diaDelAnio % tips.length;

  var titulos = document.querySelectorAll("aside h2");
  for (var i = 0; i < titulos.length; i++) {
    if (titulos[i].textContent.indexOf("TIP DEL") !== -1) {
      titulos[i].nextElementSibling.innerHTML = tips[indice];
    }
  }
}

function configurarInicio() {
  mostrarSaludo();
  animarContadores();
  mostrarTipDelDia();
}


/* =====================================================
   4. CATEGORÍAS (categorias.html)
   - El buscador filtra las tarjetas mientras escribes.
   - Al hacer clic en una tarjeta, se abre errores.html
     ya filtrado por esa categoría.
   ===================================================== */

function configurarCategorias() {
  var buscador = document.querySelector("input[type='text']");
  var tabla = document.querySelector("main table");
  var celdas = tabla.querySelectorAll("td");

  // 1) Guardar el contenido de cada tarjeta leyéndolo del HTML original
  var tarjetas = [];
  for (var i = 0; i < celdas.length; i++) {
    tarjetas.push({
      html: celdas[i].innerHTML,
      texto: celdas[i].textContent.toLowerCase()
    });
  }

  var sinResultados = document.createElement("p");
  sinResultados.className = "sin-resultados";
  sinResultados.textContent = "No se encontró ninguna categoría con ese texto.";
  sinResultados.style.display = "none";
  tabla.parentElement.appendChild(sinResultados);

  // 2) Dibujar las tarjetas que coinciden, de 4 en 4 (como en el HTML original)
  function dibujar(lista) {
    tabla.innerHTML = "";
    for (var i = 0; i < lista.length; i += 4) {
      var fila = tabla.insertRow();
      for (var j = i; j < i + 4; j++) {
        var celda = fila.insertCell();
        if (j < lista.length) {
          celda.innerHTML = lista[j].html;
          celda.setAttribute("title", "Ver los errores de esta categoría");
        } else {
          celda.style.visibility = "hidden";         // relleno para mantener las 4 columnas
        }
      }
    }
  }

  // 3) Filtrar mientras se escribe
  buscador.addEventListener("input", function () {
    var texto = buscador.value.toLowerCase().trim();
    var coinciden = [];

    for (var i = 0; i < tarjetas.length; i++) {
      if (tarjetas[i].texto.indexOf(texto) !== -1) {
        coinciden.push(tarjetas[i]);
      }
    }
    dibujar(coinciden);

    if (coinciden.length === 0) {
      sinResultados.style.display = "block";
    } else {
      sinResultados.style.display = "none";
    }
  });

  // 4) Clic en una tarjeta: abrir errores.html filtrado por esa categoría
  tabla.addEventListener("click", function (evento) {
    var celda = evento.target.closest("td");
    if (celda === null) {
      return;
    }
    var titulo = celda.querySelector("h3");
    if (titulo === null) {
      return;
    }
    window.location.href = "errores.html?categoria=" + encodeURIComponent(titulo.textContent.trim());
  });

  // las tarjetas originales también avisan que se pueden pulsar
  for (var k = 0; k < celdas.length; k++) {
    celdas[k].setAttribute("title", "Ver los errores de esta categoría");
  }
}


/* =====================================================
   5. ERRORES (errores.html)
   Los filtros de la izquierda (categoría, lenguaje,
   severidad y estado) se combinan entre sí y la lista
   de la derecha se vuelve a dibujar con lo que coincide.
   ===================================================== */

function configurarErrores() {
  var tablaTarjetas = document.querySelector("main table table");
  var celdas = tablaTarjetas.querySelectorAll("td");
  var textoCuenta = document.querySelector("main > section:first-of-type p");
  var listasFiltro = document.querySelectorAll("aside ul");

  // 1) Guardar los datos de cada tarjeta leyéndolos del HTML original
  var errores = [];
  for (var i = 0; i < celdas.length; i++) {
    var partes = celdas[i].querySelector("p").textContent.split("|");
    errores.push({
      html: celdas[i].innerHTML,
      severidad: partes[0].trim().toLowerCase(),   // crítico / error / advertencia
      lenguaje: partes[1].trim().toLowerCase(),
      estado: partes[2].trim().toUpperCase(),      // ✓ RESUELTO / ABIERTO
      categoria: celdas[i].querySelector("small").textContent.trim().toLowerCase()
    });
  }

  // 2) Filtro elegido en cada lista (el orden es el del HTML)
  var claves = ["categoria", "lenguaje", "severidad", "estado"];
  var seleccion = {
    categoria: "todos",
    lenguaje: "todos",
    severidad: "todos",
    estado: "todos"
  };

  // equivalencias entre el panel de filtros y el texto de las tarjetas
  var equivalenciaSeveridad = {
    "critical": "crítico",
    "error": "error",
    "warning": "advertencia"
  };

  function coincide(error) {
    if (seleccion.categoria !== "todos" && error.categoria !== seleccion.categoria) {
      return false;
    }
    if (seleccion.lenguaje !== "todos" && error.lenguaje !== seleccion.lenguaje) {
      return false;
    }
    if (seleccion.severidad !== "todos" && error.severidad !== equivalenciaSeveridad[seleccion.severidad]) {
      return false;
    }
    if (seleccion.estado === "resueltos" && error.estado.indexOf("RESUELTO") === -1) {
      return false;
    }
    if (seleccion.estado === "sin resolver" && error.estado.indexOf("ABIERTO") === -1) {
      return false;
    }
    return true;
  }

  // 3) Dibujar las tarjetas que coinciden, de dos en dos
  function dibujar(lista) {
    tablaTarjetas.innerHTML = "";

    if (lista.length === 0) {
      var filaVacia = tablaTarjetas.insertRow();
      var celdaVacia = filaVacia.insertCell();
      celdaVacia.colSpan = 2;
      celdaVacia.textContent = "Ningún error coincide con los filtros seleccionados.";
      return;
    }

    for (var i = 0; i < lista.length; i += 2) {
      var fila = tablaTarjetas.insertRow();
      for (var j = i; j < i + 2; j++) {
        var celda = fila.insertCell();
        if (j < lista.length) {
          celda.setAttribute("valign", "top");
          celda.innerHTML = lista[j].html;
        } else {
          celda.style.visibility = "hidden";         // relleno para mantener las 2 columnas
        }
      }
    }
  }

  function aplicarFiltros() {
    var resultado = [];
    for (var i = 0; i < errores.length; i++) {
      if (coincide(errores[i])) {
        resultado.push(errores[i]);
      }
    }
    dibujar(resultado);

    if (resultado.length === 1) {
      textoCuenta.textContent = "1 experiencia documentada";
    } else {
      textoCuenta.textContent = resultado.length + " experiencias documentadas";
    }
  }

  // 4) Hacer clic en un filtro
  function elegirFiltro(elemento, numeroLista) {
    var elementos = listasFiltro[numeroLista].querySelectorAll("li");
    for (var i = 0; i < elementos.length; i++) {
      elementos[i].className = "";
    }
    elemento.className = "seleccionado";
    seleccion[claves[numeroLista]] = elemento.textContent.trim().toLowerCase();
    aplicarFiltros();
  }

  function activarLista(numeroLista) {
    var elementos = listasFiltro[numeroLista].querySelectorAll("li");
    for (var i = 0; i < elementos.length; i++) {
      elementos[i].addEventListener("click", function () {
        elegirFiltro(this, numeroLista);
      });
    }
  }

  for (var k = 0; k < listasFiltro.length; k++) {
    activarLista(k);
    listasFiltro[k].querySelector("li").className = "seleccionado";   // "Todos"
  }

    // Item "Examen" del panel: no filtra nada, solo muestra el mensaje
  var itemExamen = document.getElementById("item-examen");
  itemExamen.addEventListener("click", function () {
    alert("Profesora saque 100");
  });

  // 5) Si se llegó desde Categorías (errores.html?categoria=TypeError), filtrar por esa
  var categoriaUrl = new URLSearchParams(window.location.search).get("categoria");
  if (categoriaUrl !== null) {
    var itemsCategoria = listasFiltro[0].querySelectorAll("li");
    var elegido = null;
    for (var m = 0; m < itemsCategoria.length; m++) {
      if (itemsCategoria[m].textContent.trim().toLowerCase() === categoriaUrl.toLowerCase()) {
        elegido = itemsCategoria[m];
      }
    }
    if (elegido === null) {
      // categoría que no está en el panel: se agrega para que se vea seleccionada
      elegido = document.createElement("li");
      elegido.textContent = categoriaUrl;
      listasFiltro[0].appendChild(elegido);
      elegido.addEventListener("click", function () {
        elegirFiltro(elegido, 0);
      });
    }
    elegirFiltro(elegido, 0);
  }
}


/* =====================================================
   6. FORO (foro.html)
   - Los botones de lenguaje filtran los hilos.
   - "+ Crear hilo" agrega un hilo nuevo (se guarda en
     el navegador y sigue ahí al recargar la página).
   ===================================================== */

function configurarForo() {
  var tabla = document.querySelector("main table");
  var botonesFiltro = document.querySelectorAll("main > section:nth-of-type(2) button");
  var botonCrear = document.querySelector("main > section:first-of-type button");
  var textoCuenta = document.querySelector("main > section:first-of-type p");
  var filtroActual = "todos";

  botonesFiltro[0].className = "activo";

  // Muestra solo las filas del lenguaje elegido (la fila 0 es el encabezado)
  function aplicarFiltro() {
    var visibles = 0;
    for (var i = 1; i < tabla.rows.length; i++) {
      var lenguaje = tabla.rows[i].cells[1].textContent.trim().toLowerCase();
      if (filtroActual === "todos" || lenguaje === filtroActual) {
        tabla.rows[i].style.display = "";
        visibles++;
      } else {
        tabla.rows[i].style.display = "none";
      }
    }

    if (visibles === 1) {
      textoCuenta.textContent = "1 hilo de discusión activo";
    } else {
      textoCuenta.textContent = visibles + " hilos de discusión activos";
    }
  }

  // Inserta una fila nueva justo debajo del encabezado
  function agregarFila(hilo) {
    var fila = tabla.insertRow(1);

    var celdaHilo = fila.insertCell();
    var titulo = document.createElement("b");
    titulo.textContent = hilo.titulo;
    var salto = document.createElement("br");
    var detalle = document.createElement("small");
    detalle.textContent = "NUEVO HILO · " + hilo.hora;
    celdaHilo.appendChild(titulo);
    celdaHilo.appendChild(salto);
    celdaHilo.appendChild(detalle);

    fila.insertCell().textContent = hilo.lenguaje.toUpperCase();
    fila.insertCell().textContent = hilo.autor;

    var celdaRespuestas = fila.insertCell();
    celdaRespuestas.setAttribute("align", "center");
    var cero = document.createElement("b");
    cero.textContent = "0";
    celdaRespuestas.appendChild(cero);

    fila.insertCell().textContent = "ABIERTO";
  }

  // Hilos que el usuario creó en visitas anteriores
  var hilosGuardados = leerDatos("hilosNuevos", []);
  for (var i = 0; i < hilosGuardados.length; i++) {
    agregarFila(hilosGuardados[i]);
  }

  for (var j = 0; j < botonesFiltro.length; j++) {
    botonesFiltro[j].addEventListener("click", function () {
      for (var k = 0; k < botonesFiltro.length; k++) {
        botonesFiltro[k].className = "";
      }
      this.className = "activo";
      filtroActual = this.textContent.trim().toLowerCase();
      aplicarFiltro();
    });
  }

  botonCrear.addEventListener("click", function () {
    var titulo = prompt("Título del hilo:");
    if (titulo === null) {
      return;
    }
    titulo = titulo.trim();
    if (titulo.length < 5) {
      alert("El título debe tener al menos 5 caracteres.");
      return;
    }

    var lenguajes = ["JavaScript", "TypeScript", "Python", "Java", "Node.js", "C++", "SQL"];
    var respuesta = prompt("Lenguaje (" + lenguajes.join(", ") + "):");
    if (respuesta === null) {
      return;
    }

    var lenguaje = "";
    for (var n = 0; n < lenguajes.length; n++) {
      if (lenguajes[n].toLowerCase() === respuesta.trim().toLowerCase()) {
        lenguaje = lenguajes[n];
      }
    }
    if (lenguaje === "") {
      alert("Escribe uno de los lenguajes de la lista.");
      return;
    }

    var sesion = leerDatos("sesion", null);
    var autor = "@invitado";
    if (sesion !== null) {
      autor = sesion.usuario;
    }

    var ahora = new Date();
    var hilo = {
      titulo: titulo,
      lenguaje: lenguaje,
      autor: autor,
      hora: "Hoy, " + dosDigitos(ahora.getHours()) + ":" + dosDigitos(ahora.getMinutes())
    };

    hilosGuardados.push(hilo);
    guardarDatos("hilosNuevos", hilosGuardados);
    agregarFila(hilo);
    aplicarFiltro();
  });

  aplicarFiltro();
}


/* =====================================================
   7. PERFIL (perfil.html)
   - Las pestañas muestran una sola sección a la vez.
   - "Editar" cambia la biografía (queda guardada).
   ===================================================== */

function configurarPerfil() {
  var pestanas = document.querySelectorAll("td > nav a");
  var secciones = [];
  for (var i = 0; i < pestanas.length; i++) {
    var id = pestanas[i].getAttribute("href").substring(1);
    secciones.push(document.getElementById(id));
  }

  function mostrarSeccion(numero) {
    for (var i = 0; i < secciones.length; i++) {
      if (i === numero) {
        secciones[i].style.display = "";
        pestanas[i].className = "activo";
      } else {
        secciones[i].style.display = "none";
        pestanas[i].className = "";
      }
    }
  }

  for (var j = 0; j < pestanas.length; j++) {
    pestanas[j].addEventListener("click", function (evento) {
      evento.preventDefault();
      for (var k = 0; k < pestanas.length; k++) {
        if (pestanas[k] === this) {
          mostrarSeccion(k);
        }
      }
    });
  }

  // si la dirección trae #hilos-participados, se abre esa pestaña
  var inicial = 0;
  for (var m = 0; m < pestanas.length; m++) {
    if (pestanas[m].getAttribute("href") === window.location.hash) {
      inicial = m;
    }
  }
  mostrarSeccion(inicial);

  // --- Biografía editable ---
  var botonEditar = document.querySelector("aside button");
  var titulos = document.querySelectorAll("aside h3");
  var parrafoBiografia = null;
  for (var n = 0; n < titulos.length; n++) {
    if (titulos[n].textContent.indexOf("BIOGRAF") !== -1) {
      parrafoBiografia = titulos[n].nextElementSibling;
    }
  }

  var biografiaGuardada = leerDatos("biografia", null);
  if (biografiaGuardada !== null) {
    parrafoBiografia.textContent = biografiaGuardada;
  }

  botonEditar.addEventListener("click", function () {
    var nueva = prompt("Escribe tu nueva biografía:", parrafoBiografia.textContent);
    if (nueva === null) {
      return;
    }
    nueva = nueva.trim();
    if (nueva === "") {
      alert("La biografía no puede quedar vacía.");
      return;
    }
    parrafoBiografia.textContent = nueva;
    guardarDatos("biografia", nueva);
  });
}


/* =====================================================
   8. INICIAR SESIÓN (iniciar-sesion.html)
   Busca el correo entre los usuarios que se registraron
   en registro.html y compara la contraseña.
   ===================================================== */

function configurarInicioSesion() {
  var formulario = document.querySelector("form");
  var campoCorreo = document.getElementById("correo");
  var campoClave = document.getElementById("clave");
  var mensaje = crearMensaje(formulario);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var correo = campoCorreo.value.trim().toLowerCase();
    var clave = campoClave.value;

    if (!correoValido(correo)) {
      mostrarMensaje(mensaje, "Escribe un correo válido, por ejemplo ana@empresa.com.", "error");
      campoCorreo.focus();
      return;
    }
    if (clave === "") {
      mostrarMensaje(mensaje, "Escribe tu contraseña.", "error");
      campoClave.focus();
      return;
    }

    var usuarios = leerDatos("usuarios", []);
    var encontrado = null;
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].correo === correo) {
        encontrado = usuarios[i];
      }
    }

    if (encontrado === null) {
      mostrarMensaje(mensaje, "No existe una cuenta con ese correo. Primero debes registrarte.", "error");
      return;
    }
    if (encontrado.clave !== clave) {
      mostrarMensaje(mensaje, "La contraseña es incorrecta.", "error");
      campoClave.focus();
      return;
    }

    guardarDatos("sesion", {
      nombre: encontrado.nombre,
      usuario: encontrado.usuario,
      correo: encontrado.correo
    });
    mostrarMensaje(mensaje, "Sesión iniciada. Bienvenido, " + encontrado.nombre + ".", "exito");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1200);
  });

  // "¿Olvidaste tu contraseña?" (solo demostración)
  var enlaceOlvido = formulario.querySelector("a");
  enlaceOlvido.addEventListener("click", function (evento) {
    evento.preventDefault();
    var correo = campoCorreo.value.trim();
    if (!correoValido(correo)) {
      mostrarMensaje(mensaje, "Escribe primero tu correo y vuelve a presionar el enlace.", "info");
      campoCorreo.focus();
      return;
    }
    mostrarMensaje(mensaje, "Si " + correo + " tiene una cuenta, se enviaría un enlace de recuperación (función de demostración).", "info");
  });

  // Botones Google y GitHub (aún no conectados)
  var botonesExternos = document.querySelectorAll("button[type='button']");
  for (var j = 0; j < botonesExternos.length; j++) {
    botonesExternos[j].addEventListener("click", function () {
      mostrarMensaje(mensaje, "El acceso con " + this.textContent.trim() + " aún no está disponible en esta versión.", "info");
    });
  }

  // al escribir de nuevo, el mensaje anterior se quita
  campoCorreo.addEventListener("input", function () { ocultarMensaje(mensaje); });
  campoClave.addEventListener("input", function () { ocultarMensaje(mensaje); });
}


/* =====================================================
   9. REGISTRO (registro.html)
   Valida cada campo y guarda el usuario en localStorage.
   Nota: guardar la contraseña sin cifrar solo se hace
   aquí por ser un ejercicio de clase. En una aplicación
   real la contraseña nunca se guarda así.
   ===================================================== */

function configurarRegistro() {
  var formulario = document.querySelector("form");
  var campoNombre = document.getElementById("nombre");
  var campoUsuario = document.getElementById("usuario");
  var campoCorreo = document.getElementById("correo");
  var campoRol = document.getElementById("rol");
  var campoClave = document.getElementById("clave");
  var campoConfirmar = document.getElementById("confirmar");
  var mensaje = crearMensaje(formulario);

  // Muestra un error y deja el cursor en el campo que hay que corregir
  function error(texto, campo) {
    mostrarMensaje(mensaje, texto, "error");
    campo.focus();
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var nombre = campoNombre.value.trim();
    var usuario = campoUsuario.value.trim();
    var correo = campoCorreo.value.trim().toLowerCase();
    var rol = campoRol.value;
    var clave = campoClave.value;
    var confirmar = campoConfirmar.value;

    if (usuario.charAt(0) === "@") {
      usuario = usuario.substring(1);
    }

    if (nombre.length < 3) {
      error("Escribe tu nombre completo (mínimo 3 letras).", campoNombre);
      return;
    }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(usuario)) {
      error("El usuario debe tener entre 3 y 20 caracteres: letras, números o guion bajo.", campoUsuario);
      return;
    }
    if (!correoValido(correo)) {
      error("Escribe un correo válido, por ejemplo ana@empresa.com.", campoCorreo);
      return;
    }
    if (rol === "") {
      error("Selecciona tu rol profesional.", campoRol);
      return;
    }
    if (clave.length < 6) {
      error("La contraseña debe tener al menos 6 caracteres.", campoClave);
      return;
    }
    if (clave !== confirmar) {
      error("Las contraseñas no coinciden.", campoConfirmar);
      return;
    }

    // que no exista otra cuenta con el mismo correo o usuario
    var usuarios = leerDatos("usuarios", []);
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].correo === correo) {
        error("Ya existe una cuenta con ese correo.", campoCorreo);
        return;
      }
      if (usuarios[i].usuario.toLowerCase() === "@" + usuario.toLowerCase()) {
        error("Ese nombre de usuario ya está en uso.", campoUsuario);
        return;
      }
    }

    var nuevo = {
      nombre: nombre,
      usuario: "@" + usuario,
      correo: correo,
      rol: rol,
      clave: clave
    };
    usuarios.push(nuevo);
    guardarDatos("usuarios", usuarios);
    guardarDatos("sesion", {
      nombre: nuevo.nombre,
      usuario: nuevo.usuario,
      correo: nuevo.correo
    });

    mostrarMensaje(mensaje, "Cuenta creada. Sesión iniciada como " + nuevo.usuario + ".", "exito");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1200);
  });

  // al escribir de nuevo, el mensaje anterior se quita
  var campos = [campoNombre, campoUsuario, campoCorreo, campoRol, campoClave, campoConfirmar];
  for (var j = 0; j < campos.length; j++) {
    campos[j].addEventListener("input", function () { ocultarMensaje(mensaje); });
  }
}


/* =====================================================
   10. ARRANQUE: decide qué funciones usar según la página
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var pagina = nombrePagina();

  configurarMenu();

  if (pagina === "index.html") {
    configurarInicio();
  } else if (pagina === "categorias.html") {
    configurarCategorias();
  } else if (pagina === "errores.html") {
    configurarErrores();
  } else if (pagina === "foro.html") {
    configurarForo();
  } else if (pagina === "perfil.html") {
    configurarPerfil();
  } else if (pagina === "iniciar-sesion.html") {
    configurarInicioSesion();
  } else if (pagina === "registro.html") {
    configurarRegistro();
  }
});
