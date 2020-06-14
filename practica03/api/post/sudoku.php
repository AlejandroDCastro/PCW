<?php
// FICHERO: api/post/sudoku.php
// PETICIONES GET ADMITIDAS:
// * api/sudoku/{ID_SUDOKU}/comprobar -> Se recibe el sudoku con las jugadas del usuario y se devuelve un vector de errores. Se necesita la cabecera "Authorization"
//   Parámetros: juego -> array del sudoku con las jugadas del usuario
// * api/sudoku/generar/{TAMAÑO} -> Genera un nuevo sudoku de tamaño {TAMAÑO}x{TAMAÑO} y lo devuelve
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
$_HUECO_ = 0;
// =================================================================================
// RECURSO
// =================================================================================
// Array ( [0] => 4 )
if(strlen($_GET['prm']) > 0)
    $RECURSO = explode("/", substr($_GET['prm'],1));
else
    $RECURSO = [];
// =================================================================================
// Se cogen los parámetros de la petición
// =================================================================================
$PARAMS = $_POST;
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
// ==============================================================================
// FUNCIONES AUXILIARES
// =================================================================================
function hacerHuecos($matriz)
{
  global $_HUECO_;
  $hueco = $_HUECO_;
  $tamanyo = count($matriz);
  $huecos  = round( ($tamanyo * $tamanyo) / 2);

  while($huecos > 0)
  {
    $fila    = rand(0, $tamanyo - 1);
    $columna = rand(0, $tamanyo - 1);

    if($matriz[$fila][$columna] != $hueco)
    {
      $matriz[$fila][$columna] = $hueco;
      $huecos--;
    }
  }
  return $matriz;
} // function hacerHuecos($matriz)
// -----------------------------------------------------------------------------------
function rellenarSudoku($matriz)
{
  $tamanyo = count($matriz);

  // Se genera la primera fila
  for($i=0;$i<$tamanyo;$i++)
  {
    do{
      $numero = rand(1,$tamanyo);
      $j=0;
      while($j<$i && $matriz[0][$j]!=$numero)
        $j++;
    }while($j<$i);
    $matriz[0][$i] = $numero;
  }
  // Se generan el resto de filas del sudoku
  for($i=1;$i<$tamanyo;$i++)
  {
    if($i % sqrt($tamanyo) == 0)
      $desplazamiento = 1;
    else
      $desplazamiento = sqrt($tamanyo);
    for($j=0;$j<$tamanyo;$j++)
      $matriz[$i][$j] = $matriz[$i - 1][ ($j + $desplazamiento) % $tamanyo];
  }
  // Ahora se mezclan las filas:
  // Se descolocan de forma aleatoria las filas
  for($i=0;$i<sqrt($tamanyo);$i++) // Recorremos los bloques de filas
  {
    for($j=0;$j<sqrt($tamanyo);$j++) // para cada fila de cada bloque, las intercambiamos
    {
      $filaDestino = rand(0, sqrt($tamanyo) - 1);

      if($filaDestino != $j)
      { // Se intercambian
        $offset= ($i * sqrt($tamanyo));
        for($k=0;$k<$tamanyo;$k++) // intercambiamos los elementos de la fila
        {
          $aux                                = $matriz[$j + $offset][$k];
          $matriz[$j + $offset][$k]           = $matriz[$filaDestino + $offset][$k];
          $matriz[$filaDestino + $offset][$k] = $aux;
        }
      }
    }
  }
  // Ahora se mezclan las columnas:
  // Se descolocan de forma aleatoria las columnas
  for($j=0;$j<sqrt($tamanyo);$j++) // Recorremos los bloques de columnas
  {
    for($i=0;$i<sqrt($tamanyo);$i++) // para cada columna de cada bloque, las intercambiamos
    {
      $columnaDestino = rand(0, sqrt($tamanyo) - 1);

      if($columnaDestino != $i)
      { // Se intercambian
        $offset= ($j * sqrt($tamanyo));
        for($k=0;$k<$tamanyo;$k++) // intercambiamos los elementos de la columna
        {
          $aux                                   = $matriz[$k][$i + $offset];
          $matriz[$k][$i + $offset]              = $matriz[$k][$columnaDestino + $offset];
          $matriz[$k][$columnaDestino + $offset] = $aux;
        }
      }
    }
  }
  return $matriz;
} // function rellenarSudoku(&$matriz)
// =================================================================================

// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200;
if(count($RECURSO) < 1)
  die();

