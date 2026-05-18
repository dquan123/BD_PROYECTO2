-- Tabla usuario
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL
);

-- Tabla empleado
CREATE TABLE IF NOT EXISTS empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- Tabla cliente
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL
);

-- Tabla categoria
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL
);

-- Tabla proveedor
CREATE TABLE IF NOT EXISTS proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL
);

-- Tabla producto
CREATE TABLE IF NOT EXISTS producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    id_categoria INT NOT NULL,
    id_proveedor INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

-- Tabla venta
CREATE TABLE IF NOT EXISTS venta (
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    total DECIMAL(10,2) NOT NULL,
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- Tabla detalle_venta
CREATE TABLE IF NOT EXISTS detalle_venta (
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- View resumen de ventas por cliente
CREATE OR REPLACE VIEW resumen_ventas AS
SELECT c.nombre AS cliente,
       COUNT(v.id_venta) AS total_compras,
       SUM(v.total) AS total_gastado,
       MAX(v.fecha) AS ultima_compra
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
GROUP BY c.nombre
ORDER BY total_gastado DESC;


-- ROLES DE BASES DE DATOS

--Roles
CREATE ROLE rol_admin;
CREATE ROLE rol_gerente;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_cajero;
CREATE ROLE rol_bodeguero;

--Rol admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

--Rol gerente
GRANT SELECT, INSERT, UPDATE ON venta TO rol_gerente;
GRANT SELECT, INSERT, UPDATE ON detalle_venta TO rol_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON producto TO rol_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON categoria TO rol_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON proveedor TO rol_gerente;
GRANT SELECT ON cliente TO rol_gerente;
GRANT SELECT ON empleado TO rol_gerente;
GRANT SELECT ON usuario TO rol_gerente;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_gerente;

--Rol vendedor
GRANT SELECT, INSERT ON venta TO rol_vendedor;
GRANT SELECT, INSERT ON detalle_venta TO rol_vendedor;
GRANT SELECT ON producto TO rol_vendedor;
GRANT SELECT ON cliente TO rol_vendedor;
GRANT SELECT ON categoria TO rol_vendedor;
GRANT SELECT ON proveedor TO rol_vendedor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor;

--Rol cajero
GRANT SELECT ON venta TO rol_cajero;
GRANT SELECT ON detalle_venta TO rol_cajero;
GRANT SELECT ON producto TO rol_cajero;
GRANT SELECT ON cliente TO rol_cajero;

--Rol bodeguero
GRANT SELECT, UPDATE ON producto TO rol_bodeguero;
GRANT SELECT ON categoria TO rol_bodeguero;
GRANT SELECT ON proveedor TO rol_bodeguero;

--Usuarios iniciales por rol
CREATE USER usuario_admin WITH PASSWORD 'secret' IN ROLE rol_admin;
CREATE USER usuario_gerente WITH PASSWORD 'secret' IN ROLE rol_gerente;
CREATE USER usuario_vendedor WITH PASSWORD 'secret' IN ROLE rol_vendedor;
CREATE USER usuario_cajero WITH PASSWORD 'secret' IN ROLE rol_cajero;
CREATE USER usuario_bodeguero WITH PASSWORD 'secret' IN ROLE rol_bodeguero;