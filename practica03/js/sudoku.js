//VARIABLES GLOBALES
var checkbox, ctx,
    posX, posY,
    puntos, id, token,
    sudokuPequenyo, sudokuGrande,
    coordMove = new Array(3), // PosX, PosY, modificable
    coordClick = new Array(2),
    pickMode = false,
    coordFail = undefined;


/*
window.onload = function() {
    console.log(sudokuPequenyo);
    console.log(sudokuGrande);

    if(document.getElementById('inicio')){
        document.getElementById('inicio').addEventListener("click", iniciar);
    }
    
};*/

// Función que se ejecuta cuando se ha cargado todo el DOM de la página
document.addEventListener('DOMContentLoaded', load, false);
function load() {

    prepararCanvas(480, 480);
    rejilla(4);
    rejilla(2);

    document.getElementById('inicio').addEventListener("click", iniciar);
    
    let elementosDelForm = document.getElementsByTagName('input');

    for(var i=0; i<elementosDelForm.length;i++) {
        if (elementosDelForm[i].type == 'radio') {
            elementosDelForm[i].addEventListener("click", cambiarCanvas);
        }
    }

    /*
    document.querySelectorAll('input[type="radio"]').onkeypress = function(){
        let checkbox = document.querySelector('input[type="radio"]:checked').value;
        if(checkbox == '4'){
            prepararCanvas(480, 480);
            rejilla(4);
            rejilla(2);
        }else{
            prepararCanvas(640, 640);
            rejilla(9);
            rejilla(3);
        }
    };
    */
    //document.querySelector('input[type="radio"]').addEventListener("change", cambiarCanvas);
}


function cambiarCanvas(){
    let checkbox = document.querySelector('input[type="radio"]:checked').value;
    if(checkbox == '4'){
        prepararCanvas(480, 480);
        rejilla(4);
        rejilla(2);
    }else{
        prepararCanvas(640, 640);
        rejilla(9);
        rejilla(3);
    }
}


function prepararCanvas(x, y){
    let cv = document.querySelector('#cv01');

    cv.width = x;
    cv.height = y;
}

function iniciar(){
    let html = '',
        checkbox = document.querySelector('input[type="radio"]:checked').value;
    console.log('Empieza el juego...');

    console.log(checkbox);
    html = '<h2>Panel del juego</h2>';
    if (checkbox == '4') {
        html += `<form>
                <input type="radio" id="tam1" name="size" value="4" disabled checked><label for="tam1"> 4</label>
                <input type="radio" id="tam2" name="size" value="9" disabled><label for="tam2"> 9</label>
            </form>`;
    } else {
        html += `<form>
                <input type="radio" id="tam1" name="size" value="4" disabled><label for="tam1"> 4</label>
                <input type="radio" id="tam2" name="size" value="9" disabled checked><label for="tam2"> 9</label>
            </form>`;
    }
    html += '<h3 id="puntua">Puntos: </h3>';
    html += '<div class="crono">';
    html += '<output id="crono-si">00:00:00</output>';
    html += '</div>';
    html += '<button type="button" onclick="comprueba(false);">Comprobar</button>';
    html += '<button type="button" onclick="peticionFinalizarPartida()">Finalizar</button>';
    html += '<canvas id="cv01"></canvas>';
    html += '<div id="numeros"></div>';
    document.getElementById('canvas').innerHTML = html;

    if(checkbox == 4){
        sudokuPequenyo = new Array(4);
        for(let x = 0; x < 4; x++){
            sudokuPequenyo[x] = new Array(4);
        }
        prepararCanvas(480, 480);
        rejilla(4);
        //Llamamos otra vez para poner más gorda la linea central 
        //rejilla(2);
    }else{
        sudokuGrande = new Array(9);
        for(let x = 0; x < 9; x++){
            sudokuGrande[x] = new Array(9);
        }
        prepararCanvas(640, 640);
        rejilla(9);
        //rejilla(3);
    }

    generarSudoku(checkbox);

    document.querySelector('#crono-si').innerHTML = '00:00:00';
    document.querySelector('#crono-si').setAttribute('data-valor', '0');
    //No hace falta volverlo a llamar ya que él solo establece un tiempo
    let idTemp = setInterval(actualizarSI, 1000); //Ejecutará la función cada segundo
    document.querySelector('#crono-si').setAttribute('data-id-temp', idTemp);
}



