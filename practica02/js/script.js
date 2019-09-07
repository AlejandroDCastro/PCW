
// Variables globales
var url_= "";
var fotos_; // fotos de la página index acual
var info_foto_;
var total_fotos_ = 0, total_paginas_index_ = 0;
var pagina_actual_ = 0;
var usuario_;
var autorizacion_usuario_; // login y token de usuario



// Función que arranca el funcionamiento de la web
function iniciar() {

	// Primero comprobamos si el navegador proporciona soporte para Web Storage
	if (compatible_api_storage()) {

		// Si no realizamos esto dentro de una función el DOM no podrá leer ningún objeto del documento, es decir, que intentará buscar elementos sin que la página haya renderizado

		// Seleccionamos los elementos del menú que guardan el texto
		var elementos_ = document.querySelectorAll("nav>ul>li>a>span");

		// Restringimos las opciones del menú a las que no se puede acceder
		var url_ = location.href,
			ultimoSlash_ = url_.lastIndexOf("/"),
			resultado_ = url_.substring(ultimoSlash_+1);

		// Comprobamos si el usuario está logueado...
		if (sessionStorage.getItem("login")) {
			console.log("El usuario está logueado...");

			// Si intenta entrar a la login o registro al registrarse o inciar sesion...
			if (resultado_ == "login.html"  ||  resultado_ == "registro.html") {
				location.href = "index.html";
			}

			// Ocultamos las opciones que no se pueden mostrar...
			for (let i=0; i<elementos_.length; i++) {
				if (elementos_[i].innerHTML == "Login"  ||  elementos_[i].innerHTML == "Registro") {
					elementos_[i].parentNode.parentNode.style.display = "none";
				}
			}
		} else {

			// Si intenta entrar a favoritas o nueva foto al hacer logout...
			if (resultado_ == "favoritas.html"  ||  resultado_ == "nueva.html") {
				document.setTimeout("redireccionaIndex()", 2000);
			}

			for (let i=0; i<elementos_.length; i++) {
				if (elementos_[i].innerHTML == "Nueva foto"  ||  elementos_[i].innerHTML == "Favoritas"  ||  elementos_[i].innerHTML == "Logout") {
					elementos_[i].parentNode.parentNode.style.display = "none";
				}
			}
		}

	}
}



// Función que comprueba si el navegador es compatible con el local storage
function compatible_api_storage() {
	if (typeof(Storage) !== "undefined") {
		console.log("Navegador compatible con WebStorage...");
		return true;
	} else {

		// mostramos un warning por consola
		console.warn("Navegador no compatible con WebStorage...");

		// mostramos un mensaje de alerta
		alert("ACTUALICE SU NAVEGADOR");
		return false;
	}
}



// Función para hacer logout y limpiar información de sessionStorage
function logout() {
	if (compatible_api_storage()) {
		console.log("Cerramos la sesión del Usuario...");

		// Eliminamos la información del sessiontorage...
		sessionStorage.clear();

		// Redirigimos la ubicación actual a la página principal despues de dos segundos...
		setTimeout("redireccionaIndex()",2*1000);
	}
}



// Función que redirecciona a la página index
function redireccionaIndex() {
	location.href = "index.html";
}



// Función para realizar una búsqueda rápida en la página index
function busquedaRapida() {
	var parametros_ = document.querySelector("#div-busqueda-rapida>input").value;

	// Se realizará la búsqueda en la página buscar...
	location.href = "buscar.html?d=" + parametros_;
}



// Función que carga las fotos mejor valoradas en páginas de seis registros
function peticionFotos(url) {
	url_ = url;

	// Abrimos una conexión para pedir datos al servidor web...
	var xhr = new XMLHttpRequest();

	// Función que se ejecuta cuando la petición cambia de estado...
	xhr.onreadystatechange = function() {

		// Cuando la petición termina y la respuesta a la petición está lista...
		if (xhr.readyState == 4  &&  xhr.status == 200) {

			// La respuesta es un string que lo convertimos en un objeto JS...
			fotos_ = JSON.parse(xhr.responseText);
			console.log(fotos_);
			crearFotos();
			modificarBotonera();
		}
	};
	xhr.open("GET", url_, true);
	xhr.send();

	xhr.onerror = function() {
		console.log("Error en la petición...");
		alert("ERROR EN LA PETICIÓN DE LAS FOTOS");
	};
}



// Función que carga las fotos marcadas como favoritas por el usuario
function peticionFotosFav() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4  &&  xhr.status == 200) {
			fotos_ = JSON.parse(xhr.responseText);
			console.log(fotos_);
			crearFotos();
			modificarBotonera();
		}
	};
	xhr.open("GET", './api/usuarios/' + autorizacion_usuario_ + '/favoritas', true);
	xhr.send();

	xhr.onerror = function() {
		console.log("Error en la petición de favoritas...");
		alert("ERROR EN LA PETICIÓN DE LAS FOTOS FAVORITAS");
	};
}



