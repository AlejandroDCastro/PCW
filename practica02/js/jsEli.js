// ========================================================================================
// Página login.html
// ========================================================================================
function hacerLogin(frm){
	let xhr = new XMLHttpRequest(),
		url = 'api/usuarios/login',
		fd = new FormData(frm);

	xhr.open('POST', url, true);

	xhr.onload = function(){
        console.log(xhr.responseText);
        
        let r = JSON.parse(xhr.responseText);
        
		if (r.RESULTADO == 'OK') {
			console.log(r);
			sessionStorage['usuario'] = xhr.responseText;

			mostrarMensaje(r);
		}else{
			console.log('Error en el inicio de sesión. ');
			mostrarMensajeError();
		}
	};

	xhr.send(fd);
	return false;
}

function mostrarMensaje(datos){
    let div, html;

    div = document.createElement('div');
    
    div.setAttribute('id', 'capa-fondo');
	
    html = '<article>';
    html += '<h2>LOGIN</h2>';
    html += '<p>El usuario <b>' + datos.login + '</b> se ha logueado de forma correcta</p>';
    html += '<button onclick="cerrar();">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;

    document.body.appendChild(div);
}

function mostrarMensajeError() {
	let div, html;

    div = document.createElement('div');
    
	div.id = 'capa-fondo';
	
    html = '<article>';
    html += '<h2>Acceso denegado</h2>';
    html += '<p>Se ha producido un error al intentar iniciar sesión. Por favor, vuelve a intentarlo.</p>';
    html += '<button onclick="cerrarError();">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;

    document.body.appendChild(div);
}

function cerrar(){
	document.querySelector('#capa-fondo').remove();
	location.href = './index.html';
}

function cerrarError(){
	document.querySelector('#capa-fondo').remove();
	document.getElementById('mylog').reset();
	document.getElementById('login').focus();
}

// ========================================================================================
// Página registro.html
// ========================================================================================
function hacerRegistro(frm){
	let url = 'api/usuarios/registro',
		fd  = new FormData(frm);

	fetch(url, {method:'POST',body:fd}).then(function(respuesta){
		if(respuesta.ok){
			respuesta.json().then(function(datos){
				console.log("Datos del método hacerRegistro(): \n");
				console.log(datos);
				//Limpiamos formulario
				document.getElementById('myreg').reset();
				mensajeRegistro(datos.LOGIN);
			});
		}else
			console.log('Error en la petición fetch');
	});

	return false;
}

function mensajeRegistro(datos){
	let titulo, texto, div, html;

    titulo = 'REGISTRO';
    texto = 'El usuario <b>' + datos + '</b> se ha registrado correctamente. ';

    div = document.createElement('div');
    div.setAttribute('id', 'capa-fondo');
	
    html = '<article>';
    html += '<h2>' + titulo + '</h2>';
    html += '<p>' + texto + '</p>';
    html += '<button onclick="window.location.href=\'login.html\';">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;
    document.body.appendChild(div);
}

function compruebaUsuario(value){
	let url = `api/usuarios/${value}`,
	    html;

	fetch(url, {method:'GET'}).then(function(respuesta){
		if(respuesta.ok){
			respuesta.json().then(function(datos){
				//Comprobamos el estado del usuario por consola
				console.log("Datos del método compruebaUsuario(): \n");
				console.log(datos);
				if(datos.DISPONIBLE == false){
					console.log('Usuario no disponible.');
	
					html = '<p class="user"> (*) El nombre de usuario no se encuentra disponible. </p>';
					document.querySelector('#mensaje').innerHTML = html;
					document.getElementById('mensaje').style.display = "block";
					document.getElementById('mensaje').style.color = 'red';
				}else{
					//No enseñamos ningún mensaje
					html = '';
					document.querySelector('#mensaje').innerHTML = html;
					console.log('Usuario disponible :D');
				}
			});
		}else{
			console.log('Error(' + respuesta.status + '): ' + respuesta.statusText);      
			return;    
		}
	});
}

