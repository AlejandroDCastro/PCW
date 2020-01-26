
// Variables globales (cada vez que se cargue una página, éstos serán los valores por defecto)
var url_= "";
var fotos_; // fotos de la página index acual
var info_foto_;
var nueva_foto_;
var total_fotos_ = 0, total_paginas_index_ = 0;
var pagina_actual_ = 0;
var usuario_;
var tags_;
var input_tags_;
var comentarios_;
var favorita_ = -1, megusta_ = -1;



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
				redireccionaIndex();
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
			crearFotosFav();
			modificarBotoneraFav();
		}
	};
	xhr.open("GET", './api/usuarios/' + sessionStorage.getItem("login") + '/favoritas', true);
	xhr.setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
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

	// Array de IDs de las fotos para posterior uso
	var array_fotos_ = new Array(fotos_.FILAS.length);

	// Sección donde incluir las nuevas fotos
	var section_ = document.getElementById("coleccion-fotos");
	for (let i=0; i<fotos_.FILAS.length; i++) {

		// Creamos las variables correspondientes a los atributos...
		var titulo_ = fotos_.FILAS[i].titulo,
			login_ = fotos_.FILAS[i].login,
			etiquetas_ = fotos_.FILAS[i].etiquetas,
			ncomentarios_ = fotos_.FILAS[i].ncomentarios,
			nmegusta_ = fotos_.FILAS[i].nmegusta,
			nfavorita_ = fotos_.FILAS[i].nfavorita,
			foto_ = fotos_.FILAS[i].fichero,
			id_ = fotos_.FILAS[i].id,
			ancho_ = fotos_.FILAS[i].ancho;

		array_fotos_[i] = id_;

		// Creamos las etiquetas para la foto...
		var etiquetas_html_ = crearEtiquetas(etiquetas_);


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


		console.log("Foto " + foto_ + " creada");
	}


	// Recarmamos aquellas que el usuario le ha dado mg o fav
	if (sessionStorage.getItem("login")) {
		asignarFavMg(array_fotos_);
	}
}



// Función que crea las etiquetas para que se visualicen en la página html
function crearEtiquetas(etiquetas) {
	var etiquetas_html_ = "";

	for (let j=0; j<etiquetas.length; j++) {
		let nombre_ = etiquetas[j].nombre;
		etiquetas_html_ += `<a href="buscar.html?e=${nombre_}">${nombre_}</a>`;
		if (j < etiquetas.length-1) {
			etiquetas_html_ += `, `;
		}
	}

	return etiquetas_html_;
}



// Función que muestra las fotos soliciatadas al servidor
function crearFotosFav() {

	// Índices para las fotos en función de la página actual
	var inicio_, final_;
	inicio_ = pagina_actual_*6;
	final_ = (inicio_+6 < fotos_.FILAS.length) ? inicio_+6 : fotos_.FILAS.length;

	// Array de IDs de las fotos para posterior uso
	var array_fotos_ = new Array(final_-inicio_);

	// Sección donde incluir las nuevas fotos
	var section_ = document.getElementById("coleccion-fotos");
	for (let i=inicio_; i<final_; i++) {

		// Creamos las variables correspondientes a los atributos...
		var titulo_ = fotos_.FILAS[i].titulo,
			login_ = fotos_.FILAS[i].login,
			etiquetas_ = fotos_.FILAS[i].etiquetas,
			ncomentarios_ = fotos_.FILAS[i].ncomentarios,
			nmegusta_ = fotos_.FILAS[i].nmegusta,
			nfavorita_ = fotos_.FILAS[i].nfavorita,
			foto_ = fotos_.FILAS[i].fichero,
			id_ = fotos_.FILAS[i].id,
			ancho_ = fotos_.FILAS[i].ancho;

		array_fotos_[i] = id_;

		// Creamos las etiquetas para la foto...
		var etiquetas_html_ = crearEtiquetas(etiquetas_);

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

		console.log("Foto " + foto_ + " creada");
	}

	// Recarmamos aquellas que el usuario le ha dado mg o fav
	asignarFavMg(array_fotos_);

}



