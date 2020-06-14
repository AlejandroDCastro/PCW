/////////////   VARIABLES GLOBALES  /////////////
var paginaActual = 0,
    totalPaginas,
    paramConsulta = '',
    numFotoActual = 1,
    numTotalFotos,
    idArticulo,
    totalFotos,
    loginVendedor,
    botonesResponder,
    descripcionArticulo,
    precioArticulo;



// Funciones para acercarme a JQuery
function $(elemento) {
    return document.querySelector(elemento);
}

function $$(elementos, indice) {
    return document.querySelectorAll(elementos)[indice];
}

function $All(elementos) {
    return document.querySelectorAll(elementos);
}



// Función que se ejecuta cuando se ha cargado todo el DOM de la página
document.addEventListener('DOMContentLoaded', load, false);
function load() {

    if (comprobarSoporteWebStorage()) {

        // Página actual
        let url = location.href,
            ultimoSlash = url.lastIndexOf('/'),
            page = url.substring(ultimoSlash+1);

        // Averiguamos la página en la que estamos...
        page = (page.lastIndexOf('buscar.html') != -1) ? 'buscar.html' : page;
        page = (page.lastIndexOf('articulo.html') != -1) ? 'articulo.html' : page;
        page = (page == ''  ||  page == 'index.html#cabecera') ? 'index.html' : page;

        // Cargamos el contenido dinámico...
        cargarInicio(page);

        // Obtenemos los elementos de las páginas
        let paginas = $All('nav>ul>li>a>span:last-child');

        // Comprobamos si el usuario está logueado o no...
        if (sessionStorage.getItem('usuario')) {

            if (page == 'login.html'  ||  page == 'registro.html') {
                location.href = 'index.html';
            }

            paginas.forEach(function(pagina) {
                let paginaActual = pagina.parentNode.href,
                    ultimoSlash = paginaActual.lastIndexOf('/'), pageActual = paginaActual.substring(ultimoSlash+1);

                if (pagina.innerHTML == 'Entrar'  ||  pagina.innerHTML == 'Registro'  ||  (pageActual == page  &&  pagina.innerHTML != 'Salir')) {
                    pagina.parentNode.parentNode.style.display = 'none';
                }
            });
            
        } else {

            if (page == 'nuevo.html') {
                location.href = 'index.html';
            }

            paginas.forEach(function(pagina) {
                let paginaActual = pagina.parentNode.href,
                    ultimoSlash = paginaActual.lastIndexOf('/'), pageActual = paginaActual.substring(ultimoSlash+1);

                if (pagina.innerHTML == 'Nuevo artículo'  ||  pagina.innerHTML == 'Salir'  ||  pageActual == page) {
                    
                    pagina.parentNode.parentNode.style.display = 'none';
                }
            });

        }
    }
    
}



// Función para comprobar si el navegador soporta WebStorage
function comprobarSoporteWebStorage() {
    if (typeof(Storage) !== 'undefined') {
        return true;
    } else {
        console.warn('WebStorage no soportado. Por favor, actualice su navegador...');
        return false;
    }
}






////////////////////////////////// ÍNDICE //////////////////////////////////////////////////////////////////

// Función para cargar un contenido en función de la página
function cargarInicio(pagina) {

    switch (pagina) {
        
        case 'index.html':
            peticionPaginaArticulos();
            $('#busqueda>form').onsubmit = function() {
                return busquedaRapida();
            };
            cambioPagina();
            break;

        case 'buscar.html':
            if (sessionStorage.getItem('usuario')) {
                $('#seguidos').parentNode.style.display = 'inline-block';
                $('#venta').parentNode.style.display = 'inline-block';
            }
            consultaInicial();
            $('#busquedaGold>form').onsubmit = function() {
                return consultaConParametros();
            };
            break;

        case 'articulo.html':
            informacionArticulo();
            break;

        default:
            console.log('Página desconocida...');
            break;

    }
}

////////////////////////////////// ÍNDICE //////////////////////////////////////////////////////////////////






