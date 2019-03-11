-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 22-02-2019 a las 17:43:36
-- Versión del servidor: 10.1.36-MariaDB
-- Versión de PHP: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fotos`
--

DROP DATABASE IF EXISTS `fotos`;
CREATE DATABASE IF NOT EXISTS `fotos` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `fotos`;

-- --------------------------------------------------------

--
-- Permisos de acceso al usuario 'pcw' con password 'pcw'
--
GRANT ALL PRIVILEGES ON `fotos`.* TO 'pcw'@127.0.0.1 IDENTIFIED BY 'pcw';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

DROP TABLE IF EXISTS `comentario`;
CREATE TABLE `comentario` (
  `id` int(11) NOT NULL,
  `login` varchar(20) NOT NULL,
  `id_foto` int(11) NOT NULL,
  `titulo` varchar(50) NOT NULL,
  `texto` varchar(200) NOT NULL,
  `fechahora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `comentario`
--

INSERT INTO `comentario` (`id`, `login`, `id_foto`, `titulo`, `texto`, `fechahora`) VALUES
(9, 'usuario3', 31, 'Bonita foto', 'Buena carretera para recorrer sin prisa', '2019-02-22 16:19:46'),
(10, 'usuario3', 32, 'Buen salto', 'Buen lugar para bañarse', '2019-02-22 16:21:40'),
(11, 'usuario2', 32, 'Cuidado con las rocas', 'Es un buen lugar para bañarse, pero hay que tener cuidado con las rocas que hay bajo el agua.', '2019-02-22 16:23:55'),
(12, 'usuario3', 29, 'Preciosa foto', 'Bonita combinación de colores.', '2019-02-22 16:24:52'),
(13, 'usuario2', 36, 'Buen lugar para relajarse', 'Es un buen lugar para ir a caminar y relajarse con las bonitas vistas.', '2019-02-22 16:25:53'),
(14, 'usuario1', 36, 'Con bicicleta', 'También se puede ir con bicicleta de carretera. Es una subida dura, pero muy bonita.', '2019-02-22 16:28:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiqueta`
--

DROP TABLE IF EXISTS `etiqueta`;
CREATE TABLE `etiqueta` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `etiqueta`
--

INSERT INTO `etiqueta` (`id`, `nombre`) VALUES
(22, 'Acantilados'),
(14, 'Atardecer'),
(19, 'Carretera'),
(26, 'Desiertos'),
(24, 'Edificios'),
(29, 'Lago'),
(23, 'Libros'),
(16, 'Mar'),
(17, 'Montaña'),
(21, 'Naturaleza'),
(18, 'Nieve'),
(28, 'Otoño'),
(15, 'Playa'),
(25, 'Río');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiquetado`
--

DROP TABLE IF EXISTS `etiquetado`;
CREATE TABLE `etiquetado` (
  `id_foto` int(11) NOT NULL,
  `id_etiqueta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `etiquetado`
--

INSERT INTO `etiquetado` (`id_foto`, `id_etiqueta`) VALUES
(29, 14),
(29, 15),
(29, 16),
(30, 17),
(30, 18),
(31, 14),
(31, 16),
(31, 19),
(32, 16),
(32, 21),
(32, 22),
(33, 23),
(33, 24),
(34, 21),
(34, 25),
(35, 21),
(35, 26),
(36, 14),
(36, 17),
(37, 17),
(37, 28),
(37, 29);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favorita`
--

DROP TABLE IF EXISTS `favorita`;
CREATE TABLE `favorita` (
  `login` varchar(20) NOT NULL,
  `id_foto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `favorita`
--

INSERT INTO `favorita` (`login`, `id_foto`) VALUES
('usuario1', 30),
('usuario1', 33),
('usuario1', 35),
('usuario1', 36),
('usuario1', 37),
('usuario2', 32),
('usuario3', 31);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `foto`
--

DROP TABLE IF EXISTS `foto`;
CREATE TABLE `foto` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `fichero` varchar(100) NOT NULL COMMENT 'Nombre, con extensión, del fichero',
  `ancho` smallint(6) NOT NULL,
  `alto` smallint(6) NOT NULL,
  `peso` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha en la que se tomó la foto',
  `login` varchar(20) NOT NULL COMMENT 'Usuario que hizo la foto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `foto`
--

INSERT INTO `foto` (`id`, `titulo`, `descripcion`, `fichero`, `ancho`, `alto`, `peso`, `fecha`, `login`) VALUES
(29, 'Atardecer en la playa', 'Foto tomada a la orilla de la playa, una tarde de verano', '29.jpg', 1920, 1080, 151138, '2019-02-22 12:13:11', 'usuario1'),
(30, 'Relajación en plena naturaleza', 'Montañas con nieve en pleno otoño. Foto tomada ... de internet', '30.jpg', 1920, 1080, 304634, '2019-02-22 12:15:58', 'usuario2'),
(31, 'Carretera infinita', 'Foto tomada al atardecer. Se puede apreciar el mar en calma a la izquierda.', '31.jpg', 1920, 1080, 101151, '2019-02-22 12:17:29', 'usuario1'),
(32, 'Belleza de la naturaleza', 'Acantilados del norte en un día soleado. Increíble la belleza del río alimentando el mar.', '32.jpg', 1950, 1300, 298937, '2019-02-22 12:19:37', 'usuario3'),
(33, 'Un día en la oficina', 'Foto tomada en la biblioteca general. Miles de libros para leer y relajarse.', '33.jpg', 1950, 1300, 305666, '2019-02-22 12:20:58', 'usuario2'),
(34, 'Caída de agua', 'Caída de agua en el río más grande y caudaloso de la región.', '34.jpg', 1934, 1451, 293195, '2019-02-22 12:22:29', 'usuario1'),
(35, 'Desierto infinito', 'Fotografía del desierto que da nombre a la región en la que se encuentra. ', '35.jpg', 1931, 937, 232449, '2019-02-22 12:23:38', 'usuario3'),
(36, 'Atardecer en la montaña', 'Foto tomada durante el atardecer de una tarde de marzo en el Monte Grappa, Italia', '36.jpg', 1258, 839, 132318, '2019-02-22 15:27:29', 'usuario2'),
(37, 'Otoño en las montañas', 'Parque nacional Yosemite. Foto del lago en otoño, con las montañas al fondo.', '37.jpg', 1920, 1080, 274792, '2019-02-22 15:35:57', 'usuario2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `megusta`
--

DROP TABLE IF EXISTS `megusta`;
CREATE TABLE `megusta` (
  `login` varchar(20) NOT NULL,
  `id_foto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `megusta`
--

INSERT INTO `megusta` (`login`, `id_foto`) VALUES
('usuario1', 29),
('usuario1', 30),
('usuario1', 31),
('usuario1', 32),
('usuario1', 35),
('usuario1', 36),
('usuario1', 37),
('usuario2', 29),
('usuario2', 32),
('usuario3', 31),
('usuario3', 32),
('usuario3', 33);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `login` varchar(20) NOT NULL,
  `pwd` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(250) NOT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`login`, `pwd`, `nombre`, `email`, `token`, `ultimo_acceso`) VALUES
('usuario1', 'usuario1', 'Usuario 1', 'usuario1@pcw.es', '22855375a9b87dcf894c861a6db36561decce7d455be7d335c0de0d9e8a5cdd48987f3d400269de1bbc9f4df524ccaeff3bdf6516bbdb46b7cc3cc2844c441d5', '2019-02-22 16:26:09'),
('usuario2', 'usuario2', 'Usuario 2', 'usuario2@pcw.es', '05f11009b587e0eb7056a862870ef1b1dd01f2359827766c4bc87eeed82efe7808255bf12208a352d51cc094d853e74f1b88615e664eed96f2a5587b94767521', '2019-02-22 16:23:21'),
('usuario3', 'usuario3', 'Usuario 3', 'usuario3@pcw.es', '69b6b48a222a33eb68fdfe0fe6b4851f2f4d6ff8a083e67e5d45f4d820a34234d9180893b5644d7cf8116bc8562980ab6afdabaca307085137c862977ceba37b', '2019-02-22 16:18:53');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_foto` (`id_foto`),
  ADD KEY `login` (`login`);

--
-- Indices de la tabla `etiqueta`
--
ALTER TABLE `etiqueta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `etiquetado`
--
ALTER TABLE `etiquetado`
  ADD PRIMARY KEY (`id_foto`,`id_etiqueta`),
  ADD KEY `Con etiqueta` (`id_etiqueta`);

--
-- Indices de la tabla `favorita`
--
ALTER TABLE `favorita`
  ADD PRIMARY KEY (`login`,`id_foto`),
  ADD UNIQUE KEY `login` (`login`,`id_foto`),
  ADD KEY `favorita_ibfk_1` (`id_foto`);

--
-- Indices de la tabla `foto`
--
ALTER TABLE `foto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `login` (`login`);

--
-- Indices de la tabla `megusta`
--
ALTER TABLE `megusta`
  ADD PRIMARY KEY (`login`,`id_foto`),
  ADD KEY `id_foto` (`id_foto`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`login`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `etiqueta`
--
ALTER TABLE `etiqueta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `foto`
--
ALTER TABLE `foto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_foto`) REFERENCES `foto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `etiquetado`
--
ALTER TABLE `etiquetado`
  ADD CONSTRAINT `etiquetado_ibfk_1` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiqueta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `etiquetado_ibfk_2` FOREIGN KEY (`id_foto`) REFERENCES `foto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `favorita`
--
ALTER TABLE `favorita`
  ADD CONSTRAINT `favorita_ibfk_1` FOREIGN KEY (`id_foto`) REFERENCES `foto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favorita_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `foto`
--
ALTER TABLE `foto`
  ADD CONSTRAINT `foto_ibfk_1` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `megusta`
--
ALTER TABLE `megusta`
  ADD CONSTRAINT `megusta_ibfk_1` FOREIGN KEY (`id_foto`) REFERENCES `foto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `megusta_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