// Función que remarca el icono de megusta y favoritas de las fotos que el usuario haya asignado
function asignarFavMg(idFotos) {

	// Recogemos todos los iconos...
	var mg_ = document.querySelectorAll("article>p>i:first-child"),
		fav_ = document.querySelectorAll("article>p>i:first-child+i");

	// Creamos un array de peticiones asíncronas para no sobreescribirlas
	var xhr = new Array(mg_.length);

	// Hacemos las peticiones...
	for (let i=0; i<mg_.length; i++) {
		xhr[i] = new XMLHttpRequest();
		xhr[i].onload = function() {
			info_foto_ = JSON.parse(xhr[i].responseText);
			console.log(info_foto_);
			if (info_foto_.FILAS[0].usu_favorita == 1) {
				fav_[i].style.color = "#fff";
			}
			if (info_foto_.FILAS[0].usu_megusta == 1) {
				mg_[i].style.color = "#fff";
			}
		};
		xhr[i].open("GET", "./api/fotos/"+idFotos[i], true);
		xhr[i].setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
		xhr[i].send();
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



// Función que modifica la botonera en función de las fotos existentes en la página
function modificarBotoneraFav() {
	total_fotos_ = fotos_.FILAS.length;
	total_paginas_ = Math.ceil(total_fotos_/6);

	var pagina_ = (total_paginas_ > 0) ? pagina_actual_+1 : 0;

	document.getElementById("botonera").innerHTML = `${pagina_}/${total_paginas_}`;
}



// Función para ir a la primera página
function paginaPrimera() {
	if (pagina_actual_ > 0) {
		pagina_actual_ = 0;
		cambioPagina();
	}
}



// Función para ir a la primera página de favoritas
function paginaPrimeraFav() {
	if (pagina_actual_ > 0) {
		pagina_actual_ = 0;
		cambioPaginaFav();
	}
}



// Función para ir a la página anterior de fotos
function paginaAnterior() {
	if (pagina_actual_ > 0) {
		pagina_actual_--;
		cambioPagina();
	}
}



// Función para ir a la página anterior de fotos de favoritas
function paginaAnteriorFav() {
	if (pagina_actual_ > 0) {
		pagina_actual_--;
		cambioPaginaFav();
	}
}



// Función para ir a la siguiente página de fotos
function paginaSiguiente() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_++;
		cambioPagina();
	}
}



// Función para ir a la siguiente página de fotos de favoritas
function paginaSiguienteFav() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_++;
		cambioPaginaFav();
	}
}



// Función para ir a la primera página
function paginaUltima() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_ = total_paginas_ - 1;
		cambioPagina();
	}
}



