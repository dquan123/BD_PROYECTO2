const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cliente ORDER BY id_cliente'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// GET un cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cliente WHERE id_cliente = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// POST crear cliente
router.post('/', async (req, res) => {
    const { nombre, telefono, email, direccion } = req.body;
    if (!nombre || !telefono || !email || !direccion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
        const result = await pool.query(`
            INSERT INTO cliente (nombre, telefono, email, direccion)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nombre, telefono, email, direccion]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

// PUT editar cliente
router.put('/:id', async (req, res) => {
    const { nombre, telefono, email, direccion } = req.body;
    if (!nombre || !telefono || !email || !direccion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
        const result = await pool.query(`
            UPDATE cliente
            SET nombre=$1, telefono=$2, email=$3, direccion=$4
            WHERE id_cliente=$5
            RETURNING *
        `, [nombre, telefono, email, direccion, req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

// DELETE eliminar cliente
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM cliente WHERE id_cliente=$1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

module.exports = router;