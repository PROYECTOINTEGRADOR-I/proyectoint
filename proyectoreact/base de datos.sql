-- =========================================================
--  Setup de esquema REGISTRO_PAGOS completo (MySQL 8+)
-- =========================================================
-- Nota: CHECK requiere MySQL 8.0.16+ (en 5.7 se ignora).
-- Seguridad: MD5 se usa aquí solo por compatibilidad con tu ejemplo.
-- =========================================================

-- Crear BD y usarla
CREATE DATABASE IF NOT EXISTS `registro_pagos` 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `registro_pagos`;

-- ---------- Limpieza segura (si ya existía algo) ----------
-- Quitar dependencias en orden: vistas -> trigger -> rutinas -> tablas
DROP VIEW IF EXISTS `Vista_PagosRealizados`;
DROP VIEW IF EXISTS `Vista_Facturas`;

DROP TRIGGER IF EXISTS `TR_BeforeInsert_Transacciones`;

DROP PROCEDURE IF EXISTS `SP_ProcesarPago`;
DROP PROCEDURE IF EXISTS `SP_LoginUsuario`;
DROP PROCEDURE IF EXISTS `SP_RegistrarTransaccion`;

DROP FUNCTION IF EXISTS `FN_GetPrecioMaterial`;

DROP TABLE IF EXISTS `Pagos`;
DROP TABLE IF EXISTS `Transacciones`;
DROP TABLE IF EXISTS `Materiales`;
DROP TABLE IF EXISTS `Usuarios`;

-- ===================== TABLAS =====================

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS `Usuarios` (
  `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_usuario` VARCHAR(50) UNIQUE NOT NULL,
  `contrasena_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('Agente Manual','Cajero') NOT NULL,
  `activo` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Tabla Materiales
CREATE TABLE IF NOT EXISTS `Materiales` (
  `id_material` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_material` VARCHAR(100) UNIQUE NOT NULL,
  `precio_kg` DECIMAL(10,2) NOT NULL CHECK (`precio_kg` > 0)
) ENGINE=InnoDB;