function generarSudoku(tam){
    let url = `api/sudoku/generar/`;
    url += tam;

    console.log("Envío esta url: " + url);

    fetch(url, {method:'POST'}).then(function(respuesta){
        console.log(respuesta)
		if(respuesta.ok){
			respuesta.json().then(function(datos){
                console.log(datos);
                sessionStorage['sudoku'] = JSON.stringify(datos);
                console.log(datos.TOKEN);
                pintaSudoku(tam);
                id = datos.ID;
			});
		}else
			console.log('Error en la petición fetch');
	});

	return false;
}



function actualizarSI(){
    //Tomar el nº de segundos que tengo acumulados en el query selector
    let valor = parseInt(document.querySelector('#crono-si').getAttribute('data-valor')) + 1,
    horas = Math.floor(valor/3600); //nos quedamos con la parte entera, etc
    minutos = Math.floor((valor - horas * 3600) / 60), 
    segundos = valor - horas * 3600 - minutos * 60;
    //Transformarlo en el formato de horas, minutos, segundos

    horas = (horas < 10?'0':'') + horas;
    minutos = (minutos < 10?'0':'') + minutos;
    segundos = (segundos < 10?'0':'') + segundos;

    document.querySelector('#crono-si').innerHTML = `${horas}:${minutos}:${segundos}`;
    document.querySelector('#crono-si').setAttribute('data-valor', valor);
}

