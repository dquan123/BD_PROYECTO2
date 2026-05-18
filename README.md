# Proyecto 3 - Sistema de Gestión de Inventario y Ventas

Aplicación web para gestionar el inventario y las ventas de una tienda.
Desarrollada con PostgreSQL, Node.js + Express y HTML/CSS/JS puro, desplegada con Docker.

## Requisitos

- Docker Desktop instalado y corriendo

## Instrucciones para levantar el proyecto

1. Clona el repositorio:
   git clone <url-del-repositorio>
   cd BD_PROYECTO2

2. Levanta el proyecto:
   docker compose up --build

3. Abre el navegador y entra a:
   http://localhost:8080

## Credenciales de base de datos

- Usuario: proy3
- Contraseña: secret

## Usuarios de prueba

- admin / hash_admin123
- jperez / hash_jperez123

## Estructura del proyecto

BD_PROYECTO2/

├── backend/

│   ├── src/

│   │   └── routes/

│   │       ├── auth.js

│   │       ├── productos.js

│   │       ├── clientes.js

│   │       ├── ventas.js

│   │       ├── reportes.js

│   │       ├── categorias.js

│   │       ├── proveedores.js

│   │       └── empleados.js

│   ├── Dockerfile

│   ├── package.json

│   ├── index.js

│   └── src/db.js

├── frontend/

│   ├── public/

│   │   ├── index.html

│   │   ├── styles.css

│   │   ├── app.js

│   │   ├── productos.js

│   │   ├── clientes.js

│   │   ├── ventas.js

│   │   └── reportes.js

│   └── Dockerfile

├── database/

│   ├── init.sql

│   └── seed.sql

├── .env

├── .env.example

└── docker-compose.yml

## Funcionalidades

- Login y logout con sesión JWT
- CRUD completo de productos y clientes
- Registro de ventas con múltiples productos y control de stock
- Reportes con JOINs, subqueries, GROUP BY, HAVING, CTE y VIEW
- Manejo de errores visible en la UI

## Notas

- La base de datos se inicializa automáticamente con tablas y datos de prueba al correr docker compose up por primera vez
- Para reiniciar la base de datos desde cero: docker compose down -v && docker compose up --build


## Esquema de Roles

### rol_admin
- **Acceso:** Total a todas las tablas
- **Operaciones:** SELECT, INSERT, UPDATE, DELETE en todas las tablas
- **Usuario de prueba:** usuario_admin / secret

### rol_gerente
- **Tablas y operaciones:**
  - venta: SELECT, INSERT, UPDATE
  - detalle_venta: SELECT, INSERT, UPDATE
  - producto: SELECT, INSERT, UPDATE, DELETE
  - categoria: SELECT, INSERT, UPDATE, DELETE
  - proveedor: SELECT, INSERT, UPDATE, DELETE
  - cliente: SELECT
  - empleado: SELECT
  - usuario: SELECT
- **Usuario de prueba:** usuario_gerente / secret

### rol_vendedor
- **Tablas y operaciones:**
  - venta: SELECT, INSERT
  - detalle_venta: SELECT, INSERT
  - producto: SELECT
  - cliente: SELECT
  - categoria: SELECT
  - proveedor: SELECT
- **Usuario de prueba:** usuario_vendedor / secret

### rol_cajero
- **Tablas y operaciones:**
  - venta: SELECT
  - detalle_venta: SELECT
  - producto: SELECT
  - cliente: SELECT
- **Usuario de prueba:** usuario_cajero / secret

### rol_bodeguero
- **Tablas y operaciones:**
  - producto: SELECT, UPDATE
  - categoria: SELECT
  - proveedor: SELECT
- **Usuario de prueba:** usuario_bodeguero / secret

## Protección de rutas por rol

| Sección | admin | gerente | vendedor | cajero | bodeguero |
|---------|-------|---------|----------|--------|-----------|
| Productos (ver) | ✔ | ✔ | ✔ | X | ✔ |
| Productos (crear/editar) | ✔ | ✔ | X | X | X |
| Productos (eliminar) | ✔ | X | X | X | X |
| Clientes (ver) | ✔ | ✔ | X | X | X |
| Clientes (crear/editar) | ✔ | ✔ | X | X | X |
| Clientes (eliminar) | ✔ | X | X | X | X |
| Ventas (ver) | ✔ | ✔ | ✔ | ✔ | X |
| Ventas (crear) | ✔ | ✔ | ✔ | X | X |
| Reportes | ✔ | ✔ | X | X | X |