// Función para pedir los artículos de una determinada página
function peticionPaginaArticulos() {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos?',
        section = $('#articulos>div:nth-child(2)'),
        fotos;
    
    // Completamos la url para el servidor...
    if (paramConsulta != ''  &&  location.href.indexOf('buscar.html') != -1) {
        url += paramConsulta + '&pag=' + paginaActual + '&lpag=6';
    } else if (location.href.indexOf('index.html') != -1) {
        url += 'pag=' + paginaActual + '&lpag=6';
    } else {
        return;
    }

    // Abrimos la petición al servidor...
    xhr.open('GET', url, true);

    // Se ejecuta con problemas en la petición ajenos al servidor...
    xhr.onerror = function() {
        console.warn('Se ha producido un error en la petición...');
    };

    // Si finaliza la conexión con éxito...
    xhr.onload = function() {
        fotos = JSON.parse(xhr.responseText);
        borrarHijos('#articulos>div:nth-child(2)');
        if (fotos.FILAS.length > 0) {

            // Actualizamos paginación...
            totalPaginas = Math.ceil(fotos.TOTAL_COINCIDENCIAS / 6);
            $$('#articulos>div:last-child>p', 2).innerHTML = ` ${paginaActual+1}/${totalPaginas} `;

            // Creamos e incluimos artículos...
            fotos.FILAS.forEach(function(foto) {
                section.appendChild(crearFoto(foto));
            });
        } else {
            $('#articulos>div:nth-child(2)').innerHTML = `<p style="font-size: 1.5em;">No se encontraron resultados.</p>`;
            $$('#articulos>div:last-child>p', 2).innerHTML = ` 0/0 `;
        }
    };

    // Para pasar estos parámetros necesita cabecera con autorización...
    if (paramConsulta.indexOf('mios') != -1  ||  paramConsulta.indexOf('siguiendo') != -1) {
        let usu = JSON.parse(sessionStorage.getItem('usuario')),
            autorizacion = usu.login + ':' + usu.token;

        xhr.setRequestHeader('Authorization', autorizacion);
    }

    // Enviamos la petición al servidor...
    xhr.send();
}



// Función para crear una foto e incluirla en la página
function crearFoto(foto) {
    let articleFoto = document.createElement('article'),
        titulo = document.createElement('h5'),
        enlace = document.createElement('a'),
        parrafo1 = document.createElement('p'),
        parrafo2 = document.createElement('p'),
        parrafo3 = document.createElement('p'),
        img = document.createElement('img'),
        div = document.createElement('div');

    // Parte 1: Encabezados
    titulo.innerHTML = `<a href="articulo.html?id=${foto.id}">${foto.nombre}</a>`;
    articleFoto.appendChild(titulo);

    // Parte 2: Imagen
    enlace.textContent = '';
    img.setAttribute('src', 'fotos/articulos/'+foto.imagen);
    img.setAttribute('alt', 'Foto no disponible');
    img.setAttribute('width', '400');
    img.setAttribute('height', '300');
    enlace.setAttribute('href', 'articulo.html?id=' + foto.id);
    enlace.appendChild(img);
    parrafo1.appendChild(enlace);
    articleFoto.appendChild(parrafo1);

    // Parte 3: Características
    parrafo2 = document.createElement('p');
    parrafo2.innerHTML = `<i class="fas fa-columns"></i> ${foto.nfotos}`;
    articleFoto.appendChild(parrafo2);

    let p1 = document.createElement('p');
    p1.innerHTML = `<i class="fas fa-coins"></i> ${foto.precio}`;
    div.appendChild(p1);

    let p2 = document.createElement('p');
    p2.innerHTML = `<i class="fas fa-eye"></i> ${foto.veces_visto}`;
    div.appendChild(p2);

    let p3 = document.createElement('p');
    p3.setAttribute('class', 'icon-user');
    p3.textContent = ' ' + foto.nsiguiendo;
    div.appendChild(p3);

    let p4 = document.createElement('p');
    p4.innerHTML = `<i class="far fa-calendar-alt"></i> ${getFormatoFecha(foto.fecha, 1)}`;
    div.appendChild(p4);

    articleFoto.appendChild(div);
    parrafo3.textContent = foto.descripcion;
    articleFoto.appendChild(parrafo3);

    return articleFoto;
}



// Función para ejecutar la búsqueda rápida
function busquedaRapida() {
    let texto = $('#busqueda>form>p>input').value;
    
    if (texto != '') {
        location.href = 'buscar.html?t=' + texto;
    }

    // Para que no se recargue, y ejecute a redirección...
    return false;
}



