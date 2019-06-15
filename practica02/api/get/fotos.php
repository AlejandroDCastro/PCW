<?php
// FICHERO: api/get/fotos.php
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
   require_once('../configbd.php');
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
// Si se pasa la cabecera "Authentication" con el valor "{LOGIN}:{TOKEN}", devuelve dos campos más, usu_megusta y usu_favorita, cuyo valor será 1 ó 0 en función de si el usuario tiene marcada la foto como "Me gusta" y como "Favorita", o no, respectivamente.

//   api/fotos  ----------------------> devuelve toda la información de las fotos
//   api/fotos/{ID_FOTO} -------------> devuelve toda la información de la foto con el ID que se le pasa
//   api/fotos/{ID_FOTO}/comentarios -> devuelve todos los comentarios de la foto
//	 api/fotos?op={[megusta,favorita,comentarios]-[asc,desc]} --------------> devuelve las fotos ordenadas por megustas, favoritas o comentarios, ascendente o descendente
// EJEMPLO de ordenación por varios campos: api/fotos?op=megusta-asc,favorita-desc
//   PARA FILTRO O BÚSQUEDA
//   api/fotos?td={texto} -> devuelve la lista de fotos que contengan en el título o la descripción al menos una de las palabras, separadas por comas ",", indicadas en {texto}
// PARÁMETROS PARA LA BÚSQUEDA. DEVUELVE LOS REGISTROS QUE CUMPLAN TODOS LOS CRITERIOS DE BÚSQUEDA (OPERADOR AND).
//   api/fotos?t={texto} -> búsqueda por título. Devuelve la lista de registros que contengan en el título, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}
//	 api/fotos?l={login} -> búsqueda por autor
//   api/fotos?d={texto} -> búsqueda por descripción. Devuelve la lista de registros que contengan en la descripcion, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}
//   api/fotos?e={nombre_etiquetas} -> búsqueda por etiqueta. Devuelve la lista de registros que tengan asignada, al menos, una de las etiquetas, separadas por comas ",", indicadas en {nombre_etiquetas}
//   api/fotos?cd={[megusta,favorita,comentario]} -> búsqueda por cantidad de lo que se indique. Hay que añadir:vi (valor inferior) o vs (valor superior)
//   EJEMPLO:   api/fotos?cd=megusta&vi=100&vs=150 -> devuelve las fotos que tengan entre 100 y 150 megustas, ambos valores incluidos
// PAGINACIÓN
//	 api/fotos?pag={pagina}&lpag={número de registros por página} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag

if(strlen($_GET['prm']) > 0)
    $RECURSO = explode("/", substr($_GET['prm'],1));
else
    $RECURSO = [];
// Se pillan los parámetros de la petición
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);

// =================================================================================
// CALLBACKS
// =================================================================================
function porCantidad($mysql, $params)
{
    // Deben estar los tres parámetros: cd, vi y vs
    if(!(isset($params['cd'])))
        return $mysql;

    switch(sanatize($params['cd']))
    {
        case 'megusta':
                $campo = 'nmegusta';
            break;
        case 'favorita':
                $campo = 'nfavorita';
            break;
        case 'comentarios':
                $campo = 'ncomentarios';
            break;
        case 'vista':
                $campo = 'veces_vista';
            break;
    }
    $mysql .= ' having 0=0';
    if(isset($params['vi']) && is_numeric($params['vi']) )
        $mysql .= ' and ' . $params['vi'] . ' <= ' . $campo;
    if(isset($params['vs']) && is_numeric($params['vs']) )
        $mysql .= ' and ' . $params['vs'] . ' >= ' . $campo;
    return $mysql;
}
function aplicarFiltro($mysql, $params)
{
    $mysql .= ' where true ';
    // BÚSQUEDA RÁPIDA: BÚSQUEDA EN TÍTULO Y DESCRIPCIÓN AL MISMO TIEMPO
    if( isset($params['td']) ) // búsqueda rápida
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' (false';

        $texto = explode(',', sanatize($params['td']));
        $paraNombre = '';
        $paraDescripcion = '';
        foreach ($texto as $valor) {
            $paraNombre .= ' or titulo like "%' . $valor . '%"';
            $paraDescripcion .= ' or descripcion like "%' . $valor . '%"';
        }
        $mysql .= $paraNombre . $paraDescripcion . ')';
    }
    // BÚSQUEDA POR TÍTULO
    if( isset($params['t']) ){
        // permite incluir más de un texto separados por comas
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' (false';
        $nombre = explode(',',sanatize($params['t']));
        foreach ($nombre as $valor) {
            $mysql .= ' OR titulo like "%' . $valor . '%"';
        }
        $mysql .= ')';
    }
    // BÚSQUEDA POR DESCRIPCIÓN
    if( isset($params['d']) ){
        // permite incluir más de un texto separados por comas
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' (false';
        $nombre = explode(',',sanatize($params['d']));
        foreach ($nombre as $valor) {
            $mysql .= ' OR descripcion like "%' . $valor . '%"';
        }
        $mysql .= ')';
    }
    // BÚSQUEDA POR AUTOR (LOGIN)
    if( isset($params['l']) )
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' login like "%' . sanatize($params['l']) . '%"';
    }
    // BÚSQUEDA POR ETIQUETA
    if( isset($params['e']) )
    {
        // permite incluir más de un texto separados por comas
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' f.id in (select etiq.id_foto from etiquetado etiq, etiqueta e where etiq.id_foto=f.id and etiq.id_etiqueta=e.id and e.nombre in (';
        $nombre = explode(',',sanatize($params['e']));
        foreach ($nombre as $valor) {
            $mysql .= '"' . $valor . '",';
        }
        $mysql = substr($mysql, 0, -1) . '))';
    }
    // BÚSQUEDA POR CANTIDAD
    $mysql = porCantidad($mysql, $params);
    return $mysql;
}

