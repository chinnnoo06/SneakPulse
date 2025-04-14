-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 13-04-2025 a las 07:10:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `practica`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `ID` int(11) NOT NULL,
  `Nombre` varchar(150) NOT NULL,
  `Img_Url` varchar(150) NOT NULL,
  `Precio` decimal(10,0) NOT NULL,
  `Cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`ID`, `Nombre`, `Img_Url`, `Precio`, `Cantidad`) VALUES
(1, 'Nike Jordan 1 Mid - Vela/Sombrío apagado/Blanco/Rojo gimnasio', 'assets/tenis1.jpg', 3199, 10),
(2, 'Air Jordan 1 Low -  Ratán/Vela/Camuflaje del desierto', 'assets/tenis2.jpg', 2899, 10),
(3, 'Nike Court Vision Low Next Nature - Vela/Blanco/Naranja seguridad', 'assets/tenis3.jpg', 1799, 10),
(4, 'Nike Blazer Mid 77 Vintage - Blanco/Blanco cumbre/Vela/Azul royal intenso', 'assets/tenis4.jpg', 2499, 10);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