// Función para ejecutar el cambio de pagina de artículos en función del botón
function cambioPagina() {
    let botonera = $All('#articulos>div:last-child>p');
    
    // Volver al inicio...
    botonera[0].onclick = function() {
        if (paginaActual > 0) {
            paginaActual = 0;
            borrarHijos('#articulos>div:nth-child(2)');
            peticionPaginaArticulos();
        }
    };

    // Una página atrás...
    botonera[1].onclick = function() {
        if (paginaActual > 0) {
            paginaActual--;
            borrarHijos('#articulos>div:nth-child(2)');
            peticionPaginaArticulos();
        }
    };

    // Una página adelante...
    botonera[3].onclick = function() {
        if (paginaActual < totalPaginas-1) {
            paginaActual++;
            borrarHijos('#articulos>div:nth-child(2)');
            peticionPaginaArticulos();
        }
    };

    // Ir a la última página...
    botonera[4].onclick = function() {
        if (paginaActual < totalPaginas-1) {
            paginaActual = totalPaginas-1;
            borrarHijos('#articulos>div:nth-child(2)');
            peticionPaginaArticulos();
        }
    };
}



// Función para limpiar todos los artículos de una página para añadir nuevos
function borrarHijos(elemento) {
    let lista = $(elemento);

    while (lista.hasChildNodes()) {
        lista.removeChild(lista.firstChild);
    }
}



// Función para ejecutar la posible consulta inicial que pueda instanciarse en la url
function consultaInicial() {
    let url = location.href,
        ultimoSlash = url.lastIndexOf('?'),
        cadena, parametro;

    if (ultimoSlash > -1) {
        parametro = url.charAt(ultimoSlash+1);
        cadena = url.substring(ultimoSlash+3, url.length);
        if (parametro == 't') {
            $('#buscar').value = corrigeCodificacion(cadena);
        } else {
            $('#vendedor').value = corrigeCodificacion(cadena);
        }
        consultaConParametros();
    }
}



// Función que corrige los carácteres que no se pueden mostrar con la codificación UTF-8
function corrigeCodificacion(frase) {
	var frase = frase;

	while (frase.search("%") > -1) {
		frase = frase.replace("%20", " ");
		frase = frase.replace("%C3%A1", "á");
		frase = frase.replace("%C3%A9", "é");
		frase = frase.replace("%C3%AD", "í");
		frase = frase.replace("%C3%B3", "ó");
		frase = frase.replace("%C3%BA", "ú");
		frase = frase.replace("%C3%81", "Á");
		frase = frase.replace("%C3%89", "É");
		frase = frase.replace("%C3%8D", "Í");
		frase = frase.replace("%C3%93", "Ó");
		frase = frase.replace("%C3%9A", "Ú");
		frase = frase.replace("%C3%B1", "ñ");
		frase = frase.replace("%C3%91", "Ñ");
	}

	return frase;
}



// Función para realizar una consulta de artículos mediante filtrados
function consultaConParametros() {
    let devuelve = '',
        fd = new FormData($('#busquedaGold>form'));

    if (fd.get('buscar') != ''  &&  fd.get('buscar') != ' ') {
        devuelve += '&t=' + fd.get('buscar');
    }

    if (fd.get('vendedor') != ''  &&  fd.get('vendedor') != ' ') {
        devuelve += '&v=' + fd.get('vendedor');
    }

    if (fd.get('categoria') != ''  &&  fd.get('categoria') != ' ') {
        devuelve += '&c=' + fd.get('categoria');
    }

    if (fd.get('desde') != ''  &&  fd.get('desde') != ' ') {
        devuelve += '&pd=' + fd.get('desde');
    }

    if (fd.get('hasta') != ''  &&  fd.get('hasta') != ' ') {
        devuelve += '&ph=' + fd.get('hasta');
    }

    if (sessionStorage.getItem('usuario')) {
        devuelve += (fd.get('seguidos')) ? '&siguiendo' : '';
        devuelve += (fd.get('venta')) ? '&mios' : '';
    }

    if (devuelve != '') {
        devuelve = devuelve.substring(1, devuelve.length);
    }

    // Una vez tenemos los parametros ejecutamos petición...
    paramConsulta = devuelve;
    peticionPaginaArticulos();

    return false;
}