function ordenar($mysql, $params)
{
    $mysql .= ' order by ';
    if( isset($params['op']) ){
        $campos = explode(',',sanatize($params['op']));
        foreach ($campos as $valor) {
            $valor = explode('-', $valor);
            switch ($valor[0]) {
                case 'megusta':
                        $mysql.= 'nmegusta';
                    break;
                case 'favorita':
                        $mysql.= 'nfavorita';
                    break;
                case 'comentarios':
                        $mysql.= 'ncomentarios';
                    break;
                case 'vista':
                        $mysql.= 'veces_vista';
                    break;
            }
            $mysql .= ' ' . $valor[1] . ',';
        }
        $mysql = substr($mysql, 0, -1);
    }
    else
        $mysql .= 'nmegusta desc'; // por defecto ordena por número de megustas descendente
    return $mysql;
}

// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
//header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, PATCH");
header("Content-Type: application/json");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql               = '';  // para el SQL
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// =================================================================================
// SQL POR DEFECTO PARA SELECCIONAR TODAS LAS RECETAS
// =================================================================================
$mysql  = 'select f.*,';
$mysql .= '(select count(*) from megusta m where m.id_foto=f.id) as nmegusta,';
$mysql .= '(select count(*) from favorita fav where fav.id_foto=f.id) as nfavorita,';
$mysql .= '(select count(*) from comentario c where c.id_foto=f.id) as ncomentarios';
// -------------------------------
// Esto es para incluir dos campos más que informen de si un usuario ha hecho "Me gusta" y/o "Favorita" en las fotos
$headers = apache_request_headers();
// CABECERA DE AUTORIZACIÓN
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];
if(isset($AUTORIZACION))
{

    list($login,$token) = explode(':', $AUTORIZACION);
    if( comprobarSesion($login,$token) )
    {
        $mysql .= ', (select count(*) from megusta m where m.id_foto=f.id and m.login="' . $login . '") as usu_megusta,';
        $mysql .= '(select count(*) from favorita fav where fav.id_foto=f.id and fav.login="' . $login . '") as usu_favorita';
    }
}
$mysql .= ' FROM foto f';
// =================================================================================
// PRIMER NIVEL DE DECISIÓN: SE PIDEN DATOS DE UN REGISTRO CONCRETO O DE TODOS?
// =================================================================================
$ordenacion = true; // indica si hay que añadir la ordenación
$ID = array_shift($RECURSO); // Se comprueba si se proporciona el id del registro
if(is_numeric($ID)) // Se debe devolver toda la información del registro
{
    switch (array_shift($RECURSO)) {
        case 'comentarios':
                $mysql  = 'select * from comentario where id_foto=' . sanatize($ID) . ' order by fechahora desc';
                $ordenacion = false;
            break;
        default: // SE PIDE TODA LA INFORMACIÓN DE UNA FOTO CONCRETA
                $mysql .= ' where id=' . sanatize($ID);
            break;
    }
}
else if( count($PARAMS) > 0 )
{ // FILTRAR (se utilizan parámetros)
    $mysql = aplicarFiltro($mysql, $PARAMS);
}
// ORDENACIÓN:
if($ordenacion) $mysql = ordenar($mysql, $PARAMS);
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

// echo $mysql;
// exit();
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
if( strlen($mysql)>0 && count($R)==0 && $res=mysqli_query( $link, $mysql ) )
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
    if( substr($mysql, 0, 6) == 'select' )
    {
        while( $row = mysqli_fetch_assoc( $res ) )
        {
            $fila = $row;
            if($ordenacion)
            {
                $fila['etiquetas'] = [];
                $mysql2 = "select e.* from etiqueta e, etiquetado etiq where e.id=etiq.id_etiqueta and etiq.id_foto=" . $row['id'];
                if($resEtiqs = mysqli_query($link, $mysql2))
                {
                    while( $rowEtiq = mysqli_fetch_assoc( $resEtiqs ) )
                        $fila['etiquetas'][] = Array('id'=>$rowEtiq['id'], 'nombre'=>$rowEtiq['nombre']);
                }
                mysqli_free_result( $resEtiqs );
            }
            $FILAS[] = $fila;
        }
        mysqli_free_result( $res );

        $R['FILAS'] = $FILAS;
    }
    else $R[] = $res;
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