function peticionFinalizarPartida(){
    let idTemp = document.querySelector('#crono-si').getAttribute('data-id-temp'),
        xhr = new XMLHttpRequest(),
        url = 'api/sudoku/' + id,
        sudo = JSON.parse(sessionStorage['sudoku']),
        autorizacion = sudo.TOKEN;

    xhr.open('DELETE', url, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);
        console.log(respuesta);
        if (respuesta.RESULTADO == 'OK') {
            //Para el temporizador
            clearInterval(idTemp);
            console.log("Se ha eliminado la partida. ");
            limpiar();
        } else {
            console.error('No se ha podido ELIMINAR la partida...');
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send();
}

/*
function verCasillas(regiones){
    let cv = document.querySelector('canvas');

    // Mover el ratón por encima de las casillas...
    cv.onmousemove = function(evt) {
        let columna = Math.floor(evt.offsetX / ancho),
            fila    = Math.floor(evt.offsetY / alto),
            tablero = (checkbox == 4) ? sudokuPequenyo : sudokuGrande;

        console.log('Move: ' + fila + ' - ' + columna);
    }

    // Click sobre una casilla del sudoku...
    cv.onclick = function(evt){
        console.log("Regiones: " + regiones);
        console.log('CLICK: ' + evt.offsetX + ' - ' + evt.offsetY);

        let columna = Math.floor(evt.offsetX / ancho);
        let fila = Math.floor(evt.offsetY / alto);

        console.log(fila + ' - ' + columna);
    }
}
*/
function rejilla(value){
    let cv = document.querySelector('canvas'),
    ctx = cv.getContext('2d'),
    regiones = value,
    ancho = cv.width / regiones,
    alto = cv.height / regiones;

    if(value == 2 || value == 3){
        ctx.lineWidth = 5;
    }else{
        ctx.lineWidth = 2;
    }

    ctx.beginPath();
    ctx.strokeStyle = '#727272';

    
    //Dibuja la rejilla entera
    for (let x=0; x < cv.width; x=x+ancho){
        ctx.moveTo(x,0);
        ctx.lineTo(x,cv.width);
    }
    
    for (let y=0; y < cv.height; y=y+alto){
        ctx.moveTo(0,y);
        ctx.lineTo(cv.height,y);
    }

    //Dibuja las líneas horizontales y verticales centrales
    for(let i = 0; i < regiones; i++){
        //Verticales
        ctx.moveTo(i * ancho, 0);
        ctx.lineTo(i * ancho, cv.height);
        //Horizontales
        ctx.moveTo(0, i * alto);
        ctx.lineTo(cv.width, i * alto);
    }

    ctx.stroke();
}




function pintaSudoku(regiones){
    let cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        ancho = cv.width / regiones,
        alto = cv.height / regiones,
        sudo = JSON.parse(sessionStorage['sudoku']),
        tablero = sudo.SUDOKU;

    console.log("Regiones: " + regiones);
    ctx.beginPath();

    for(let i = 0; i < regiones; i++){
        for(let j = 0; j < regiones; j++){
            if(tablero[i][j] != 0){
                ctx.fillStyle = '#B2B6B7';
            }else{
                ctx.fillStyle = '#CFD8DC';
            }
            ctx.fillRect(ancho * j + 1, alto * i + 1, ancho-2, alto-2);
            ctx.stroke();
        }
    }

    if(regiones == 4)
        rejilla(2);
    else
        rejilla(3);

    escribirNumeros(regiones);
}

function escribirNumeros(num){
    let cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        sudo = JSON.parse(sessionStorage['sudoku']),
        ancho = Math.floor(cv.width / sudo.SUDOKU.length),
        alto = Math.floor(cv.height /sudo.SUDOKU[0].length),
        tablero = sudo.SUDOKU;

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif, arial';
    
    for(let x = 0; x < num; x++){
        for(let y = 0; y < num; y++){
            ctx.beginPath();
            if (tablero[x][y] != 0) {
                ctx.fillStyle = '#FF8300';
                ctx.fillText(tablero[x][y], y * ancho+(ancho/2), x * alto+(alto/1.6));
            }
            if(num == 4){
                sudokuPequenyo[x][y] = tablero[x][y];
            }else{
                sudokuGrande[x][y] = tablero[x][y];
            }
            ctx.stroke();
        }
    }

    casillasDeNumeros(num);
}

//Función que despliega los números a insertar en las casillas mediante botones
function casillasDeNumeros(regiones){
    let sudo = JSON.parse(sessionStorage['sudoku']),
        cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'), x, y,
        tablero = sudo.SUDOKU, html = '',
        ancho = cv.width / regiones,
        alto = cv.height / regiones;

    
    // Mover el ratón por encima de las casillas...
    cv.onmousemove = function(evt) {

        // Cambiamos estilo de las casillas erroneas
        if (coordFail != undefined) {
            coordFail.forEach(function(casilla) {
                pintarCasillaFallo(casilla.fila, casilla.columna, '#CFD8DC');
            });
            coordFail = undefined;
        }
        
        let columna = Math.floor(evt.offsetX / ancho),
            fila    = Math.floor(evt.offsetY / alto),
            pinta   = false, numero = 0;

        // Comprobamos si la posicion es modificable
        if (regiones == 4) {
            if (fila >= 0  &&  columna >=0  &&  fila < 4  &&  columna < 4  &&  tablero[fila][columna] == 0) {
                pinta = true;

                // Comprobamos si la posicion tenia un numero seleccionado
                if (sudokuPequenyo[fila][columna] != 0)
                    numero = sudokuPequenyo[fila][columna];
            }
        } else {
            if (fila >= 0  &&  columna >=0  &&  fila < 9  &&  columna < 9  &&  tablero[fila][columna] == 0) {
                pinta = true;

                // Comprobamos si la posicion tenia un numero seleccionado
                if (sudokuGrande[fila][columna] != 0)
                    numero = sudokuGrande[fila][columna];
            }
        }


        if (!pickMode) {

            // Pintamos la casilla
            if (pinta) {
                ctx.beginPath();
                ctx.fillStyle = '#fadfb7';
                ctx.fillRect(ancho * columna + 1, alto * fila + 1, ancho-2, alto-2);
                ctx.stroke();
                cv.style.cursor = 'pointer';
                if (numero != 0) {
                    ctx.beginPath();
                    ctx.fillStyle = '#FF8300';
                    ctx.fillText(numero, columna * ancho+(ancho/2), fila * alto+(alto/1.6));
                    ctx.stroke();
                }
            }

            // Cambiamos el estilo de la anterior si es necesario
            if (fila != coordMove[0]  ||  columna != coordMove[1]) {

                // Si la casilla anterior era modificable o no estaba ocupada por un numero estático...
                if (coordMove[2] == undefined  ||  coordMove[2] == false) {
                    ctx.beginPath();
                    cv.style.cursor = 'initial';
                    ctx.fillStyle = '#cfd8dc';
                    ctx.fillRect(ancho * coordMove[1] + 1, alto * coordMove[0] + 1, ancho-2, alto-2);
                    ctx.stroke();
                    
                    // Si dicha casilla ya tenia un numero
                    let numAnterior;
                    if (coordMove[0] != undefined  &&  coordMove[1] != undefined) {
                        if (regiones == 4)
                            numAnterior = sudokuPequenyo[coordMove[0]][coordMove[1]];
                        else
                            numAnterior = sudokuGrande[coordMove[0]][coordMove[1]];
                        if (numAnterior != 0) {
                            ctx.beginPath();
                            ctx.fillStyle = '#FF8300';
                            ctx.fillText(numAnterior, coordMove[1] * ancho+(ancho/2), coordMove[0] * alto+(alto/1.6));
                            ctx.stroke();
                        }
                    }
                }
                coordMove[0] = fila;
                coordMove[1] = columna;
                coordMove[2] = (pinta) ? false : true;
            }
            
            if(regiones == 4)
                rejilla(2);
            else    
                rejilla(3);
        } else {

            if (pinta) {
                cv.style.cursor = 'pointer';
            } else {
                cv.style.cursor = 'initial';
            }
        }
    }

    
    // Sacar el ratón fuera del canvas...
    cv.onmouseout = function(evt) {
        if (!pickMode) {
            if (coordMove[2] == undefined  ||  coordMove[2] == false) {
                ctx.beginPath();
                cv.style.cursor = 'initial';
                ctx.fillStyle = '#cfd8dc';
                ctx.fillRect(ancho * coordMove[1] + 1, alto * coordMove[0] + 1, ancho-2, alto-2);
                ctx.stroke();

                let num;
                if (sudo.SUDOKU.length == 4)
                    num = sudokuPequenyo[coordMove[0]][coordMove[1]];
                else
                    num = sudokuGrande[coordMove[0]][coordMove[1]];
                if (num != 0) {
                    ctx.beginPath();
                    ctx.fillStyle = '#FF8300';
                    ctx.fillText(num, coordMove[1] * ancho+(ancho/2), coordMove[0] * alto+(alto/1.6));
                    ctx.stroke();
                }
                if(regiones == 4)
                    rejilla(2);
                else    
                    rejilla(3);
            }
            coordMove[0] = undefined;
            coordMove[1] = undefined;
            coordMove[2] = undefined;
        } else {
            cv.style.cursor = 'initial';
        }
    }
    


    // Pulsar sobre una casilla
    cv.onclick = function(evt){
        console.log("Click " + evt.offsetX + '-' + evt.offsetY);
        y = Math.floor(evt.offsetX/(cv.width/sudo.SUDOKU.length)),
        x = Math.floor(evt.offsetY/(cv.height/sudo.SUDOKU.length));

        console.log(x + " - " + y);

        if(tablero[x][y] == 0){

            // Ocultamos las casillas seleccionadas
            if (coordClick[0] != undefined  &&  coordClick[1] != undefined) {
                pintarCasillasAdyacentes(coordClick[0], coordClick[1], '#cfd8dc');

            /*    ctx.beginPath();
                ctx.fillStyle = '#cfd8dc';
                ctx.fillRect(ancho * y + 1, alto * x + 1, ancho-2, alto-2);
                ctx.stroke();
                let num = (sudo.SUDOKU.length == 4) ? sudokuPequenyo[coordClick[0]][coordClick[1]] : sudokuGrande[coordClick[0]][coordClick[1]];
                if (num != 0) {
                    ctx.beginPath();
                    ctx.fillStyle = '#FF8300';
                    ctx.fillText(num, coordClick[1] * ancho+(ancho/2), coordClick[0] * alto+(alto/1.6));
                    ctx.stroke();
                }*/

                ctx.beginPath();
                ctx.strokeStyle = '#727272';
                for(let i = 0; i < sudo.SUDOKU.length; i++){
                    //Verticales
                    ctx.moveTo(i * ancho, 0);
                    ctx.lineTo(i * ancho, cv.height);
                    //Horizontales
                    ctx.moveTo(0, i * alto);
                    ctx.lineTo(cv.width, i * alto);
                }
                ctx.stroke();
            }

            // Mostramos las casillas afectadas
            pintarCasillasAdyacentes(x, y, '#fadfb7');

            // Pintamos la casilla seleccionada
            ctx.beginPath();
            ctx.strokeStyle = '#a00';
            ctx.lineWidth = 4;
            ctx.rect(ancho * y + 1, alto * x + 1, ancho-2, alto-2);
            ctx.fillStyle = '#ffa94d';
            ctx.fillRect(ancho * y + 1, alto * x + 1, ancho-2, alto-2);
            ctx.stroke();
            let num;
            if (sudo.SUDOKU.length == 4)
                num = sudokuPequenyo[x][y];
            else
                num = sudokuGrande[x][y];
            if (num != 0) {
                ctx.beginPath();
                ctx.fillStyle = '#FF8300';
                ctx.fillText(num, y * ancho+(ancho/2), x * alto+(alto/1.6));
                ctx.stroke();
            }

            // Mostramos las opciones o numeros a elegir por el usuario
            html = '<h3>Números disponibles</h3>';
            if(sudo.SUDOKU.length == 4){
                for(let i = 1; i < 5; i++){
                    if(i == 1)
                        html += `<button onclick="pintarCasilla(${x}, ${y}, 1)">1</button>`;
                    else
                        html += `<button onclick="pintarCasilla(${x}, ${y}, ${i})">${i}</button>`;
                }
            }else{
                for(let i = 1; i < 10; i++){
                    if(i == 1)
                        html += `<button onclick="pintarCasilla(${x}, ${y}, 1)">1</button>`;
                    else
                        html += `<button onclick="pintarCasilla(${x}, ${y}, ${i})">${i}</button>`;
                }
            }
            document.querySelector('div#numeros').innerHTML = html;
            pickMode = true;

            // Nos guardamos las coordenadas para cancelar el estilo de las casillas adyacentes
            coordClick[0] = x;
            coordClick[1] = y;
        }
    }
}



// Función para mostrar las casillas adyacentes afectadas a la casilla clickada
function pintarCasillasAdyacentes(x, y, color) {
    let sudo = JSON.parse(sessionStorage['sudoku']),
        cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        tablero = sudo.SUDOKU,
        ancho = cv.width / sudo.SUDOKU.length,
        alto = cv.height / sudo.SUDOKU.length,
        recuadro = averiguarRecuadro(x, y, sudo.SUDOKU.length),
        sudoku;

    if (sudo.SUDOKU.length == 4)
        sudoku = sudokuPequenyo;
    else
        sudoku = sudokuGrande;

    for (let i=0; i<sudo.SUDOKU.length; i++) {
        for (let j=0; j<sudo.SUDOKU.length; j++) {
            let recuadroAux = averiguarRecuadro(i, j, sudo.SUDOKU.length);
            if (((i == x  ||  j == y)  ||  (recuadro[0] == recuadroAux[0]  &&  recuadro[1] == recuadroAux[1]))  &&  tablero[i][j] == 0) {
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.fillRect(ancho * j + 1, alto * i + 1, ancho-2, alto-2);
                ctx.stroke();
                if (sudoku[i][j] != 0) {
                    ctx.beginPath();
                    ctx.fillStyle = '#FF8300';
                    ctx.fillText(sudoku[i][j], j * ancho+(ancho/2), i * alto+(alto/1.6));
                    ctx.stroke();
                }
            }
        }
    }
}



// Función para averiguar a que recuadro del sudoku pertenecen unas coordenadas
function averiguarRecuadro(x, y, tab) {
    let pos = new Array(2);

    if (tab == 9) {

        if (x >= 0  &&  x < 3)
            pos[0] = 1;
        else if (x >= 3  &&  x < 6)
            pos[0] = 2;
        else if (x >= 6  &&  x < 9)
            pos[0] = 3;

        if (y >= 0  &&  y < 3)
            pos[1] = 1;
        else if (y >= 3  &&  y < 6)
            pos[1] = 2;
        else if (y >= 6  &&  y < 9)
            pos[1] = 3;

    } else {

        if (x >= 0  &&  x < 2)
            pos[0] = 1;
        else if (x >= 2  &&  x < 4)
            pos[0] = 2;

        if (y >= 0  &&  y < 2)
            pos[1] = 1;
        else if (y >= 2  &&  y < 4)
            pos[1] = 2;

    }

    return pos;
}



//Función que pinta aquella casilla del canvas del nuevo número que inserta el usuario
function pintarCasilla(coorX, coorY, num){
    console.log("Número: "+num);
    console.log("CoorX: "+coorX);
    console.log("CoorY: "+coorY);

    let cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        sudo = JSON.parse(sessionStorage['sudoku']),
        ancho = cv.width / sudo.SUDOKU.length,
        alto = cv.height / sudo.SUDOKU.length;

    // Devolvemos las casillas afectadas a su estilo original
    if (coordClick[0] != undefined  &&  coordClick[1] != undefined) {
        pintarCasillasAdyacentes(coordClick[0], coordClick[1], '#CFD8DC');
        coordClick[0] = undefined;
        coordClick[1] = undefined;
    }

/*
    if(value == 2 || value == 3){
        ctx.lineWidth = 5;
    }else{
        ctx.lineWidth = 2;
    }*/


    // Pintamos la casilla con el numero insertado
    ctx.beginPath();
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(ancho * coorY + 1, alto * coorX + 1, ancho-2, alto-2);
    ctx.beginPath();
    ctx.fillStyle = '#ff8300';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif, arial';
    ctx.fillText(num, coorY * ancho+(ancho/2), coorX * alto+(alto/1.6));
    ctx.stroke();

    //Nos guardamos el nuevo número en la matriz global 
    if(sudo.SUDOKU.length == 4){
        sudokuPequenyo[coorX][coorY] = num;
        console.log(sudokuPequenyo);
    }else{
        sudokuGrande[coorX][coorY] = num;
        console.log(sudokuGrande);
    }


    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#727272';
    for (let x=0; x < cv.width; x=x+ancho){
        ctx.moveTo(x,0);
        ctx.lineTo(x,cv.width);
    }
    
    for (let y=0; y < cv.height; y=y+alto){
        ctx.moveTo(0,y);
        ctx.lineTo(cv.height,y);
    }
    for(let i = 0; i < sudo.SUDOKU.length; i++){
        //Verticales
        ctx.moveTo(i * ancho, 0);
        ctx.lineTo(i * ancho, cv.height);
        //Horizontales
        ctx.moveTo(0, i * alto);
        ctx.lineTo(cv.width, i * alto);
    }
    ctx.stroke();
    
    //Para volver a poner la rejilla central
    if(sudo.SUDOKU.length == 4)
        rejilla(2);
    else    
        rejilla(3);

    document.querySelector('div#numeros').innerHTML = '';
    pickMode = false;

    // Comprobamos si se ha completado el tablero
    tableroCompleto();
}



// Función para comprobar si se ha completado el tablero tras insertar un número
function tableroCompleto() {
    let cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        sudo = JSON.parse(sessionStorage['sudoku']),
        tablero, completado = true;

    tablero = (sudo.SUDOKU.length == 4) ? sudokuPequenyo : sudokuGrande;

    for (let i=0; i<tablero.length; i++) {
        for (let j=0; j<tablero.length; j++) {
            if (tablero[i][j] == 0) {
                completado = false;
                break;
            }
        }
    }

    // Mostramos los fallos y emergemos ventana modal
    if (completado) {
        comprueba(true);
    }
}



//BOTÓN PARA COMPROBAR ERRORES
function comprueba(ventana){
    let sudo = JSON.parse(sessionStorage['sudoku']),
        url, header;

    url = `api/sudoku/${sudo.ID}/comprobar`;
    header = sudo.TOKEN;
    fd = new FormData;

    if(sudo.SUDOKU.length == 4){
        juego = JSON.stringify(sudokuPequenyo);
    }else{
        juego = JSON.stringify(sudokuGrande);
    }

    fd.append('juego', juego);

    fetch(url, {method:'POST', body:fd, headers:{'Authorization':header}}).then(function(respuesta){
		if(respuesta.ok){
			respuesta.json().then(function(datos){
                console.log(datos);
                if (datos.FALLOS == 0 || datos.FALLOS == null || datos.FALLOS == undefined) {
                    console.log("No hay fallos en el juego.");

                    // Detenemos el timer y mostramos la ventana modal de juego completado
                    if (ventana) {
                        let idTemp = document.querySelector('#crono-si').getAttribute('data-id-temp'),
                            valor  = document.querySelector('#crono-si').innerHTML;
                        clearInterval(idTemp);
                        ventanaModal('¡¡¡ENHORABUENA!!!', `Has competado el sudoku correctamente en ${valor}`);
                    }

                } else {

                    // Comprobar errores y mostrar ventana modal
                    if (ventana) {
                        ventanaModal('¡ATENCIÓN!', `Hay ${datos.FALLOS.length} errores. ¿Quieres intentar corregirlos?`);
                    } else {
                        coordFail = datos.FALLOS;
                        coordFail.forEach(function(casilla) {
                            pintarCasillaFallo(casilla.fila, casilla.columna, '#ff3333');
                        });
                    }
                }
			});
		}else
			console.log('Error en la petición fetch');
	});

	return false;
}




// Función para mostrar el estilo de las casillas erróneas con un color
function pintarCasillaFallo(x, y, color) {
    let sudo = JSON.parse(sessionStorage['sudoku']),
        cv = document.querySelector('canvas'),
        ctx = cv.getContext('2d'),
        ancho = cv.width / sudo.SUDOKU.length,
        alto = cv.height / sudo.SUDOKU.length,
        numero;

    if (sudo.SUDOKU.length == 4)
        numero = sudokuPequenyo[x][y];
    else
        numero = sudokuGrande[x][y];

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(ancho * y + 1, alto * x + 1, ancho-2, alto-2);
    ctx.stroke();
    if (numero != 0) {
        ctx.beginPath();
        ctx.fillStyle = '#FF8300';
        ctx.fillText(numero, y * ancho+(ancho/2), x * alto+(alto/1.6));
        ctx.stroke();
    }

}




function ventanaModal(asunto, body){
    let div, html;

    div = document.createElement('div');
    div.id = 'capa-fondo';
	
    html = '<article>';
    html += `<h2>${asunto}</h2>`;
    html += `<p>${body}</p>`;
    if(asunto != '¡ATENCIÓN!'){
        html += '<button onclick="cerrarVentanaFinal();">Aceptar</button>';
    }else{
        html += '<button onclick="cerrar(true);">SÍ</button>';
        html += '<button onclick="cerrar(false);">NO</button>';
    }
    html += '</article>';

    div.innerHTML = html;

    document.body.appendChild(div);
}



// Función para mostrar la ventana la ventana de comprobación de errores
function cerrar(value){
    if(value == true){
        document.querySelector('#capa-fondo').remove();
    }else{
        //let idTemp = document.querySelector('#crono-si').getAttribute('data-id-temp');
        //clearInterval(idTemp);
        document.querySelector('#capa-fondo').remove();
        peticionFinalizarPartida();
        //limpiar();
    }
}



// Función para cerrar la ventana de juego completado y resetear sudoku
function cerrarVentanaFinal() {
    let xhr = new XMLHttpRequest(),
        url = 'api/sudoku/' + id,
        sudo = JSON.parse(sessionStorage['sudoku']),
        autorizacion = sudo.TOKEN;

    xhr.open('DELETE', url, true);
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText);
        console.log(respuesta);
        if (respuesta.RESULTADO == 'OK') {
            console.log("Se ha eliminado la partida.");
            document.querySelector('#capa-fondo').remove();
            limpiar();
        } else {
            console.error('No se ha podido ELIMINAR la partida...');
        }
    };
    xhr.setRequestHeader('Authorization', autorizacion);
    xhr.send();
    
}



function limpiar(){
    let cv = document.querySelector('#cv01'),
    ctx = cv.getContext('2d');
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,cv.width,cv.height);
    document.getElementById('cv01').remove();
    //peticionFinalizarPartida();
    sessionStorage.clear();
    //location.href = './index.html';
    resetGlobal();
}



// Función para resetear el juego y valor de las variables globales
function resetGlobal() {
    checkbox = undefined;
    ctx = undefined;
    posX = undefined;
    posY = undefined;
    puntos = undefined;
    id = undefined;
    token = undefined;
    sudokuPequenyo = undefined;
    sudokuGrande = undefined;
    coordMove = new Array(3);
    coordClick = new Array(2);
    pickMode = false;
    coordFail = undefined;

    document.getElementById('canvas').innerHTML = `<h2>Panel del juego</h2>
    <h3>Tamaño del juego</h3>
    <form>
        <input type="radio" id="tam1" name="size" value="4" checked><label for="tam1"> 4</label>
        <input type="radio" id="tam2" name="size" value="9"><label for="tam2"> 9</label>
    </form>
    <button type="button" id="inicio">Empezar</button>
    <canvas id="cv01" width="480" height="480"></canvas>`;

    // Volvemos a empezar el juego...
    load();
}