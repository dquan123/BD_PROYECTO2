const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// GET todos los productos - todos los roles pueden ver
router.get('/', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio_unitario, p.stock,
                   c.nombre AS categoria, pr.nombre AS proveedor
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
            ORDER BY p.id_producto
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET un producto por ID - todos los roles pueden ver
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio_unitario, p.stock,
                   c.nombre AS categoria, pr.nombre AS proveedor
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
            WHERE p.id_producto = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// POST crear producto - solo admin y gerente
router.post('/', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body;
    if (!nombre || !precio_unitario || !stock || !id_categoria || !id_proveedor) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
        const result = await pool.query(`
            INSERT INTO producto (nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT editar producto - solo admin y gerente
router.put('/:id', verificarToken, verificarRol('admin', 'gerente'), async (req, res) => {
    const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body;
    if (!nombre || !precio_unitario || !stock || !id_categoria || !id_proveedor) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
        const result = await pool.query(`
            UPDATE producto
            SET nombre=$1, descripcion=$2, precio_unitario=$3, stock=$4, id_categoria=$5, id_proveedor=$6
            WHERE id_producto=$7
            RETURNING *
        `, [nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor, req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE eliminar producto - solo admin
router.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM producto WHERE id_producto=$1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;