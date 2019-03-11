<?php
// FICHERO: api/get/etiquetas.php
// PETICIONES GET ADMITIDAS:
// * api/etiquetas -> devuelve la lista de etiquetas disponibles
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
   require_once('../configbd.php');
// =================================================================================
// =================================================================================
if(strlen($_GET['prm']) > 0)
    $RECURSO = explode("/", substr($_GET['prm'],1));
else
    $RECURSO = [];
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql = 'select * from etiqueta order by nombre';

if($res = mysqli_query($link, $mysql))
{
  while( $row = mysqli_fetch_assoc( $res ) )
      $FILAS[] = $row;
  mysqli_free_result( $res );

  $R['RESULTADO'] = 'OK';
  $R['CODIGO']    = $RESPONSE_CODE;
  $R['FILAS']     = $FILAS;
}
else
{
  $RESPONSE_CODE    = 500;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Error de servidor. No se ha podido realizar la operación.';
}

// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
mysqli_close($link);
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
print json_encode($R);
?>