switch( $ID = array_shift($RECURSO) )
{
  case 'generar': // Generar un nuevo sudoku
      $TAMANYO = array_shift($RECURSO); // Se pilla el tamaño del sudoku a generar

      // Inicialización de la matriz
      $VALOR_DEFECTO = -1;
      $matriz = [];
      for($i=0;$i<$TAMANYO;$i++)
      {
        $matriz[] = [];
        for($j=0;$j<$TAMANYO;$j++)
          $matriz[$i][] = 0;         // VALOR POR DEFECTO
      }
      // Se rellena el sudoku
      $matriz = rellenarSudoku($matriz);
      // Se hacen los huecos
      $sudoku = hacerHuecos($matriz);
      // Se genera el token de seguridad para el sudoku
      // Genera una cadena de bytes pseudo-aleatoria, con el número de bytes determinado por el parámetro $length. También indica si se usó un algoritmo criptográficamente fuerte para producir los bytes pseudo-aleatorios, y hace esto mediante el parámetro opcional crypto_strong. Es raro que este parámetro sea FALSE, pero algunos sistemas pueden ser antiguos rotos.
      $cstrong = True;
      $length  = 64;
      $token   = bin2hex(openssl_random_pseudo_bytes($length, $cstrong));
      // =================================================================================
      // Se guarda toda la info sobre el nuevo sudoku en la BD
      $mysql  =  'insert into partida(completo,con_huecos,token) ';
      $mysql .= 'values(:COMPLETO,:CON_HUECOS,:TOKEN);';
      $stmt   = $dbCon->prepare($mysql);
      $VALORES                = [];
      $VALORES[':COMPLETO']   = json_encode($matriz);
      $VALORES[':CON_HUECOS'] = json_encode($sudoku);
      $VALORES[':TOKEN']      = $token;

      if( $stmt->execute($VALORES) )
      { // Se han insertado los datos del registro
        // Se saca el id del nuevo registro
        $mysql2 = "select MAX(id) as id_partida from partida";
        $stmt2  = $dbCon->prepare($mysql2);
        if($stmt2->execute())
        {
          $registro = $stmt2->fetch(PDO::FETCH_ASSOC);
          $ID       = $registro['id_partida'];
        }
        else $ID = -1;

        $stmt2->closeCursor();

        $RESPONSE_CODE    = 200;
        $R['RESULTADO']   = 'OK';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Juego creado correctamente';
        $R['ID']          = $ID;
        $R['TOKEN']       = $token;
        $R['SUDOKU']      = $sudoku;
      }
      else
      {
        $RESPONSE_CODE    = 500;
        $R['RESULTADO']   = 'ERROR';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Error de servidor al intentar guardar la nueva partida en la BD.';
      }
    break;
  default: // Se supone que viene el ID del sudoku
      $ERROR = false;
      // =================================================================================
      // Se pillan las cabeceras de la petición y se comprueba que está la de autorización
      // =================================================================================
      $headers = apache_request_headers();
      // CABECERA DE AUTORIZACIÓN
      if(isset($headers['Authorization']))
          $AUTORIZACION = $headers['Authorization'];
      elseif (isset($headers['authorization']))
          $AUTORIZACION = $headers['authorization'];

      switch(array_shift($RECURSO))
      {
        case 'comprobar': // Hay que comprobar los errores de los números puestos por el usuario

            $JUEGO = json_decode($PARAMS['juego']); // Contiene el sudoku inicial con las jugadas del usuario
            $mysql = "select * from partida where id=:ID";
            $stmt  = $dbCon->prepare($mysql);
            $stmt->execute([':ID'=>$ID]);

            if($stmt->rowCount() > 0)
            {
              $row = $stmt->fetch(PDO::FETCH_ASSOC);
              if( $stmt->rowCount()==1 && $row['token'] == $AUTORIZACION ) // Se comprueba si el resultado tiene un único registro y si el token coincide
              {
                $FALLOS     = [];
                $COMPLETO   = json_decode($row['completo']); // Sudoku completo
                $CON_HUECOS = json_decode($row['con_huecos']); // Sudoku con los huecos
                $TAMANYO    = count($COMPLETO);
                for($i=0;$i<$TAMANYO;$i++)
                  for($j=0;$j<$TAMANYO;$j++)
                  {
                    if($CON_HUECOS[$i][$j]==$_HUECO_ && $JUEGO[$i][$j]!=$_HUECO_ && $COMPLETO[$i][$j]!=$JUEGO[$i][$j])
                      $FALLOS[] = ["fila"=>$i,"columna"=>$j];
                  }
              }
            }
            $stmt->closeCursor();
            $RESPONSE_CODE    = 200;
            $R['RESULTADO']   = 'OK';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Lista de errores';
            $R['ID']          = $ID;
            $R['FALLOS']      = $FALLOS;
          break;
        }
    break;
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>