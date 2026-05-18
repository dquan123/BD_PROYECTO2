const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// JOIN 1: Ventas con cliente, empleado y detalle de productos
router.get('/ventas-detalle', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente,
                   e.nombre AS empleado,
                   p.nombre AS producto,
                   dv.cantidad,
                   dv.precio_unitario
            FROM venta v
            JOIN cliente c ON v.id_cliente = c.id_cliente
            JOIN empleado e ON v.id_empleado = e.id_empleado
            JOIN detalle_venta dv ON v.id_venta = dv.id_venta
            JOIN producto p ON dv.id_producto = p.id_producto
            ORDER BY v.fecha DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// JOIN 2: Productos con categoria y proveedor
router.get('/productos-detalle', verificarToken, verificarRol('admin', 'gerente', 'bodeguero'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.nombre AS producto,
                   p.precio_unitario,
                   p.stock,
                   c.nombre AS categoria,
                   pr.nombre AS proveedor,
                   pr.email AS email_proveedor
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
            ORDER BY c.nombre, p.nombre
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// JOIN 3: Empleados con su usuario asociado
router.get('/empleados-usuarios', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id_empleado, e.nombre AS empleado,
                   e.puesto, e.telefono,
                   u.username, u.rol
            FROM empleado e
            JOIN usuario u ON e.id_usuario = u.id_usuario
            ORDER BY e.nombre
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// SUBQUERY 1: Clientes con ventas (IN)
router.get('/clientes-con-ventas', verificarToken, verificarRol('admin', 'gerente', 'vendedor'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_cliente, nombre, email, telefono
            FROM cliente
            WHERE id_cliente IN (
                SELECT DISTINCT id_cliente FROM venta
            )
            ORDER BY nombre
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// SUBQUERY 2: Productos bajo stock promedio
router.get('/productos-bajo-stock', verificarToken, verificarRol('admin', 'gerente', 'bodeguero'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.nombre, p.stock, p.precio_unitario, c.nombre AS categoria
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.stock < (
                SELECT AVG(stock) FROM producto
            )
            ORDER BY p.stock ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// GROUP BY, HAVING y agregación
router.get('/ventas-por-empleado', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.nombre AS empleado,
                   COUNT(v.id_venta) AS total_ventas,
                   SUM(v.total) AS total_recaudado,
                   AVG(v.total) AS promedio_por_venta
            FROM venta v
            JOIN empleado e ON v.id_empleado = e.id_empleado
            GROUP BY e.nombre
            HAVING SUM(v.total) > 500
            ORDER BY total_recaudado DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// CTE: Top 5 productos más vendidos
router.get('/top-productos', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    try {
        const result = await pool.query(`
            WITH ventas_por_producto AS (
                SELECT p.nombre AS producto,
                       SUM(dv.cantidad) AS total_vendido,
                       SUM(dv.cantidad * dv.precio_unitario) AS ingreso_total
                FROM detalle_venta dv
                JOIN producto p ON dv.id_producto = p.id_producto
                GROUP BY p.nombre
            )
            SELECT producto, total_vendido, ingreso_total
            FROM ventas_por_producto
            ORDER BY total_vendido DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// VIEW: resumen ventas por cliente
router.get('/resumen-ventas', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM resumen_ventas`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
});

module.exports = router;