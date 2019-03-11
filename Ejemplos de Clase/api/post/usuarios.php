<?php
// FICHERO: api/post/usuarios.php
// PETICIONES POST ADMITIDAS:
// * api/usuarios/ -> Dar de alta un nuevo usuario
//      Params: login:login del usuario;pwd:password del usuario;pwd2:password de usuario repetido;nombre:nombre del usuario;email:email del usuario
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
require_once('../configbd.php');
// =================================================================================
// =================================================================================

// =================================================================================
// COMPROBAR SI EXISTE EL USUARIO EN LA BD
// =================================================================================
function comprobarExistencia($login)
{
    global $link;
    $valorRet = false;

    $mysql  = 'select * from usuario where login="' . $login . '"';
    if( $res = mysqli_query( $link, $mysql ) )
    {
      $row = mysqli_fetch_assoc( $res ); // Se transforma en array el registro encontrado
      if( mysqli_num_rows($res)==1 && $row['login'] == $login )
        $valorRet = true;
    }

    return $valorRet;
}
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R             = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
// =================================================================================
// =================================================================================
// Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos:
$PARAMS = $_POST;

if( !( isset($PARAMS['login']) ) )
{
  $RESPONSE_CODE    = 400;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Parámetros incorrectos';
}
else
{
  // Se pillan el usuario y el login:
  $login  = sanatize($PARAMS['login']);
  $pwd    = sanatize($PARAMS['pwd']);
  $pwd2   = sanatize($PARAMS['pwd2']);
  $nombre = sanatize($PARAMS['nombre']);
  $email  = sanatize($PARAMS['email']);

  if( $pwd != $pwd2 )
  { // Contraseñas distintas
    $RESPONSE_CODE    = 422; // UNPROCESSABLE ENTITY
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Contraseñas distintas';
  }
  else if( $login == '' )
  {
    $RESPONSE_CODE    = 422;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Login no válido';
  }
  else
  {
    try{
      // ******** INICIO DE TRANSACCION **********
      mysqli_query($link, 'BEGIN');
      if(!comprobarExistencia($login))
      { // El usuario no existe, se da de alta
        /*// El pwd se guarda con hash
        $options = [
            'cost' => 11,
            //'salt' => mcrypt_create_iv(22, MCRYPT_DEV_URANDOM),
        ];
        $pwd    = password_hash(sanatize($PARAMS['pwd']), PASSWORD_BCRYPT, $options);*/

        $mysql  = 'insert into usuario(login,pwd,nombre,email) values("';
        $mysql .= $login . '","' . $pwd . '","' . $nombre . '","' . $email . '")';
        // Se ejecuta el sql
        if( mysqli_query( $link, $mysql ) )
        {
          $RESPONSE_CODE    = 201; // RESOURCE CREATED INSIDE A COLLECTION
          $R['RESULTADO']   = 'OK';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Usuario creado correctamente';
          $R['LOGIN']       = $login;
          $R['NOMBRE']      = $nombre;
        }
        else
        {
          $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Error indefinido al crear el nuevo registro';
        }
      } // if(!comprobarExistencia($login))
      else
      { // El usuario existe
        $RESPONSE_CODE    = 409; // CONFLICT
        $R['RESULTADO']   = 'ERROR';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Login no válido, ya está en uso.';
      }

      // ******** FIN DE TRANSACCION **********
      mysqli_query($link, "COMMIT");
    } catch(Exception $e){
      // Se ha producido un error, se cancela la transacción.
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