// Función para ir a la primera página de favoritas
function paginaUltimaFav() {
	if (pagina_actual_+1 < total_paginas_) {
		pagina_actual_ = total_paginas_ - 1;
		cambioPaginaFav();
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



// Funcion para cambiar de página de favoritas
function cambioPaginaFav() {
	borrarFotos();
	crearFotos();
	var pagina_ = pagina_actual_+1;
	document.getElementById("botonera").innerHTML = `${pagina_}/${total_paginas_}`;
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
		};
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



// Función que muestra todas las etiquetas introducidas por los usuarios en el campo input para asignar etiquetas en nueva.html
function peticionEtiquetas() {
	var xhr = new XMLHttpRequest(),
		lista_ = document.getElementById("etiquetas");
	input_tags_ = document.getElementById("tags");

	xhr.open("GET", "./api/etiquetas/", true);
	xhr.onload = function() {
		tags_ = JSON.parse(xhr.responseText);
		console.log(tags_);

		// Añadimos las etiquetas al datalist...
		var tag_;
		for (let i=0; i<tags_.FILAS.length; i++) {
			tag_ = tags_.FILAS[i].nombre;
			lista_.innerHTML += `<option value="${tag_}">`;
		}
	};
	xhr.send();
}



// Función que permite añadir etiquetas a la sección de etiquetas
function cargaEtiquetas() {

	// Escucha por el input cada vez que levanta una tecla en el teclado
	input_tags_.addEventListener("keyup", function(event) {

		// El código 13 hace referencia a la tecla Return
		if (event.keyCode == 13) {

			// Cancelamos la acción por defecto, si es necesario
			event.preventDefault();

			// Clickamos el botón de añadir tag
			document.getElementById("btn-mete").click();
		}
	});
}



// Función que permite pulsar el botón para añadir etiquetas
function incluirEtiquetas() {
	var seccion_ = document.querySelector("form#new-photo>div>p>span");

	if (seccion_.innerHTML != "") {
		seccion_.innerHTML += `,`;
	}
	seccion_.innerHTML += `${input_tags_.value}`;
	input_tags_.value = "";
}



// Función que limpia la sección de etiquetas asignadas
function borrarEtiquetas() {
	document.querySelector("form#new-photo>div>p>span").innerHTML = "";
}



// Función que muestra la imagen seleccionada en la página nueva.html
function mostrarFoto(foto) {
	var img_ = document.querySelector("div#ficha-foto>div>div>img"),
		imagen_;

	// Comprobamos desde que input se ha seleccionado la foto...
	if (foto == "") {
		imagen_ = document.querySelector("div#ficha-foto>div>div>input");
	} else {
		imagen_ = document.querySelector("div#ficha-foto>div>div>div>input");
	}
	console.log(imagen_.files[0]);

	// La cargamos en la página...
	if (imagen_.files[0] != undefined) {
		if (imagen_.files[0].size/1024 <= 300) {
			img_.src = "Images/" + imagen_.files[0].name;
			img_.width = "250";
			document.querySelector("div#ficha-foto>div>div:first-child").style.border = "none";
		} else {
			mostrarMensajeSize(true);
		}
	}
}



// Función para mostrar el mensaje modal de la página nueva.html
function mostrarMensajeSize(aparece) {
	var mensaje_ = document.querySelector("body>div+div");

	if (aparece) {
		mensaje_.style.display = "inline-block";
	} else {
		mensaje_.style.display = "none";
	}
}



// Función para eliminar la foto seleccionada
function eliminarFoto() {
	document.querySelector("div#ficha-foto>div>div>img").src = "";
	document.querySelector("div#ficha-foto>div>div:first-child").style.border = "solid 2px #000";
	document.querySelector("div#ficha-foto>div>div>img").margin = "auto";
}



// Función para hacer una llamada post al servidor para la nueva foto
function peticionNuevaFoto() {
	var xhr = new XMLHttpRequest(),
		fd = recogeDatosNueva();

	xhr.open("POST", "./api/fotos/", true);
	xhr.onload = function() {
		console.log(xhr.responseText);
		nueva_foto_ = JSON.parse(xhr.responseText);
		console.log(nueva_foto_);

		if (nueva_foto_.RESULTADO == "OK") {
			console.log("Se ha subido correctamente la foto...");
			mostrarMensajeNueva(true);
		} else {
			console.log("No se ha subido correctamente la foto...");
		}
	};
	xhr.setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
	xhr.send(fd);

	return false;
}



// Función que recoge los datos del formulario de la página nueva.html
function recogeDatosNueva() {
	let fd = new FormData(),
		etiquetas_ = document.querySelector("form#new-photo>div>p>span"),
		foto_ = document.querySelector("#ficha-foto>div>div>input");

	fd.append("titulo", document.getElementById("title").value);
	fd.append("descripcion", document.getElementById("description").value);
	if (etiquetas_.innerHTML != "") {
		fd.append("etiquetas", etiquetas_.innerHTML);
	}
	fd.append("fichero", foto_.files[0]);

	return fd;
}



// Función para mostrar el mensaje modal al hace submit en la página de nueva foto
function mostrarMensajeNueva(aparece) {
	var mensaje_ = document.querySelector("body>div:last-child");

	if (aparece) {
		mensaje_.style.display = "inline-block";
	} else {
		mensaje_.style.display = "none";
		redireccionaIndex();
	}
}



// Función que carga la foto de la página foto.html
function peticionFoto() {
	var url_ = location.href,
		ultimoSlash_ = url_.lastIndexOf("?"),
		id_ = url_.substring(ultimoSlash_+1);

	// Si se intenta acceder a la página sin id de foto...
	if (id_ == "") {
		redireccionaIndex();
	} else {

		// En caso contrario realizamos la petición...
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "./api/fotos/" + id_, true);
		xhr.onload = function() {
			info_foto_ = JSON.parse(xhr.responseText);
			if (info_foto_.RESULTADO == "OK") {
				console.log("Petición de la foto correcta...");
				console.log(info_foto_);
				mostrarInfoFoto();
			} else {
				console.log("Petición de la foto incorrecta...");
			}
		};
		xhr.send();
	}
}



// Función para cargar la sección de la foto en la página foto.html
function mostrarInfoFoto() {
	var fichero_ = info_foto_.FILAS[0].fichero,
		titulo_ = info_foto_.FILAS[0].titulo,
		login_ = info_foto_.FILAS[0].login,
		alto_ = info_foto_.FILAS[0].alto,
		ancho_ = info_foto_.FILAS[0].ancho,
		peso_ = info_foto_.FILAS[0].peso,
		nmegusta_ = info_foto_.FILAS[0].nmegusta,
		nfavorita_ = info_foto_.FILAS[0].nfavorita,
		ncomentarios_ = info_foto_.FILAS[0].ncomentarios,
		etiquetas_ = info_foto_.FILAS[0].etiquetas,
		id_ = info_foto_.FILAS[0].id,
		section_ = document.getElementById("detalles-foto");

	// Creamos las etiquetas para la foto...
	var etiquetas_html_ = crearEtiquetas(etiquetas_);

	// Reescalamos la foto si es necesario...
	ancho_2_ = (parseInt(ancho_) > 400) ? 400 : parseInt(ancho_);

	// Pasamos el peso de bytes a Kbytes...
	peso_ = Math.round(parseInt(peso_)/1024);

	section_.innerHTML += `
		<div>
			<a href="fotos/${fichero_}"><img src="fotos/${fichero_}" alt="Imagen no disponible" width="${ancho_2_}"></a>
			<div>
				<p>${titulo_}</p>
				<p>By <a id="nom" href="buscar.html?l=${login_}">${login_}</a></p>
				<p>${ancho_} x ${alto_}</p>
				<p>${peso_} KB</p>
				<p id="mg"><i class="fas fa-heart"> <a onclick="asignarMgFav('mg');" class="cursor">${nmegusta_}</a></i></p>
				<p id="fav"><i class="fas fa-star"> <a onclick="asignarMgFav('fav');" class="cursor">${nfavorita_}</a></i></p>
				<p><i class="fas fa-comments"> <a href="#comentarios">${ncomentarios_}</a></i></p>
				<p><i class="fas fa-tags">${etiquetas_html_}</i></p>
			</div>
		</div>`;

	// Ahora cargamos los comentarios...
	peticionComentarios(id_, "S");
}



// Función para cargar los comentarios de la foto
function peticionComentarios(id, primera) {
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "./api/fotos/" + id + "/comentarios", true);
	xhr.onload = function() {
		comentarios_ = JSON.parse(xhr.responseText);
		if (comentarios_.RESULTADO == "OK") {
			console.log("Petición de los comentarios de la foto correcta...");
			console.log(comentarios_);
			crearComentarios(id, primera);
		} else {
			console.log("Petición de los comentarios de la foto incorrecta...");
		}
	};
	xhr.send();
}



