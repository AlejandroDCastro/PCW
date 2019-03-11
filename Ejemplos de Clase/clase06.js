function botonPulsado() {
	console.log('Botón pulsado!!!!!');
}

function pedirFotos() {
	let xhr = new new XMLHttpRequest(),
		url = 'api/fotos';

	xhr.open('GET', url, true);
	xhr.onload = function() {
		console.log(xhr.responseText);
		let r = JSON.parse(xhr.responseText);
		console.log(r);
		// conszole.table(r);
	};
	xhr.send();
}