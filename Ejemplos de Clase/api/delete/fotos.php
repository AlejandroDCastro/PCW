<?php
// FICHERO: api/delete/fotos.php
// Nota: Todas las operaciones deberán añadir a la petición DELETE una cabecera Authorization con el token de seguridad como valor.
// PETICIONES DELETE ADMITIDAS:
//   api/fotos/{ID}/megusta -> Borra voto Me gusta
//   api/fotos/{ID}/favorita -> Borra voto Favorita
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
require_once('../configbd.php');
// =================================================================================
// =================================================================================
$RECURSO = explode("/", substr($_GET['prm'],1));
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST");
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
  $R             = [];  // Almacenará el resultado.
  $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
  // de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
  // confirmado la creación correcta de la entrada.
  list($login,$token) = explode(':', $AUTORIZACION);
  $ID     = sanatize(array_shift($RECURSO));
  $accion = sanatize(array_shift($RECURSO));

  if( !comprobarSesion($login,$token) )
  {
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Login o clave incorrecto.';
  }
  else
  {
    try{
        mysqli_query($link, "BEGIN");
        if(!is_numeric($ID))
        { // Si no es numérico $ID hay que tirar un error
          $RESPONSE_CODE    = 422;
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Falta el ID de la foto en la petición.';
        }
        else
        {
          switch ($accion)
          {
            case 'megusta':
                $mysql = 'delete from megusta where login="' . $login . '" and id_foto=' . $ID;
              break;
            case 'favorita':
                $mysql = 'delete from favorita where login="' . $login . '" and id_foto=' . $ID;
              break;
            default:
                $mysql = '';
          }
          // echo $mysql;
          // exit();
          if($mysql != '')
          {
            if( mysqli_query($link,$mysql) )
            {
              $RESPONSE_CODE    = 200;
              $R['RESULTADO']   = 'OK';
              $R['CODIGO']      = $RESPONSE_CODE;
              $R['DESCRIPCION'] = 'Operación realizada correctamente.';
              // Contar cuántos hay
              $mysql  = 'select count(*) as total from';
              switch ($accion)
              {
                case 'megusta':
                    $mysql .= ' megusta';
                  break;
                case 'favorita':
                    $mysql .= ' favorita';
                  break;
                default:
                    $mysql .= '';
              }
              $mysql .= ' where id_foto=' . $ID;
              // echo $mysql;
              // exit();
              if( $res2 = mysqli_query( $link, $mysql ) )
              {
                $row = mysqli_fetch_assoc($res2);
                $R['TOTAL_VOTOS'] = $row['total'];
              }
              else
                $R['TOTAL_VOTOS'] = 0;
              mysqli_free_result( $res2 );
            }
            else
            {
              $RESPONSE_CODE    = 500;
              $R['RESULTADO']   = 'ERROR';
              $R['CODIGO']      = $RESPONSE_CODE;
              $R['DESCRIPCION'] = 'Error de servidor. No se ha podido realizar la operación.';
            }
          }
        }
        mysqli_query($link, "COMMIT");
    }catch(Exception $e){
        mysqli_query($link, "ROLLBACK");
    }
  }
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