// Función que crea los comentarios posteados en una foto
function crearComentarios(id, primera) {
	var seccion_ = document.querySelector("#zona-comentarios>div");

	if (primera == "N") {
		borrarComentarios();
	}

	for (let i=0; i<comentarios_.FILAS.length; i++) {
		var fechahora_ = comentarios_.FILAS[i].fechahora,
			login_ = comentarios_.FILAS[i].login,
			texto_ = comentarios_.FILAS[i].texto,
			titulo_ = comentarios_.FILAS[i].titulo;

		seccion_.innerHTML += `
			<article>
				<div>
					<h4>${titulo_}</h4>
					<h5 class="icon-user">${login_} <time datetime="2019-03-24T19:40">${fechahora_}</time></h5>
					<p>${texto_}</p>
				</div>
			<article>`;
	}

	// Ahora marcamos los botones de mg y fav...
	if (sessionStorage.getItem("login")  &&  primera == "S") {
		marcarMgFav(id);
	}
}



// Función para marcar como favorita o megusta si el usuario la tiene asignada
function marcarMgFav(id) {
	var xhr = new XMLHttpRequest(),
		mg_ = document.querySelector("#mg>i>a"),
		fav_ = document.querySelector("#fav>i>a");

	xhr.open("GET", "./api/fotos/" + id, true);
	xhr.onload = function() {
		var aux_ = JSON.parse(xhr.responseText);
		console.log(aux_);
		megusta_ = aux_.FILAS[0].usu_megusta;
		favorita_ = aux_.FILAS[0].usu_favorita;

		// Cambiamos el color de marcado y el contenido...
		if (megusta_ == 1) {
			mg_.style.color = "#fff";
		} else {
			mg_.style.color = "#E00F0F";
		}
		if (favorita_ == 1) {
			fav_.style.color = "#fff";
		} else {
			fav_.style.color = "#E4E009";
		}

		// Y el contenido...
		mg_.innerHTML = aux_.FILAS[0].nmegusta;
		fav_.innerHTML = aux_.FILAS[0].nfavorita;
	};
	xhr.setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
	xhr.send();
}



