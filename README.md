# Proyecto 2 - Sistema de Gestión de Inventario y Ventas

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

- Usuario: proy2
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
