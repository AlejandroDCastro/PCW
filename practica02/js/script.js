
// Primero comprobamos si el navegador proporciona soporte para Web Storage
if(typeof(Storage) !== "undefined") {

	// Comprobamos si el usuario está logueado
	if(sessionStorage.getItem("usuario") != null) {
		
	} else {
		document.getElementById("lnueva").style.display = "none";
	}

}