// Método que realiza la petición de asignar/quitar fav o mg de una foto
function asignarMgFav(boton) {
	var url_, metodo_, id_ = info_foto_.FILAS[0].id;
	var xhr = new XMLHttpRequest();

	if (boton == "mg") {
		console.log("Actualizamos megusta...");
		url_ = "./api/fotos/" + id_ + "/megusta";
		if (megusta_ == 1) {
			metodo_ = "DELETE";
		} else {
			metodo_ = "POST";
		}
	} else {
		console.log("Actualizamos favorita...");
		url_ = "./api/fotos/" + id_ + "/favorita";
		if (favorita_ == 1) {
			metodo_ = "DELETE";
		} else {
			metodo_ = "POST";
		}
	}

	xhr.open(metodo_, url_, true);
	xhr.onload = function() {
		var resultado_ = JSON.parse(xhr.responseText);
		if (resultado_.RESULTADO == "OK") {
			console.log("Transacción megusta/favorita terminada correctamente...");

			// Actualizamos la información...
			marcarMgFav(id_);
		} else {
			console.log("Transacción megusta/favorita terminada de manera incorrecta...");
		}
	};
	xhr.setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
	xhr.send();
}



// Función para publicar el comentario escrito por el usuario
function publicarComentario() {
	var fd = new FormData();
	fd.append("titulo", document.getElementById("titulo").value);
	fd.append("texto", document.getElementById("texto").value);

	var	xhr = new XMLHttpRequest();
	xhr.open("POST", "./api/fotos/" + info_foto_.FILAS[0].id + "/comentario", true);
	xhr.onload = function() {
		var aux_ = JSON.parse(xhr.responseText);
		console.log(aux_);
		if (aux_.RESULTADO == "OK") {
			mostrarMensajeComentarioT(true);
		} else {
			mostrarMensajeComentarioF(true);
		}
		return false;
	};
	xhr.setRequestHeader("Authorization", sessionStorage.getItem("login") + ":" + sessionStorage.getItem("token"));
	xhr.send(fd);

	return false;
}



function mostrarMensajeComentarioT(aparece) {
	var mensaje_ = document.getElementById("uno");

	if (aparece) {
		mensaje_.style.display = "inline-block";
	} else {
		mensaje_.style.display = "none";

		// Al cerrar mensaje modal limpiamos formulario...
		document.getElementById("titulo").value = "";
		document.getElementById("texto").value = "";

		// Añadimos los comentarios
		peticionComentarios(info_foto_.FILAS[0].id, "N");
	}
}



function mostrarMensajeComentarioF(aparece) {
	var mensaje_ = document.getElementById("dos");

	if (aparece) {
		mensaje_.style.display = "inline-block";
	} else {
		mensaje_.style.display = "none";

		// Restablecemos el foco en el formulario...
		document.getElementById("titulo").focus();
	}
}



// Función que borra los comentarios de una foto
function borrarComentarios() {
	var div_ = document.querySelector("#zona-comentarios>div"),
		num_articles_ = document.querySelectorAll("article").length;
		console.log("holaaaaaaaaaaaaaaaaaa");
	for (let i=0; i<num_articles_; i++) {
		div_.removeChild(div_.lastChild);
	}
}



// Función para mostrar el formulario para escribir un comentario
function mostrarFormularioComentario() {
	var h3_ = document.querySelector("#zona-comentarios>h3"),
		form_ = document.querySelector("#zona-comentarios>form"),
		p_ = document.querySelector("#zona-comentarios>p");

	if (sessionStorage.getItem("login")) {
		h3_.style.display = "inline-block";
		form_.style.display = "inline-block";
		p_.style.display = "none";
	} else {
		h3_.style.display = "none";
		form_.style.display = "none";
		p_.style.display = "inline-block";
	}
}