function compruebaPassword(){
	let pwd = document.getElementById('pass').value,
		pwd2 = document.getElementById('pass2').value,
		html;

	if(pwd != null && pwd2 != null && pwd != '' && pwd2 != ''){
		console.log('Contraseña: ' + pwd + '\n' + "Repite contraseña: " + pwd2);
		if(pwd != pwd2){
			html = '<p class="user"> (*) Las contraseñas no coinciden </p>';
			document.querySelector('#mensaje2').innerHTML = html;
			document.getElementById('mensaje2').style.display = "block";
			document.getElementById('mensaje2').style.color = 'red';
		}else{
			html = '';
			document.querySelector('#mensaje2').innerHTML = html;
			console.log('Contraseñas correctas');
		}
	}
}

function logout(){
	console.log("Vamos a cerrar sesión.");
	sessionStorage.clear();
	location.href = 'index.html';
}

// ========================================================================================
// Página nuevo.html
// ========================================================================================
function pedirCategorias(){
    let xhr = new XMLHttpRequest(),
		url = 'api/categorias',
		option = '';

	xhr.open('GET', url, true);
	
    xhr.onerror = function(){
        console.log('ERROR');
    }

    xhr.onload = function(){
        let r = JSON.parse(xhr.responseText);
        console.log(r);
		
		document.querySelector('#categoria').innerHTML = '';
        r.FILAS.forEach(function(e){
            option = document.createElement('option');
			option.innerHTML = `${e.nombre}`;
			document.querySelector('#categoria').appendChild(option);
		});
    };
    
    xhr.send();
}

var imagenes = [], cont = 0;

function cargarFoto(inp){

	if(inp != null){
		if(parseInt(inp.files[0].size/1024) > 300){
			console.log("Imagen muy grande");
			mensajeFoto();
			return false;
		}
	}
	
	let fr = new FileReader();

	fr.onload = function(){
		inp.parentNode.querySelector('img').src = fr.result;
	}
	fr.readAsDataURL(inp.files[0]);

	if(imagenes[cont] == null || imagenes[cont] == ''){
		imagenes[cont] = inp.files[0];
	}

	cont++;
}

var counting = 0;

function añadirFoto(){
	let div = document.querySelector('form>div'),
		ficha = document.createElement('div'),
		html = '';

	counting++;

	html += `<label for="file-input${counting}">`;
	html += `<img id="default" src="Images/no-image.png" alt='' class="no-photo">`;
	html += '</label>';
	html += `<input type="file" name="fichero" id="file-input${counting}" onchange="cargarFoto(this);" accept="image/*" required class="file-input">`;
	html += '<button onclick="limpiar();" class="subir-label"><i class="fas fa-trash-alt"></i> Eliminar foto</button>';

	ficha.innerHTML = html;
	div.appendChild(ficha);
	let input = "file-input"+counting;
	document.getElementById(input).click();
}

function limpiar(value){
	console.log(value);
	value.parentNode.querySelector('img').src = 'Images/no-image.png';
}

var id, login, token;
function enviarArticulo(frm){
	let url = 'api/articulos/',
		xhr = new XMLHttpRequest(),
		fd  = new FormData(frm),
		usu = JSON.parse(sessionStorage['usuario']),
		autorizacion = `${usu.login}:${usu.token}`;

	console.log(usu.login + ', ' + usu.token);

	console.log(imagenes);

	xhr.open('POST', url, true);
	xhr.onload = function(){
		console.log(xhr.responseText);
        let r = JSON.parse(xhr.responseText);
		if(r.RESULTADO == 'OK'){
			console.log('r: ', r);
			id = r.ID, login = usu.login, token = usu.token;
			subirFoto();
		}
		else
			console.log(r.CODIGO + ': ' + r.DESCRIPCION);
	};

	xhr.setRequestHeader('Authorization', autorizacion);
	xhr.send(fd);

	return false;
}

var x = 0;
function subirFoto(){
	let url = `api/articulos/${id}/foto`
		xhr = new XMLHttpRequest(),
		auth = `${login}:${token}`,
		fd = new FormData(),
		encontrado = false;

	console.log(imagenes);

	fd.append('fichero', imagenes[x]);

	xhr.open('POST', url, true);
	xhr.addEventListener("load", function() {
		let r = JSON.parse(xhr.responseText);
		
		if(r.RESULTADO=='OK'){
			console.log(r);
			x++;
			if(x < imagenes.length){
				subirFoto();
			}

			if(x == imagenes.length){
				mensajeArticulo();
			}
		}
		else{
			console.log(r.CODIGO + ': ' + r.DESCRIPCION);
		}
	});

	xhr.setRequestHeader('Authorization', auth);
	xhr.send(fd);
    
}