// Función para cargar la información de un artículo
function informacionArticulo() {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos/',
        pagina = location.href;
    
    idArticulo = pagina.substring(pagina.lastIndexOf('?') + 4);

    // Si no hay parametro redirigimos a index...
    if (idArticulo == ''  ||  location.search == '') {
        location.href = 'index.html';
    }

    // Efectuamos la petición...
    xhr.open('GET', url+idArticulo, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);

        // Se ejecuta si existe dicha foto
        if (respuesta.FILAS.length > 0) {
            let articulo = respuesta.FILAS[0],
                sectionInfo = $('#infoArticulo');

            numTotalFotos = articulo.nfotos;
            idArticulo = articulo.id;

            // Obtenemos todas las fotos del artículo...
            getTotalFotosArticulo();

            // Obtenemos todas las preguntas del artículo...
            getPreguntasArticulo();

            // Modificamos la página...
            //sectionInfo.appendChild(crearCabeceraInfoArticulo(articulo));
            //sectionInfo.appendChild(crearCuerpoInfoVendedor(articulo));
            let divCuerpo   = crearCuerpoInfoVendedor(articulo),
                divCabecera = crearCabeceraInfoArticulo(articulo);

            sectionInfo.appendChild(divCabecera);
            sectionInfo.appendChild(divCuerpo);
            sectionInfo.innerHTML += `<p>${articulo.descripcion}</p>`;
            descripcionArticulo = articulo.descripcion;
            precioArticulo = articulo.precio;

            // Evento para cambiar de foto
            cambiarFoto();
        } else {
            location.href = index.html;
        }

    };
    
    if (sessionStorage.getItem('usuario')) {
        let usu = JSON.parse(sessionStorage.getItem('usuario')),
            autorizacion = usu.login + ':' + usu.token;

        xhr.setRequestHeader('Authorization', autorizacion);
    }
    xhr.send();
}



// Función para crear la cabecera de la información de una foto
function crearCabeceraInfoArticulo(articulo) {
    let div = document.createElement('div'),
        cabeceraFoto = cabeceraFotoArticulo(articulo.imagen);

    div.innerHTML = `<figure>${cabeceraFoto.innerHTML}</figure>`;
    div.innerHTML += `<article>
                        <h5>${articulo.nombre}</h5>
                        <p><i class="fas fa-coins"></i> ${articulo.precio} €</p>
                        <p><i class="fas fa-eye"></i> ${articulo.veces_visto}</p>
                        <p class="icon-user"> ${articulo.nsiguiendo}</p>
                        <p class="icon-comment"> <a href="#grupoPreguntas">${articulo.npreguntas}</a></p>`;

    if (sessionStorage.getItem('usuario')) {
        let usu = JSON.parse(sessionStorage.getItem('usuario'));

        if (articulo.estoy_siguiendo == '0') {
            div.innerHTML += `<p>
                                <button class="boton">Seguir</button>
                            </p>`;
        } else {
            div.innerHTML += `<p>
                                <button class="boton">Siguiendo</button>
                            </p>`;
        }

        if (usu.login == loginVendedor) {
            div.innerHTML += `<p>
                                <button style="margin-top: 15px;" class="boton">Mofificar artículo</button>
                            </p>`;
            div.innerHTML += `<p>
                                <button style="margin-top: 15px;" class="boton">Eliminar artículo</button>
                            </p>`;
        }
    }
                        
    div.innerHTML += `</article>`;

    return div;
}



// Función para crear la foto de información del artículo
function cabeceraFotoArticulo(imagen) {
    let figure = document.createElement('figure');

    figure.innerHTML = `<img src="fotos/articulos/${imagen}" alt="Foto no disponible" width="400">
        <p><i class="fas fa-arrow-left"></i> <span>  1 de ${numTotalFotos}  </span> <i class="fas fa-arrow-right"></i></p>`;

    return figure;
}



// Función para crear la información de un vendedor que vende un determinado producto
function crearCuerpoInfoVendedor(articulo) {
    let div = document.createElement('div');

    div.innerHTML += `<article>
                        <h5><img src="fotos/usuarios/${articulo.foto_vendedor}" alt="Foto no disponible" width="200"></h5>
                        <p>Vendedor: <a href="buscar.html?v=${articulo.vendedor}">${articulo.vendedor}</a></p>
                    </article>`;
    loginVendedor = articulo.vendedor;

    return div;
}



