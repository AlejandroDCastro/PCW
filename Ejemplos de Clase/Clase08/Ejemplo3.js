function busquedaRapida(frm){
	let url = 'buscar.html';

	url += '?d=' + frm.campo.value;
	location.href= url;

	return false;
}

function comprobarParametros(){
	let valor = location.search.substr(1);
	valor = decodeURI(valor); //para que te convierta los caracteres raros a unos que puede interpretar
	valor = valor.split('='); //para detectar por un lado que tiene el campo d y el valor de despues del igual
	console.table(valor);
	//console.log(location.search.substr(1)); //search desde el interrogante hasta el final de la direccion, le ponemos 1 para saltarse el interrogante
}

//Para borrar el div emergente cuando haga click en aceptar
function cerrar()
{
	document.querySelector('.capa-fondo').remove();
	location.href = 'buscar.html';
}

function mostrarMensaje()
{
	let titulo, texto, div, html;

	titulo = 'Mensaje modal';
	texto = 'Texto del mensaje modal';

	div = document.createElement('div') //le pasas el tagname del elemento para que lo cree en el html

	div.classList.add('capa-fondo'); //le anyade la clase capa-fondo al elemento div

	html = '<article>';
	html += '<h2>' + titulo + '</h2>';
	html += '<p>' + texto + '</p>';
	html += '<button onclick="cerrar();">'Aceptar'</button>';
	html += '</article>';

	div.innerHTML= html; //para insertar el html que hemos creado dentro del div

	document.body.appendChild(div); //anyade un ultimo hijo en el body
}

function cargarImagen(inp)
{
	//console.log(inp);
	let fichero = inp.files[0], //Ver curiosidades con Mike (basicamente te permite sacar valor de un campo de un array de ficheros)
	fr = new FileReader();

	fr.onload = function(){ //Cuando haya acabado de leer el fichero (que se hace de manera asincrona), entonces se ejecuta esta funcion
		document.querySelector('label[for=fichero]>img').src = fr.result; //muestra el resultado que es la imagen que se acaba de seleccionar
	};

	fr.readAsDataURL(fichero);
}

//Curiosidades con Mike: existe una cosa llamada z-index en css que permite añadirle profundidad a algunos elementos
//para que aparezcan por encima de otros en el html
//$0.files: Te saca un elemento html en forma de array de ficheros (antes tienes que pinchar en el DOM el elemento que quieres añadir al array)
//Al servidor HAY que pasarle files[0] NO HAY QUE PASAR el inp