// Función que carga las fotos mejor valoradas en páginas de seis registros
function peticionInicialBuscar() {
	
	// Averiguamos el posible tipo de parámetro que viene en la url...
	var url_ = location.href,
		ultimoSlash_ = url_.lastIndexOf("?"),
		tipo_ = url_.substring(ultimoSlash_+1, ultimoSlash_+2),
		resultado_ = url_.substring(ultimoSlash_+3);
	var hay_parametros_ = true;

	switch (tipo_) {
		case "l":
			document.getElementById("autor").value = resultado_;
			break;
		case "e":
			document.getElementById("etiqueta").value = resultado_;
			break;
		case "d":
			document.getElementById("descripcion").value = corrigeCodificacion(resultado_);
			break;
		default:
			hay_parametros_ = false;
			break;
	}

	// Si la url contiene algún parámetro ejecutamos...
	if (hay_parametros_) {
		peticionFotosBuscar();
	}
}



// Función que corrige los carácteres que no se pueden mostrar con la codificación UTF-8
function corrigeCodificacion(frase) {
	var frase_ = frase;

	while (frase_.search("%") > -1) {
		frase_ = frase_.replace("%20", " ");
		frase_ = frase_.replace("%C3%A1", "á");
		frase_ = frase_.replace("%C3%A9", "é");
		frase_ = frase_.replace("%C3%AD", "í");
		frase_ = frase_.replace("%C3%B3", "ó");
		frase_ = frase_.replace("%C3%BA", "ú");
		frase_ = frase_.replace("%C3%81", "Á");
		frase_ = frase_.replace("%C3%89", "É");
		frase_ = frase_.replace("%C3%8D", "Í");
		frase_ = frase_.replace("%C3%93", "Ó");
		frase_ = frase_.replace("%C3%9A", "Ú");
		frase_ = frase_.replace("%C3%B1", "ñ");
		frase_ = frase_.replace("%C3%91", "Ñ");
	}

	return frase_;
}



// Función que envía la petición las fotos en la página buscar en base a los paramétros de búsqueda señalados
function peticionFotosBuscar() {

	// Se piden fotos si el usuario a insertado algún campo
	if (creaUrlBuscar()) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4  &&  xhr.status == 200) {
				fotos_ = JSON.parse(xhr.responseText);
				console.log(fotos_);
				borrarFotos();
				crearFotos();
				modificarBotonera();
			}
		};
		xhr.open("GET", url_, true);
		xhr.send();

		xhr.onerror = function() {
			console.log("Error en la petición de buscar...");
			alert("ERROR EN LA PETICIÓN EN LA PÁGINA BUSCAR");
		};
	}
}



// Función que crea la petición a servidor api RESTfull en función de los parámetros introducidos
function creaUrlBuscar() {
	url_ = './api/fotos?';
	var titulo_ = "", etiquetas_ = "", login_ = "", descripcion_ = "";
	var radio_button_ = document.querySelectorAll("#filtros-radio>div>div>input");
	var radio_ = '&op=';

	// Primero añadimos los input de texto...
	titulo_ = document.getElementById("titulo").value;
	etiquetas_ = document.getElementById("etiqueta").value;
	login_ = document.getElementById("autor").value;
	descripcion_ = document.getElementById("descripcion").value;
	url_ += (titulo_!="") ? ('t='+titulo_+'&') : "";
	url_ += (etiquetas_!="") ? ('e='+etiquetas_+'&') : "";
	url_ += (login_!="") ? ('l='+login_+'&') : "";
	url_ += (descripcion_!="") ? ('d='+descripcion_) : "";

	// Después los radio button...
	for (let i=0; i<radio_button_.length; i++) {
		if (radio_button_[i].checked) {
			switch (i) {
				case 0:
					radio_ += 'megusta-';
					break;
				case 1:
					radio_ += 'favorita-';
					break;
				case 2:
					radio_ += 'comentarios-';
					break;
				case 3:
					radio_ += 'asc';
					break;
				case 4:
					radio_ += 'desc';
					break;
			}
		}
	}
	url_ += (radio_!='&op=') ? radio_ : "";

	// Y por último la paginación y devolvemos...
	if (url_ != './api/fotos?'  &&  url_ != "") {
		url_ += '&pag=0&lpag=6';
		return true;
	} else {
		return false;
	}
}