// Función para cambiar de foto al mostrar la información de un artículo
function cambiarFoto() {
    let botonera = $All('#infoArticulo>div>figure>p>i');
    
    botonera[0].onclick = function() {
        if (numFotoActual > 1) {
            numFotoActual--;
            pasaSiguienteFoto();
        }
    };

    botonera[1].onclick = function() {
        if (numFotoActual < numTotalFotos) {
            numFotoActual++;
            pasaSiguienteFoto();
        }
    };
}



// Función para realizar la petición al servidor de la nueva foto del artículo
function getTotalFotosArticulo() {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos/' + idArticulo + '/fotos';

    xhr.open('GET', url, true);
    xhr.onload = function() {
        totalFotos = JSON.parse(xhr.responseText).FILAS;
    };
    xhr.send();
}



// Función para pasar a la siguiente foto indicada
function pasaSiguienteFoto() {
    let imagen   = $('#infoArticulo>div>figure>img'),
        botonera = $('#infoArticulo>div>figure>p>span'),
        archivo  = totalFotos[numFotoActual-1].fichero;

    imagen.setAttribute('src', 'fotos/articulos/'+archivo);
    botonera.innerHTML = `  ${numFotoActual} de ${numTotalFotos}  `;
}



// Función para obtener todas las preguntas de un artículo
function getPreguntasArticulo() {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos/' + idArticulo + '/preguntas';

    xhr.open('GET', url, true);
    xhr.onload = function() {
        let preguntas = JSON.parse(xhr.responseText).FILAS,
            section   = $('#grupoPreguntas');
        
        if (preguntas.length > 0) {
            botonesResponder = new Array();

            // Creamos y posicionamos preguntas en la página
            preguntas.forEach(function(pregunta) {
                section.appendChild(crearPreguntaArticulo(pregunta));
            });

            // Escuchamos los eventos de la página
            eventosPaginaArticulo();
        } else {
            $('#grupoPreguntas').innerHTML += `<div><p style="font-size: 1.2em; padding-top: 35px; text-align: center; font-weight: initial;">Este artículo no tiene preguntas.</p><div>`;
        }
    };

    if (sessionStorage.getItem('usuario')) {
        let usu = JSON.parse(sessionStorage.getItem('usuario')),
            autorizacion = usu.login + ':' + usu.token;

        xhr.setRequestHeader('Authorization', autorizacion);
    }
    xhr.send();
}



// Función para crear una pregunta en la zona de preguntas de una artículo
function crearPreguntaArticulo(pregunta) {
    let div = document.createElement('div'),
        fecha = getFormatoFecha(pregunta.fecha_hora, 2),
        usu = undefined;

    div.setAttribute('id', 'pregunta' + pregunta.id);
    if (sessionStorage.getItem('usuario')) {
        usu = JSON.parse(sessionStorage.getItem('usuario'));
    }

    div.innerHTML = `<p class="icon-user">${pregunta.login} <time datetime="${pregunta.fecha_hora}">${fecha}</time></p>
    <p>${pregunta.pregunta}</p>`;

    if (pregunta.respuesta != null) {
        div.innerHTML += `<div>
                            <p class="icon-user">${loginVendedor}</p>
                            <p>${pregunta.respuesta}</p>
                        </div>`;
    } else if (usu != undefined  &&  usu.login == loginVendedor) {
        let span = document.createElement('span'),
            boton = document.createElement('button');
    
        boton.setAttribute('class', 'boton');
        boton.textContent = 'Responder';
        span.appendChild(boton);
        botonesResponder.push(new Array(boton, pregunta.id));
        div.appendChild(span);
    }
    
    return div;
}



