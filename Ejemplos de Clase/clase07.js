function hacerLogin(frm) { /*NO poner los nombres del formulario para evitar que el navegador haga referencias equívocas al html*/
	let url = 'api/sesiones',
		xhr = new XMLHttpRequest(),
		fd = new FormData(frm);

	xhr.open('POST', url, true);
	xhr.onload = function() {
		console.log(xhr.responseText);
		let r = JSON.parse(xhr.responseText); /*nos convierte el objeto JSON a un objeto JavaScript*/

		if(r.RESULTADO == 'OK') { /*comprobamos si la respuesta es correcta*/
			sessionStorage['usuario'] = xhr.responseText;
			location.href = 'index.html';
		}

	};

	xhr.send(fd);
/*
location.href: devuelve toda la dirección
location.hash: devuelve lo que hay despues de la almohadilla
location.search:
*/
	return false;
}



function pedirFotosFav {
	let url = 'api/usuarios/',
		xhr = new XMLHttpRequest(),
		usu;

	if(!sessionStorage['usuario'])
		return false;

	usu = JSON.parse(sessionStorage['usuario']);

	url += usu.login + '/favoritas';

	xhr.open('GET', url, true);
	xhr.onload = function() {
		console.log(xhr.responseText);
		let r = JSON.parse(xhr.responseText);
		if(r.RESULTADO == 'OK') {
			console.log(r);
			let html = '';

			r.FILAS.forEach(function(e,idx,v) {
				html += '<article>';
				html +=    '<h3>' + e.titulo + '</h3>';
				html +=    '<img src="fotos/' + e.fichero + '" alt="' + e.descripcion +'">';

				html += `<img src="fotos/${e.fichero}" alt="${e.descripcion}">`;

				html += '<article>';
			});
			document.querySelector('#ff>div').innerHTML = html;
		}
	};
	xhr.setRequestHeader('Authorization', usu.login + ':' + usu.token);
	xhr.send();
}



function mostrarValor(inp) {
	console.log(inp.value);
}


function pedirEtiquetas {
	let url = 'api/etiquetas';
		xhr = new XMLHttpRequest();

	xhr.OPEN('GET', url, true);
	xhr.onload = function() {
		let html = '',
			r = JSON.parse(xhr.responseText);
		
		r.FILAS.forEach(function(e) {
			html += `<option>${e.nombre}</option>`;
		});
	};
	document.querySelector('#etiquetas').innerHTML = html;
}