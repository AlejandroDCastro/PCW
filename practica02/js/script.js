
// Variables globales
var fotos_index_;
var info_foto_;


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
		if (sessionStorage.getItem("usuario")) {
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

		// Eliminamos la información del sessiontorage del usuario...
		sessionStorage.removeItem("usuario");

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
	var parametros_ = document.querySelector("#div-busqueda-rapida>button").value;

	// Se realizará la búsqueda en la página buscar...
	location.href = "buscar.html?d=" + parametros_;
}



// Función que carga las fotos mejor valoradas en páginas de seis registros
function peticionFotos(url) {

	// Abrimos una conexión para pedir datos al servidor web...
	var xhr = new XMLHttpRequest();

	// Función que se ejecuta cuando la petición cambia de estado...
	xhr.onreadystatechange = function() {

		// Cuando la petición termina y la respuesta a la petición está lista...
		if (xhr.readyState == 4  &&  xhr.status == 200) {

			// La respuesta es un string que lo convertimos en un objeto JS...
			fotos_index_ = JSON.parse(xhr.responseText);
			console.log(fotos_index_);
			crearFotos();
		}
	};
	xhr.open("GET", url, true);
	xhr.send();

	xhr.onerror = function() {
		console.log("Error en la petición...");
		alert("ERROR EN LA PETICIÓN DE LAS FOTOS");
	};
}



// Función que muestra las fotos soliciatadas al servidor
function crearFotos() {

	// Sección donde incluir las nuevas fotos
	var section_ = document.getElementById("coleccion-fotos");
	for (let i=0; i<fotos_index_.FILAS.length; i++) {

		// Creamos las variables correspondientes a los atributos...
		let titulo_ = fotos_index_.FILAS[i].titulo,
			login_ = fotos_index_.FILAS[i].login,
			etiquetas_ = fotos_index_.FILAS[i].etiquetas,
			ncomentarios_ = fotos_index_.FILAS[i].ncomentarios,
			nmegusta_ = fotos_index_.FILAS[i].nmegusta,
			nfavorita_ = fotos_index_.FILAS[i].nfavorita,
			foto_ = fotos_index_.FILAS[i].fichero,
			id_ = fotos_index_.FILAS[i].id,
			ancho_ = fotos_index_.FILAS[i].ancho;

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
	if (sessionStorage.getItem("usuario")) {
		let autorizacion_ = sessionStorage.getItem("usuario").login + ":" + sessionStorage.getItem("usuario").token;

		// Hacemos la petición...
		var xhr = new new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4  &&  xhr.status == 200) {

				info_foto_ = JSON.parse(xhr.responseText);
				console.log(info_foto_);
				console.log("TERMINAR MÉTODO asignarFavMg");

			}
		}
		xhr.open("GET", "./api/fotos/"+fotoId+"/"+autorizacion_, true);
		xhr.send();
	}
}