function mensajeArticulo(){
    let div, html;

    div = document.createElement('div');
    div.setAttribute('id', 'capa-fondo');

    html = '<article>';
    html += '<h2>Nuevo artículo</h2>';
    html += '<p>Se ha guardado correctamente el artículo</p>';
    html += '<button onclick="cerrar();">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;
    document.body.appendChild(div);
}

function mensajeFoto(){
	let div, html;

    div = document.createElement('div');
    div.setAttribute('id', 'capa-fondo');

    html = '<article>';
    html += '<h2>Error al subir la imagen</h2>';
    html += '<p>El tamaño de la imagen no puede superar los 300KB</p>';
    html += '<button onclick="cerrarFoto();">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;
    document.body.appendChild(div);
}

function cerrarFoto(){
    document.querySelector('#capa-fondo').remove();
}

function dejarPregunta(){
	let section = document.getElementById("dejarPregunta"), section2 = '', html = '';

	if(!sessionStorage.getItem('usuario')){
		section.parentNode.removeChild(section);

		section2 = document.createElement("section");
		section2.setAttribute('id', 'dejarPregunta');
		html += '<h5>¡Atención!</h5>';
		html += '<p>Debes hacer <a href="login.html">login</a> para poder dejar una pregunta al vendedor.</p>';
		//html += '<button class="boton" onclick="window.location.href=\'login.html\';">Aceptar</button>';

		section2.innerHTML = html;
		let h4 = document.getElementById('preguntas').getElementsByTagName('h4')[1];
		
		document.getElementById('preguntas').insertBefore(section2, h4);
	}
}

function dejarPreguntaLogueado(){
	if(sessionStorage.getItem('usuario')){
		let url = 'formulario.html';

		fetch(url).then(function(respuesta){
			if(!respuesta.ok)
				return false;
			
			respuesta.text().then(function(html){
				document.querySelector('#dejarPregunta').innerHTML = html;
			})
		});
    	return false;
	}
}

var textareaForm = '';

function guardarPregunta(frm){
	const rutaNavegador = window.location.search;
    const urlParams = new URLSearchParams(rutaNavegador);
    const id = urlParams.get('id');

	//let id = location.search.substring(1),
	let url = `api/articulos/${id}/pregunta`,
	fd = new FormData(frm),
	usu = JSON.parse(sessionStorage['usuario']);
	
	console.log(frm[0].value);
	textareaForm = frm[0].value;

	fetch(url, {method:'POST',body:fd,headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
		console.log(respuesta);
		if(respuesta.ok){
			respuesta.json().then(function(datos){
				console.log(datos);
				console.log("HOLAAAAAAAAAAAAAAAAAAAA");
				mensajePregunta(true);
				document.querySelector('#dejarPregunta>form').reset();
				//location.reload(true);
			});
		}
		else{
			console.log('Error en la petición fetch de hacer pregunta');
			mensajePregunta(false);
			document.querySelector('#dejarPregunta>form>textarea').focus();
		}    
	});
	return false;
}

function mensajePregunta(value){
	let div, html;

    div = document.createElement('div');
    div.setAttribute('id', 'capa-fondo');

	html = '<article>';
	if(value == true){
		html += '<h2>Mensaje enviado con éxito</h2>';
		html += `<p>Pregunta: ${textareaForm}</p>`;
		borrarHijos('#grupoPreguntas');
		getPreguntasArticulo();
	}else{
		html += '<h2>¡ERROR! </h2>';
		html += `<p>La pregunta: ${textareaForm} no se ha podido enviar con éxito. </p>`;
	}
    html += '<button onclick="cerrarFoto();">Aceptar</button>';
    html += '</article>';

    div.innerHTML = html;
    document.body.appendChild(div);
}