<?php
/* Intentar hacer que la cabecera Authorization se haga como se indica aquí: https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-basic-authentication/#supplying-basic-auth-headers
Es decir:
Supplying basic auth headers
If you need to, you may construct and send basic auth headers yourself. To do this you need to perform the following steps:

Generate an API token for Jira using your Atlassian Account: https://id.atlassian.com/manage/api-tokens.
Build a string of the form useremail:api_token.
BASE64 encode the string.
Supply an Authorization header with content Basic followed by the encoded string. For example, the string fred:fred encodes to ZnJlZDpmcmVk in base64, so you would make the request as follows:
curl -D- \
   -X GET \
   -H "Authorization: Basic ZnJlZDpmcmVk" \
   -H "Content-Type: application/json" \
   "https://your-domain.atlassian.net/rest/api/2/issue/QA-31"
*/


// FICHERO: api/post/fotos.php
// PETICIONES POST ADMITIDAS:
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera Authorization con el token de seguridad como valor.
// * api/fotos -> Dar de alta una nueva foto
//       Params: titulo:Título de la foto;descripcion:descripcion;etiquetas:etiquetas separadas por comas;fichero:foto
// * api/fotos/{ID}/comentario -> Dar de alta un comentario sobre una foto existente
//       Params: titulo:titulo del comentario; texto:texto del comentario
// * api/fotos/{ID}/megusta -> Marca la foto como "Me gusta" para el usuario que se pasa como parámetro
// * api/fotos/{ID}/favorita -> Marca la foto como Favorita para el usuario que se indica
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
require_once('../configbd.php');
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
  $PARAMS = $_POST;
  list($login,$token) = explode(':', $AUTORIZACION);
  if( !comprobarSesion($login,$token) )
  {
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Error de autenticación.';
  }
  else
  {
    $ID = array_shift($RECURSO);
    try{
        mysqli_query($link, "BEGIN");
        if(!is_numeric($ID))
        { // Si no es numérico $ID es porque se está creando una receta
          $titulo      = sanatize($PARAMS['titulo']);
          $descripcion = sanatize(nl2br($PARAMS['descripcion'],false));
          // =================================================================================
          $mysql  = 'insert into foto(titulo,descripcion,login) ';
          $mysql .= 'values(';
          $mysql .= '"' . $titulo .'","' . $descripcion . '","' . $login . '"';
          $mysql .= ')';
          // echo $mysql;
          // exit();
          if( mysqli_query($link,$mysql) )
          { // Se han insertado los datos del registro
            // Se saca el id del nuevo registro
            $mysql = "select MAX(id) as id2 from foto";
            if( $res = mysqli_query($link,$mysql) )
            {
              $registro = mysqli_fetch_assoc($res);
              $ID = $registro['id2'];
            }
            else $ID = -1;
            $RESPONSE_CODE    = 200;
            $R['RESULTADO']   = 'OK';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Registro creado correctamente';
            // Se copia el fichero.
            // Nota: Hay que tener en cuenta que la carpeta de destino debe tener permisos de
            // escritura. En Windows no hay problema, pero en linux y mac hay que comprobarlo.
            $ext = pathinfo($_FILES['fichero']['name'], PATHINFO_EXTENSION); // extensión del fichero
            $uploadfile = $uploaddir . $ID . '.' . $ext; // path fichero destino
            // Se crea el directorio si no existe
            if (!file_exists($uploaddir)) {
              mkdir($uploaddir, 0777, true);
            }
            if(move_uploaded_file($_FILES['fichero']['tmp_name'], $uploadfile)) // se sube el fichero
            {
              list($ancho, $alto) = getimagesize($uploadfile);
              $R['ID'] = $ID;
              $mysql  = 'update foto set fichero="' . $ID . '.' . $ext . '"';
              $mysql .= ', ancho=' . $ancho . ', alto=' . $alto;
              $mysql .= ', peso=' . filesize($uploadfile);
              $mysql .= ' where ID=' . $ID;
              mysqli_query( $link, $mysql );
              // Se pillan las etiquetas y se insertan en la BD
              if(isset($PARAMS['etiquetas']))
              {
                $etiquetas = explode(',', sanatize($PARAMS['etiquetas']));
                foreach ($etiquetas as $value) {
                  $mysql = 'select * from etiqueta where nombre = "' . $value . '"';
                  if($res2 = mysqli_query($link, $mysql))
                  {
                    $ID_ETIQUETA = 0;
                    if(mysqli_affected_rows($link) > 0)
                    { // La etiqueta ya existe
                      $row         = mysqli_fetch_assoc($res2);
                      $ID_ETIQUETA = $row['id'];
                    }
                    else
                    { // La etiqueta es nueva
                      $mysql = 'insert into etiqueta(nombre) values("' . ucfirst(trim($value)) . '")';
                      if(mysqli_query($link, $mysql))
                      {
                        $mysql = 'select max(id) as maxid from etiqueta';
                        if($res3 = mysqli_query($link, $mysql))
                        {
                          $row = mysqli_fetch_assoc($res3);
                          $ID_ETIQUETA = $row['maxid'];
                        }
                      }
                    }
                    if($ID_ETIQUETA > 0)
                    {
                      $mysql = 'insert into etiquetado(id_foto, id_etiqueta) values(' . $ID . ',' . $ID_ETIQUETA . ')';
                      mysqli_query($link, $mysql);
                    }
                  }
                }
              }
            }
            else // if(move_uploaded_file($_FILES['foto']['tmp_name'], $uploadfile))
            { // Si no se puede guardar el fichero, se elimina el registro
              $mysql = 'delete from foto where id=' . $ID; // se borrar el registro
              mysqli_query( $link, $mysql );
              $RESPONSE_CODE    = 500;
              $R['RESULTADO']   = 'ERROR';
              $R['CODIGO']      = $RESPONSE_CODE;
              $R['DESCRIPCION'] = 'ERROR AL SUBIR LA FOTO';
            }
          }
          else
          {
            $RESPONSE_CODE    = 500;
            $R['RESULTADO']   = 'ERROR';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Error de servidor.';
          }
        }
        else
        { // El $ID es numérico por lo que se va a guardar un comentario de la foto, un "Me gusta", o un "Favorita"
          switch(array_shift($RECURSO))
          {
            case 'comentario': // Se va a añadir un comentario
                $titulo = sanatize($PARAMS['titulo']);
                $texto  = sanatize(nl2br($PARAMS['texto']));
                $mysql  ='insert into comentario(id_foto,titulo,texto,login) values(' . $ID . ',"' . $titulo . '","' . $texto . '","' . $login . '")';
                if( mysqli_query( $link, $mysql ) )
                {
                  $mysql = 'select MAX(id) as id from comentario';
                  if( $res=mysqli_query( $link, $mysql ) )
                  {
                    $row = mysqli_fetch_assoc($res);
                    $ID_COMENTARIO = $row['id'];
                    // ===============================================================
                    // Se ha subido el comentario correctamente.
                    $RESPONSE_CODE    = 200;
                    $R['RESULTADO']   = 'OK';
                    $R['CODIGO']      = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Comentario guardado correctamente.';
                    $R['ID']          = $ID_COMENTARIO;
                    // ===============================================================
                  }
                  else
                  {
                    $RESPONSE_CODE    = 500;
                    $R['RESULTADO']   = 'ERROR';
                    $R['CODIGO']      = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Se ha producido un error al intentar guardar el comentario.';
                  }
                }
              break;
            case 'megusta':
                $mysql  ='insert into megusta(login,id_foto) values("' . $login . '","' . $ID . '")';
                if( mysqli_query( $link, $mysql ) )
                {
                    // "Me gusta" guardado correctamente.
                    $RESPONSE_CODE    = 200;
                    $R['RESULTADO']   = 'OK';
                    $R['CODIGO']      = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Me gusta guardado correctamente.';
                    // Contar cuántos hay
                    $mysql = 'select count(*) as total from megusta where id_foto=' . $ID;
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
                  $R['RESULTADO']   = 'ERROR';
                  if(mysqli_errno($link) == 1062)
                  {
                    $RESPONSE_CODE    = 409;
                    $R['CODIGO'] = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Se ha producido un error al intentar registrar el Me gusta para la foto: Ya estaba registrado el Me gusta para el usuario y la foto.';
                  }
                  else
                  {
                    $RESPONSE_CODE = 500;
                    $R['CODIGO'] = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Se ha producido un error al intentar registrar el Me gusta para la foto: ' . mysqli_errno($link) . ' - ' . mysqli_error($link);
                  }
                }
              break;
            case 'favorita':
                //$login_usuario = array_shift($RECURSO);
                $mysql  ='insert into favorita(login,id_foto) values("' . $login . '","' . $ID . '")';
                if( mysqli_query( $link, $mysql ) )
                {
                    // "Favorita" guardado correctamente.
                    $RESPONSE_CODE    = 200;
                    $R['RESULTADO']   = 'OK';
                    $R['CODIGO']      = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Foto registrada como favorita correctamente.';
                    // Contar cuántos hay
                    $mysql = 'select count(*) as total from favorita where id_foto=' . $ID;
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
                  $R['RESULTADO'] = 'ERROR';
                  if(mysqli_errno($link) == 1062)
                  {
                    $RESPONSE_CODE    = 409;
                    $R['CODIGO'] = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Se ha producido un error al intentar registrar la foto como favorita: Ya estaba marcada como favorita para el usuario.';
                  }
                  else
                  {
                    $RESPONSE_CODE    = 500;
                    $R['CODIGO'] = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Se ha producido un error al intentar registrar la foto como favorita: ' . mysqli_errno($link) . ' - ' . mysqli_error($link);
                  }
                }
              break;
          }
        }
        mysqli_query($link, "COMMIT");
    }catch(Exception $e){
        mysqli_query($link, "ROLLBACK");
    }
  } // if( !comprobarSesion($login,$clave) )
  // =================================================================================
  // SE HACE LA CONSULTA
  // =================================================================================
  if( count($R)==0 && $res = mysqli_query( $link, $mysql ) )
  {
    if( substr($mysql, 0, 6) == "select" )
    {
      while( $row = mysqli_fetch_assoc( $res ) )
        $R[] = $row;
      mysqli_free_result( $res );
    }
    else $R[] = $res;
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