<?php
// FICHERO: api/delete/sudoku.php
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera "Authorization" con el valor "{TOKEN}".
// PETICIONES DELETE ADMITIDAS:
//   api/sudoku/{ID} -> Borra la partida de la bd con el ID indicado. Necesita la cabecera "Authorization" con el valor "{TOKEN}".
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// =================================================================================
$RECURSO = explode("/", substr($_GET['prm'],1));
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json");
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
$headers = apache_request_headers();
// CABECERA DE AUTORIZACIÓN
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];

if(!isset($AUTORIZACION))
{ // Acceso no autorizado
  $RESPONSE_CODE    = 403;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Falta autorización';
}
else
{
  // =================================================================================
  // Se prepara la respuesta
  // =================================================================================
  $R = [];  // Almacenará el resultado.
  // =================================================================================
  // =================================================================================
  $ID = $db->sanatize(array_shift($RECURSO));

  $dbCon->beginTransaction();
  if(!is_numeric($ID))
  { // Si no es numérico $ID hay que tirar un error
    $RESPONSE_CODE    = 422;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Falta el ID de la partida en la petición.';
  }
  else
  {
    $mysql = 'delete from partida where id=:ID and token=:TOKEN';
    $stmt = $dbCon->prepare($mysql);
    $VALORES           = [];
    $VALORES[':ID']    = $ID;
    $VALORES[':TOKEN'] = $AUTORIZACION;
    if( $stmt->execute($VALORES) )
    {
      $RESPONSE_CODE    = 200;
      $R['RESULTADO']   = 'OK';
      $R['CODIGO']      = $RESPONSE_CODE;
      $R['DESCRIPCION'] = 'Operación realizada correctamente.';
    }
    else
    {
      $RESPONSE_CODE    = 500;
      $R['RESULTADO']   = 'ERROR';
      $R['CODIGO']      = $RESPONSE_CODE;
      $R['DESCRIPCION'] = 'Error de servidor. No se ha podido realizar la operación.';
    }
  }
  $dbCon->commit();
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
print json_encode($R);
?>