// Función para obtener la hora
function getFormatoFecha(objFecha, tipo) {
    let devuelve  = '',
        fechaHora = objFecha.split(' '),
        fecha     = fechaHora[0].split('-'),
        hora      = fechaHora[1];

    let mes = fecha[1];
    switch (mes) {
        case '01':
            mes = 'enero';
            break;
        case '02':
            mes = 'febrero';
            break;
        case '03':
            mes = 'marzo';
            break;
        case '04':
            mes = 'abril';
            break;
        case '05':
            mes = 'mayo';
            break;
        case '06':
            mes = 'junio';
            break;
        case '07':
            mes = 'julio';
            break;
        case '08':
            mes = 'agosto';
            break;
        case '09':
            mes = 'septiembre';
            break;
        case '10':
            mes = 'octubre';
            break;
        case '11':
            mes = 'noviembre';
            break;
        case '12':
            mes = 'diciembre';
            break;
    }

    if (tipo == 1) {
        devuelve = fecha[2] + '-' + mes.substring(0,3) + '-' + fecha[0];
    } else {
        devuelve = fecha[2] + '-' + mes + '-' + fecha[0];
        devuelve += ', a las ' + hora.substring(0, 5);
    }

    return devuelve;
}



// Función para ejecutar los eventos de la página artículo
function eventosPaginaArticulo() {

    // Si hay botones de respuestas los activamos
    botonesResponder.forEach(function(boton) {
        boton[0].onclick = function() {
            mostrarAreaRespuesta(boton[1]);
        };
    });

    // Podemos seguir y dejar de seguir el artículo
    let boton = $('#infoArticulo>div>p:nth-child(3)>button');
    if (boton != undefined) {
        boton.onclick = function() {
            let seguir = (boton.textContent == 'Seguir') ? true : false;
            peticionSeguimientoArticulo(seguir);
        }
    }

    // Si el login es el vendedor podemos modificar y eliminar el artículo...
    let botonModificar = $('#infoArticulo>div>p:nth-child(4)>button');
    if (botonModificar != undefined) {
        botonModificar.addEventListener('click', ventanaModificarArticulo);
    }
    let botonEliminar = $('#infoArticulo>div>p:nth-child(5)>button');
    if (botonEliminar != undefined) {
        botonEliminar.addEventListener('click', ventanaEliminarArticulo);
    }
}



// Función para mostrar el área de respuesta a una pregunta
function mostrarAreaRespuesta(id) {
    let preguntaId = '#pregunta' + id,
        textarea = document.createElement('textarea'),
        boton    = $(preguntaId + '>span'),
        div      = $(preguntaId),
        newBoton = document.createElement('button');

    textarea.setAttribute('style', 'width:100%; height:70px');
    newBoton.setAttribute('class', 'boton');
    newBoton.textContent = 'Enviar';
    div.insertBefore(textarea, boton);
    boton.replaceChild(newBoton, boton.firstChild);

    newBoton.onclick = function() {
        let respuesta = textarea.value;
        
        if (respuesta != '') {
            enviarRespuestaPregunta(id, respuesta);
        }
    };
}