-- Tabla Transacciones
CREATE TABLE IF NOT EXISTS `Transacciones` (
  `id_transaccion` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha_hora` DATETIME NOT NULL,
  `id_material` INT NOT NULL,
  `pesaje_kg` DECIMAL(10,2) NOT NULL CHECK (`pesaje_kg` > 0),
  `monto_total` DECIMAL(10,2) NOT NULL,
  `nombre_cliente` VARCHAR(100) NOT NULL,
  `qr_token` VARCHAR(255) UNIQUE NOT NULL,
  `qr_usado` BOOLEAN DEFAULT FALSE,
  `id_agente_manual` INT NOT NULL,
  CONSTRAINT `fk_trans_mat` FOREIGN KEY (`id_material`) REFERENCES `Materiales`(`id_material`),
  CONSTRAINT `fk_trans_agente` FOREIGN KEY (`id_agente_manual`) REFERENCES `Usuarios`(`id_usuario`)
) ENGINE=InnoDB;

-- Tabla Pagos
CREATE TABLE IF NOT EXISTS `Pagos` (
  `id_pago` INT AUTO_INCREMENT PRIMARY KEY,
  `id_transaccion` INT UNIQUE NOT NULL,
  `fecha_hora_pago` DATETIME NOT NULL,
  `monto_pagado` DECIMAL(10,2) NOT NULL,
  `id_cajero` INT NOT NULL,
  CONSTRAINT `fk_pagos_trans` FOREIGN KEY (`id_transaccion`) REFERENCES `Transacciones`(`id_transaccion`),
  CONSTRAINT `fk_pagos_cajero` FOREIGN KEY (`id_cajero`) REFERENCES `Usuarios`(`id_usuario`)
) ENGINE=InnoDB;

-- ===================== DATA SEMILLA =====================

-- Usuarios fijos (hashes de ejemplo)
INSERT INTO `Usuarios` (`nombre_usuario`, `contrasena_hash`, `rol`)
VALUES
  ('agente1', '24c9e15e52afc473ae2ee5608605df04', 'Agente Manual') -- "pass123" (MD5)
ON DUPLICATE KEY UPDATE contrasena_hash=VALUES(contrasena_hash), rol=VALUES(rol);

INSERT INTO `Usuarios` (`nombre_usuario`, `contrasena_hash`, `rol`)
VALUES
  ('cajero1', '1a9a834d8ee9488a09b4b04ff04f4c6e', 'Cajero') -- "pass456" (MD5)
ON DUPLICATE KEY UPDATE contrasena_hash=VALUES(contrasena_hash), rol=VALUES(rol);

INSERT INTO `Usuarios` (`nombre_usuario`, `contrasena_hash`, `rol`)
VALUES
  ('cajero2', MD5('pass789'), 'Cajero')
ON DUPLICATE KEY UPDATE contrasena_hash=VALUES(contrasena_hash), rol=VALUES(rol);

INSERT INTO `Usuarios` (`nombre_usuario`, `contrasena_hash`, `rol`)
VALUES
  ('admin', MD5('password'), 'Agente Manual')
ON DUPLICATE KEY UPDATE contrasena_hash=VALUES(contrasena_hash), rol=VALUES(rol);


-- Materiales de ejemplo
INSERT INTO `Materiales` (`nombre_material`, `precio_kg`) VALUES
  ('Cobre', 500.00),
  ('Aluminio', 350.00),
  ('Hierro', 150.00)
ON DUPLICATE KEY UPDATE precio_kg=VALUES(precio_kg);

-- ===================== FUNCIÓN =====================

DELIMITER //
CREATE FUNCTION `FN_GetPrecioMaterial` (p_id_material INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
  DECLARE v_precio DECIMAL(10,2);
  SELECT `precio_kg` INTO v_precio FROM `Materiales` WHERE `id_material` = p_id_material;
  RETURN v_precio;
END //
DELIMITER ;

-- ===================== PROCEDIMIENTOS =====================

-- Login de usuario
DELIMITER //
CREATE PROCEDURE `SP_LoginUsuario` (
  IN p_nombre_usuario VARCHAR(50),
  IN p_contrasena VARCHAR(255),
  OUT o_id_usuario INT,
  OUT o_rol VARCHAR(50),
  OUT o_login_exitoso BOOLEAN
)
BEGIN
  DECLARE v_contrasena_hash VARCHAR(255);
  DECLARE v_activo BOOLEAN;

  SELECT `id_usuario`, `contrasena_hash`, `rol`, `activo`
    INTO o_id_usuario, v_contrasena_hash, o_rol, v_activo
  FROM `Usuarios`
  WHERE `nombre_usuario` = p_nombre_usuario;

  IF o_id_usuario IS NOT NULL AND v_contrasena_hash = MD5(p_contrasena) AND v_activo = TRUE THEN
    SET o_login_exitoso = TRUE;
  ELSE
    SET o_login_exitoso = FALSE;
  END IF;
END //
DELIMITER ;

-- Registrar transacción
DELIMITER //
CREATE PROCEDURE `SP_RegistrarTransaccion` (
  IN p_id_material INT,
  IN p_pesaje_kg DECIMAL(10,2),
  IN p_nombre_cliente VARCHAR(100),
  IN p_id_agente_manual INT,
  OUT o_id_transaccion INT,
  OUT o_qr_token VARCHAR(255)
)
BEGIN
  DECLARE v_precio_kg DECIMAL(10,2);
  DECLARE v_monto_total DECIMAL(10,2);
  DECLARE v_qr_token VARCHAR(255);

  SELECT `precio_kg` INTO v_precio_kg
  FROM `Materiales`
  WHERE `id_material` = p_id_material;

  IF v_precio_kg IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Material no encontrado.';
  END IF;

  SET v_monto_total = p_pesaje_kg * v_precio_kg;
  SET v_qr_token = UUID();

  INSERT INTO `Transacciones` (
    `fecha_hora`, `id_material`, `pesaje_kg`, `monto_total`,
    `nombre_cliente`, `qr_token`, `id_agente_manual`
  ) VALUES (
    NOW(), p_id_material, p_pesaje_kg, v_monto_total,
    p_nombre_cliente, v_qr_token, p_id_agente_manual
  );

  SET o_id_transaccion = LAST_INSERT_ID();
  SET o_qr_token = v_qr_token;
END //
DELIMITER ;

-- Procesar pago
DELIMITER //
CREATE PROCEDURE `SP_ProcesarPago` (
  IN p_qr_token VARCHAR(255),
  IN p_id_cajero INT,
  OUT o_pago_exitoso BOOLEAN,
  OUT o_mensaje VARCHAR(255)
)
BEGIN
  DECLARE v_id_transaccion INT;
  DECLARE v_monto_total DECIMAL(10,2);
  DECLARE v_qr_usado BOOLEAN;

  SELECT `id_transaccion`, `monto_total`, `qr_usado`
    INTO v_id_transaccion, v_monto_total, v_qr_usado
  FROM `Transacciones`
  WHERE `qr_token` = p_qr_token;

  IF v_id_transaccion IS NULL THEN
    SET o_pago_exitoso = FALSE;
    SET o_mensaje = 'QR no válido o no encontrado.';
  ELSEIF v_qr_usado = TRUE THEN
    SET o_pago_exitoso = FALSE;
    SET o_mensaje = 'Este QR ya ha sido utilizado para un pago.';
  ELSE
    INSERT INTO `Pagos` (`id_transaccion`, `fecha_hora_pago`, `monto_pagado`, `id_cajero`)
    VALUES (v_id_transaccion, NOW(), v_monto_total, p_id_cajero);

    UPDATE `Transacciones` SET `qr_usado` = TRUE
    WHERE `id_transaccion` = v_id_transaccion;

    SET o_pago_exitoso = TRUE;
    SET o_mensaje = 'Pago registrado exitosamente.';
  END IF;
END //
DELIMITER ;

-- ===================== TRIGGER =====================

DELIMITER //
CREATE TRIGGER `TR_BeforeInsert_Transacciones`
BEFORE INSERT ON `Transacciones`
FOR EACH ROW
BEGIN
  DECLARE v_precio_kg DECIMAL(10,2);
  SELECT `precio_kg` INTO v_precio_kg
  FROM `Materiales` WHERE `id_material` = NEW.id_material;

  IF v_precio_kg IS NOT NULL THEN
    SET NEW.monto_total = NEW.pesaje_kg * v_precio_kg;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Material ID no válido en la transacción.';
  END IF;
END //
DELIMITER ;

-- ===================== VISTAS =====================

CREATE VIEW `Vista_Facturas` AS
SELECT
  t.id_transaccion,
  t.fecha_hora,
  m.nombre_material AS material,
  t.pesaje_kg,
  t.monto_total,
  t.nombre_cliente AS nombre_usuario,
  t.qr_token,
  t.qr_usado,
  u.nombre_usuario AS registrado_por_agente
FROM `Transacciones` t
JOIN `Materiales` m ON t.id_material = m.id_material
JOIN `Usuarios` u ON t.id_agente_manual = u.id_usuario;

CREATE VIEW `Vista_PagosRealizados` AS
SELECT
  p.id_pago,
  t.id_transaccion,
  t.nombre_cliente,
  m.nombre_material AS material_pagado,
  t.pesaje_kg,
  p.monto_pagado,
  p.fecha_hora_pago,
  uc.nombre_usuario AS cajero_que_pago
FROM `Pagos` p
JOIN `Transacciones` t ON p.id_transaccion = t.id_transaccion
JOIN `Materiales` m ON t.id_material = m.id_material
JOIN `Usuarios` uc ON p.id_cajero = uc.id_usuario;

-- ===================== USUARIOS & PERMISOS =====================

-- Nota: estos usuarios son locales al host (localhost).
-- Ajusta el host (p.ej. '%' o IP) si necesitas remoto.
CREATE USER IF NOT EXISTS 'agente_manual_user'@'localhost' IDENTIFIED BY 'password_agente';
CREATE USER IF NOT EXISTS 'cajero_user'@'localhost' IDENTIFIED BY 'password_cajero';

-- Permisos Agente Manual
GRANT SELECT ON `registro_pagos`.`Materiales` TO 'agente_manual_user'@'localhost';
GRANT SELECT, INSERT ON `registro_pagos`.`Transacciones` TO 'agente_manual_user'@'localhost';
GRANT EXECUTE ON PROCEDURE `registro_pagos`.`SP_LoginUsuario` TO 'agente_manual_user'@'localhost';
GRANT EXECUTE ON PROCEDURE `registro_pagos`.`SP_RegistrarTransaccion` TO 'agente_manual_user'@'localhost';
GRANT EXECUTE ON FUNCTION `registro_pagos`.`FN_GetPrecioMaterial` TO 'agente_manual_user'@'localhost';
GRANT SELECT ON `registro_pagos`.`Vista_Facturas` TO 'agente_manual_user'@'localhost';

-- Permisos Cajero
GRANT SELECT, UPDATE ON `registro_pagos`.`Transacciones` TO 'cajero_user'@'localhost';
GRANT INSERT ON `registro_pagos`.`Pagos` TO 'cajero_user'@'localhost';
GRANT SELECT ON `registro_pagos`.`Materiales` TO 'cajero_user'@'localhost';
GRANT EXECUTE ON PROCEDURE `registro_pagos`.`SP_LoginUsuario` TO 'cajero_user'@'localhost';
GRANT EXECUTE ON PROCEDURE `registro_pagos`.`SP_ProcesarPago` TO 'cajero_user'@'localhost';
GRANT SELECT ON `registro_pagos`.`Vista_Facturas` TO 'cajero_user'@'localhost';
GRANT SELECT ON `registro_pagos`.`Vista_PagosRealizados` TO 'cajero_user'@'localhost';

FLUSH PRIVILEGES;

-- Agregar tabla para registro de QRs procesados
CREATE TABLE IF NOT EXISTS `QR_Procesados` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `qr_id` VARCHAR(255) UNIQUE NOT NULL,
  `fecha_procesado` DATETIME NOT NULL,
  `id_cajero` INT NOT NULL,
  `monto_procesado` DECIMAL(10,2) NOT NULL,
  CONSTRAINT `fk_qr_cajero` FOREIGN KEY (`id_cajero`) REFERENCES `Usuarios`(`id_usuario`)
) ENGINE=InnoDB;

-- Procedimiento para validar y procesar QR
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_ValidarProcesarQR` //
CREATE PROCEDURE `SP_ValidarProcesarQR` (
  IN p_qr_id VARCHAR(255),
  IN p_id_cajero INT,
  IN p_monto DECIMAL(10,2),
  OUT o_success BOOLEAN,
  OUT o_mensaje VARCHAR(255)
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;
  
  -- Verificar si el QR ya fue procesado
  SELECT COUNT(*) INTO v_exists 
  FROM `QR_Procesados` 
  WHERE `qr_id` = p_qr_id;
  
  IF v_exists > 0 THEN
    SET o_success = FALSE;
    SET o_mensaje = 'No se puede validar por segunda vez';
  ELSE
    -- Insertar nuevo registro
    INSERT INTO `QR_Procesados` (`qr_id`, `fecha_procesado`, `id_cajero`, `monto_procesado`)
    VALUES (p_qr_id, NOW(), p_id_cajero, p_monto);
    
    SET o_success = TRUE;
    SET o_mensaje = 'QR procesado exitosamente';
  END IF;
END //
DELIMITER ;

-- ===================== FIN =====================