// Función que restablece los campos de búsqueda a su valor por defecto
function restablecerCampos() {

	// Para los radiobutton...
	var opciones_ = document.querySelectorAll("#filtros-radio>div>div>input");
	for (let i=0; i<opciones_.length; i++) {
		opciones_[i].checked = false;
	}

	// Para los input de texto
	document.getElementById("titulo").value = "";
	document.getElementById("descripcion").value = "";
	document.getElementById("etiqueta").value = "";
	document.getElementById("autor").value = "";
}



// Función que muestra las fotos soliciatadas al servidor
function crearFotos() {

	// Sección donde incluir las nuevas fotos
	var section_ = document.getElementById("coleccion-fotos");
	for (let i=0; i<fotos_.FILAS.length; i++) {

		// Creamos las variables correspondientes a los atributos...
		let titulo_ = fotos_.FILAS[i].titulo,
			login_ = fotos_.FILAS[i].login,
			etiquetas_ = fotos_.FILAS[i].etiquetas,
			ncomentarios_ = fotos_.FILAS[i].ncomentarios,
			nmegusta_ = fotos_.FILAS[i].nmegusta,
			nfavorita_ = fotos_.FILAS[i].nfavorita,
			foto_ = fotos_.FILAS[i].fichero,
			id_ = fotos_.FILAS[i].id,
			ancho_ = fotos_.FILAS[i].ancho;

		// Creamos las etiquetas para la foto...
		var etiquetas_html_ = "";
		for (let j=0; j<etiquetas_.length; j++) {
			let nombre_ = etiquetas_[j].nombre;
			etiquetas_html_ += `<a href="buscar.html?e=${nombre_}">${nombre_}</a>`;
			if (j < etiquetas_.length-1) {
				etiquetas_html_ += `, `;
			}
		}


		// Reescalamos la foto si es necesario...
		ancho_ = (parseInt(ancho_) > 300) ? 300 : parseInt(ancho_);

		// Creamos la nueva foto...
		var nueva_foto_ = 
			`<article>
				<hgroup>
					<h3>
						<a href="foto.html?${id_}" title="${titulo_}">${titulo_}</a>
					</h3>
					<h4>
						<a href="buscar.html?l=${login_}">By ${login_}</a>
					</h4>
				</hgroup>
				<a href="foto.html?${id_}">
					<img src="fotos/${foto_}" width="${ancho_}" alt="Fotografía no disponible">
				</a>
				<p>
					<i class="fas fa-heart"> ${nmegusta_}</i>
					<i class="fas fa-star"> ${nfavorita_}</i>
					<i class="fas fa-comments"> ${ncomentarios_}</i>
					<i class="fas fa-tags">	${etiquetas_html_}</i>
				</p>
			</article>`;

		// Incluimos la foto en la página
		section_.innerHTML += nueva_foto_;

		// Comprobamos si el usuario logueado le ha dado a mg o fv
		asignarFavMg(id_);

		console.log("Foto " + foto_ + " creada");
	}
}



// Función que remarca el icono de megusta y favoritas de las fotos que el usuario haya asignado
function asignarFavMg(fotoId) {
	if (sessionStorage.getItem("login")) {

		// Hacemos la petición...
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4  &&  xhr.status == 200) {

				info_foto_ = JSON.parse(xhr.responseText);
				console.log(info_foto_);
				console.log("TERMINAR MÉTODO asignarFavMg");

			}
		}
		xhr.open("GET", "./api/fotos/"+fotoId+"/"+autorizacion_usuario_, true);
		xhr.send();
	}
}



// Función que modifica la botonera en función de las fotos existentes en la página
function modificarBotonera() {

	// Averiguamos el total de fotos y la cantidad de paginas que las contienen
	total_fotos_ = fotos_.TOTAL_COINCIDENCIAS;
	total_paginas_ = Math.ceil(total_fotos_/6);
	var pagina_ = (total_paginas_ > 0) ? pagina_actual_+1 : 0;

	// Actualizamos...
	document.getElementById("botonera").innerHTML = `${pagina_}/${total_paginas_}`;
}



// Función para ir a la primera página
function paginaPrimera() {
	if (pagina_actual_ > 0) {
		pagina_actual_ = 0;
		cambioPagina();
	}
}



// Función para ir a la página anterior de fotos
function paginaAnterior() {
	if (pagina_actual_ > 0) {
		pagina_actual_--;
		cambioPagina();
	}
}



// Función para ir a la siguiente página de fotos
function paginaSiguiente() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_++;
		cambioPagina();
	}
}



// Función para ir a la primera página
function paginaUltima() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_ = total_paginas_ - 1;
		cambioPagina();
	}
}



// Funcion para cambiar de página
function cambioPagina() {

	// La nueva url...
	var ultimoSlash_ = url_.indexOf("pag");
	url_ = url_.substring(0, ultimoSlash_+4) + pagina_actual_ + url_.substring(ultimoSlash_+5);

	// Borramos fotos y hacemos petición...
	borrarFotos();
	peticionFotos(url_);
	console.log("Nos movemos a la página " + (pagina_actual_
		+1) + "...");
}