// Función para enviar la respuesta al sevidor de una pregunta y actualizar la sección
function enviarRespuestaPregunta(id, respuesta) {
    let xhr = new XMLHttpRequest(),
        url = 'api/preguntas/' + id + '/respuesta',
        fd = new FormData(),
        usu = JSON.parse(sessionStorage.getItem('usuario')),
        autorizacion = usu.login + ':' + usu.token;

    fd.append('texto', respuesta);
    xhr.open('POST', url, true);
    xhr.onload = function() {
        let objeto = JSON.parse(xhr.responseText);
        
        if (objeto.RESULTADO == 'OK') {

            // Actualizamos la sección de preguntas
            borrarHijos('#grupoPreguntas');
            $('#grupoPreguntas').innerHTML = `<h5>Preguntas sobre el artículo</h5>`;
            getPreguntasArticulo();
        } else {
            console.error('No se ha podido guardar la respuesta');
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send(fd);
}



// Función para realizar la petición para seguir o dejar de seguir un artículo
function peticionSeguimientoArticulo(seguir) {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos/' + idArticulo + '/seguir/' + seguir,
        usu = JSON.parse(sessionStorage.getItem('usuario')),
        autorizacion = usu.login + ':' + usu.token;
    
    xhr.open('POST', url, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);
        if (respuesta.RESULTADO == 'OK') {
            let parrafo    = $('#infoArticulo>div>article>p:nth-child(4)'),
                seguidores = parseInt(parrafo.textContent),
                boton      = $('#infoArticulo>div>p:nth-child(3)>button');

            // Cambiamos mensaje del botón y número de seguidores...
            boton.textContent = (seguir) ? 'Siguiendo' : 'Seguir';
            parrafo.textContent = ' ';
            parrafo.textContent += (seguir) ? (++seguidores) : (--seguidores);

            eventosPaginaArticulo();
        } else {
            console.log(respuesta.DESCRIPCION);
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send();
}



// Función para modificar un artículo
function ventanaModificarArticulo() {
    let body         = $('body'),
        div          = document.createElement('div'),
        botonCerrar  = document.createElement('button'),
        botonAceptar = document.createElement('button'),
        article      = document.createElement('article');
        
    div.setAttribute('class', 'mensajeModal');
    article.innerHTML = `<h2>MODIFICAR ARTÍCULO</h2>
                        <form class="formResultado" onsubmit="return peticionModificarArticulo(this);">
                            <p>
                                <label for="precio">Precio:<label>
                                <input min="0" value="${precioArticulo}" type="number" id="precio" name="precio">
                            </p>
                            <p>
                                <label for="descripcion">Descripción:<label>
                                <textarea id="descripcion" name="descripcion">${descripcionArticulo}</textarea>
                            </p>
                        </form>`;
    botonCerrar.textContent = 'Cerrar';
    botonCerrar.setAttribute('style', 'background-color: #f00');
    botonAceptar.textContent = 'Aceptar';
    botonAceptar.setAttribute('style', 'background-color: #0f0');

    article.appendChild(botonCerrar);
    article.appendChild(botonAceptar);
    div.appendChild(article);

    // Si el usuario pulsa un botón
    botonCerrar.onclick = function() {
        body.lastChild.remove();
    };
    botonAceptar.onclick = function() {
        $('.mensajeModal form').onsubmit = peticionModificarArticulo($('.mensajeModal form'));
    };

    body.appendChild(div);
}



// Función para realizar la petición para modificar un artículo
function peticionModificarArticulo(form) {
    let xhr = new XMLHttpRequest(),
        fd  = new FormData(form),
        url = 'api/articulos/' + idArticulo,
        usu = JSON.parse(sessionStorage.getItem('usuario')),
        autorizacion = usu.login + ':' + usu.token;

    xhr.open('POST', url, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);
        
        if (respuesta.RESULTADO == 'OK') {
            
            // Actualizamos la página...
            descripcionArticulo = fd.get('descripcion');
            precioArticulo = fd.get('precio');
            $('#infoArticulo>p').textContent = descripcionArticulo;
            $('#infoArticulo>div>article>p:nth-child(2)').innerHTML = `<p><i class="fas fa-coins"></i> ${precioArticulo} €</p>`;

            // Cerramos mensaje modal...
            $('body').lastChild.remove();
        } else {
            console.error('No se ha podido modificar el artículo...');
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send(fd);

    return false;
}



// Función para eliminar un artículo
function ventanaEliminarArticulo() {
    let body         = $('body'),
        div          = document.createElement('div'),
        botonCerrar  = document.createElement('button'),
        botonAceptar = document.createElement('button'),
        article      = document.createElement('article');
        
    div.setAttribute('class', 'mensajeModal');
    article.innerHTML = `<h2>MODIFICAR ARTÍCULO</h2>
                        <p>¿Deseas eliminar este artículo que tienes a la venta?</p>`;
    botonCerrar.textContent = 'Cerrar';
    botonCerrar.setAttribute('style', 'background-color: #f00');
    botonAceptar.textContent = 'Aceptar';
    botonAceptar.setAttribute('style', 'background-color: #0f0');

    article.appendChild(botonCerrar);
    article.appendChild(botonAceptar);
    div.appendChild(article);

    // Si el usuario pulsa un botón
    botonCerrar.onclick = function() {
        body.lastChild.remove();
    };
    botonAceptar.onclick = function() {
        peticionEliminarArticulo();
    };

    body.appendChild(div);
}



// Función para hacer una petición al servidor para eliminar artículos
function peticionEliminarArticulo() {
    let xhr = new XMLHttpRequest(),
        url = 'api/articulos/' + idArticulo,
        usu = JSON.parse(sessionStorage.getItem('usuario')),
        autorizacion = usu.login + ':' + usu.token;

    xhr.open('DELETE', url, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);
        
        if (respuesta.RESULTADO == 'OK') {

            // Cerramos mensaje modal y redirigimos a index
            $('body').lastChild.remove();
            location.href = 'index.html';
        } else {
            console.error('No se ha podido ELIMINAR el artículo...');
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send();
}