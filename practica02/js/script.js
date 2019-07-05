
// Función para hacer logout y limpiar información de sessionStorage
function logout() {
	if (compatible_api_storage()) {
		console.log("Cerramos la sesión del Usuario...");
		sessionStorage.removeItem("usuario");
		location.href = "index.html";
	}
}



// Función que comprueba si el navegador es compatible con el local storage
function compatible_api_storage() {
	if(typeof(Storage) !== "undefined") {
		console.log("Navegador compatible con WebStorage...");
		return true;
	} else {
		console.warn("Navegador no compatible con WebStorage...");
		alert("ACTUALICE SU NAVEGADOR");
		return false;
	}
}



// Función que arranca el funcionamiento de la web
function iniciar() {

	// Primero comprobamos si el navegador proporciona soporte para Web Storage
	if(compatible_api_storage()) {

		// Si no realizamos esto dentro de una función el DOM no podrá leer ningún objeto del documento, es decir, que intentará buscar elementos sin que la página haya renderizado

		// Seleccionamos los elementos del menú que guardan el texto
		var elementos = document.querySelectorAll("nav>ul>li>a>span");

		// Comprobamos si el usuario está logueado
		if(sessionStorage.getItem("usuario") != null) {
			for(var i=0; i<elementos.length; i++) {
				if(elementos[i].innerHTML == "Login"  ||  elementos[i].innerHTML == "Registro") {
					elementos[i].parentNode.parentNode.style.display = "none";
				}
			}
		} else {
			for(var i=0; i<elementos.length; i++) {
				if(elementos[i].innerHTML == "Nueva foto"  ||  elementos[i].innerHTML == "Favoritas"  ||  elementos[i].innerHTML == "Logout") {
					elementos[i].parentNode.parentNode.style.display = "none";
				}
			}
		}

	}
}