// Función que borra las fotos que se encuentren en la página actual
function borrarFotos() {
	var section_ = document.querySelector("section#coleccion-fotos");
	var num_fotos_ = document.querySelectorAll("article").length;

	for (let i=0; i<num_fotos_; i++) {
		section_.removeChild(section_.lastChild);
	}
}



// Función que permite hacer el login y registro de usuario
function peticionFormulario(url) {
	var xhr = new XMLHttpRequest(),
		fd = new FormData(),
		inputs_ = document.querySelectorAll("form>div>input");

	// Recogemos cada uno de los valores de los inputs...
	for (let i=0; i<inputs_.length-1; i++){
		fd.append(inputs_[i].id, inputs_[i].value);
	}

	xhr.open("POST", url, true);
	xhr.onload = function() {
		usuario_ = JSON.parse(xhr.responseText);
		console.log(usuario_);
		if (url == "./api/sesiones/") {
			loginUsuario();
		} else {
			registroUsuario();
		}
	};
	xhr.send(fd);

	// Para evitar que la página no se recargue si el login falla
	return false;
}



// Función que permite hacer el login de usuario
function loginUsuario() {
	if (usuario_.RESULTADO == "OK") {
		console.log("Se ha hecho login de usuario...");

		// Guardamos toda la información que nos devuelve el servidor...
		sessionStorage.setItem("email", usuario_.email);
		sessionStorage.setItem("login", usuario_.login);
		sessionStorage.setItem("nombre", usuario_.nombre);
		sessionStorage.setItem("token", usuario_.token);

		// Creamos la clave de autorizacion del usuario...
		autorizacion_usuario_ = usuario_.login + ":" + usuario_.token;

		redireccionaIndex();
	} else {
		console.log("No se ha hecho login de usuario...");

		// Mostramos mensaje modal...
		mostrarMensajeLogin(true);
	}
}



// Función que permite hacer el registro de usuario
function registroUsuario() {
	if (usuario_.RESULTADO == "OK") {
		console.log("Se ha realizado el registro de usuario...");

		// Limpiamos formulario...
		limpiarFormulario();

		// Mostramos mensaje modal...
		mostrarMensajeRegistro(true);
	} else {
		console.log("No se ha realizado el registro de usuario...");
	}
}



// Función que limpia un formulario
function limpiarFormulario() {
	var inputs_ = document.querySelectorAll("form>div>input");

	for (let i=0; i<inputs_.length-1; i++) {
		inputs_[i].value = "";
	}
}



// Función que muestra el mensaje modal que regristro correcto
function mostrarMensajeRegistro(aparece) {
	if (aparece) {
		document.querySelector("body>div+div").style.display = "inline-block";
	} else {
		document.querySelector("body>div+div").style.display = "none";

		// Redireccionamos a login
		location.href = "login.html";
	}
}



// Función que mostrar y quitar el mensaje modal al hacer el login
function mostrarMensajeLogin(aparece) {
	if (aparece) {
		document.querySelector("body>div+div").style.display = "inline-block";
	} else {
		document.querySelector("body>div+div").style.display = "none";

		// Devolvemos el foco al campo login...
		document.getElementById("login").focus();
	}
}



// Función que comprueba si el login introducido en el registro está disponible
function disponibilidadLogin() {
	var xhr = new XMLHttpRequest(),
		login_ = document.getElementById("login").value,
		mensaje_ = document.getElementById("mensaje-info");

	if (login_ != "") {
		xhr.open("GET", "./api/usuarios/" + login_, true);
		xhr.onload = function() {
			var respuesta_ = JSON.parse(xhr.responseText);
			mensaje_.style.display = "inline-block";
			if (respuesta_.DISPONIBLE) {
				mensaje_.innerHTML = "Nombre de usuario disponible";
				mensaje_.style.color = "#4DF24F";
			} else {
				mensaje_.innerHTML = "Nombre de usuario no disponible";
				mensaje_.style.color = "#FF0808";
			}
		}
		xhr.send();
	}
}



// Función que comprueba si la contraseña repetida coincide con la anterior introducida
function peticionRegistro() {
	var pwd1_ = document.getElementById("pwd").value,
		pwd2_ = document.getElementById("pwd2").value,
		mensaje_ = document.getElementById("mensaje-pwd");

	if (pwd1_ == pwd2_) {
		peticionFormulario("./api/usuarios/");
	} else {
		mensaje_.style.display = "inline-block";
		mensaje_.style.color = "#FF0808";
	}

	return false;
}