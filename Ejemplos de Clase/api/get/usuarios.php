<?php
// FICHERO: api/get/usuarios.php
// PETICIONES GET ADMITIDAS:
//   api/usuarios/{LOGIN}  -> devuelve true o false en función de si el login está disponible o no, respectivamente.
//   api/usuarios/{LOGIN}/favoritas -> devuelve la lista de fotos favoritas del usuario
//     - Esta petición debe llevar la cabecera "Authorization" con el valor {LOGIN}:{TOKEN}
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
$LOGIN1 = array_shift($RECURSO);
// Se pillan los parámetros de la petición
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);
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
$mysql               = '';  // para el SQL
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// =================================================================================
if(isset($LOGIN1) && strlen($LOGIN1) > 0)
{
  switch(array_shift($RECURSO))
  {
    case 'favoritas': // Devuelve las fotos favoritas del usuario
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
          list($login,$token) = explode(':', $AUTORIZACION);
          if( $LOGIN1==$login && comprobarSesion($login,$token) )
          {
            $mysql  = 'select f.*,';
            $mysql .= '(select count(*) from megusta m where m.id_foto=f.id) as nmegusta,';
            $mysql .= '(select count(*) from favorita fav where fav.id_foto=f.id) as nfavorita,';
            $mysql .= '(select count(*) from comentario c where c.id_foto=f.id) as ncomentarios,';
            $mysql .= '(select count(*) from megusta m where m.id_foto=f.id and m.login="' . $login . '") as usu_megusta,';
            $mysql .= ' 1 as usu_favorita ';
            $mysql .= 'FROM foto f, favorita fav ';
            $mysql .= 'where f.id=fav.id_foto and fav.login="' . $login . '"';
            // =================================================================================
            // CONSTRUIR LA PARTE DEL SQL PARA PAGINACIÓN
            // =================================================================================
            if(isset($PARAMS['pag']) && is_numeric($PARAMS['pag'])      // Página a listar
                && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']))   // Tamaño de la página
            {
                $pagina           = sanatize($PARAMS['pag']);
                $regsPorPagina    = sanatize($PARAMS['lpag']);
                $ELEMENTO_INICIAL = $pagina * $regsPorPagina;
                $SQL_PAGINACION   = ' LIMIT ' . $ELEMENTO_INICIAL . ',' . $regsPorPagina;
                // =================================================================================
                // Para sacar el total de coincidencias que hay en la BD:
                // =================================================================================
                if( $res = mysqli_query( $link, $mysql ) )
                {
                    $TOTAL_COINCIDENCIAS = mysqli_num_rows($res);
                    mysqli_free_result( $res );
                }
                $mysql .= $SQL_PAGINACION;
            }
            // =================================================================================
            // SE HACE LA CONSULTA
            // =================================================================================
            if( $res = mysqli_query( $link, $mysql ) )
            {
              $RESPONSE_CODE  = 200;
              $R['RESULTADO'] = 'OK';
              $R['CODIGO']    = $RESPONSE_CODE;
              $FILAS          = [];
              if($TOTAL_COINCIDENCIAS > -1)
              {
                  $R['TOTAL_COINCIDENCIAS']  = $TOTAL_COINCIDENCIAS;
                  $R['PAGINA']               = $pagina;
                  $R['REGISTROS_POR_PAGINA'] = $regsPorPagina;
              }
              while( $row = mysqli_fetch_assoc( $res ) )
              {
                  $fila = $row;
                  $fila['etiquetas'] = [];
                  $mysql2 = "select e.* from etiqueta e, etiquetado etiq where e.id=etiq.id_etiqueta and etiq.id_foto=" . $row['id'];
                  if($resEtiqs = mysqli_query($link, $mysql2))
                  {
                      while( $rowEtiq = mysqli_fetch_assoc( $resEtiqs ) )
                        $fila['etiquetas'][] = Array('id'=>$rowEtiq['id'], 'nombre'=>$rowEtiq['nombre']);
                          // $fila['etiquetas'][] = $rowEtiq['nombre'];
                  }
                  mysqli_free_result( $resEtiqs );
                  $FILAS[] = $fila;
              }
              mysqli_free_result( $res );

              $R['FILAS'] = $FILAS;
            }
          }
          else // if( comprobarSesion($login,$token) )
          {
            $RESPONSE_CODE    = 401;
            $R['RESULTADO']   = 'ERROR';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Error de autenticación.';
          }
        }
      break;
    default:
      // Se devuelve si el login está disponible o no
      $mysql  = 'select login from usuario where login="' . sanatize($LOGIN1) . '"';
      if( $res = mysqli_query($link, $mysql) )
      {
        $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
        $R['RESULTADO'] = 'OK';
        $R['CODIGO']    = $RESPONSE_CODE;
        if( mysqli_num_rows($res) > 0 )
          $R['DISPONIBLE'] = false;
        else
          $R['DISPONIBLE'] = true;
        mysqli_free_result( $res );
      }
  }
}
else
{
	$RESPONSE_CODE    = 400; // Los parámetros no son correctos
	$R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Los parámetros no son correctos';
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