const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET todas las ventas con JOIN a cliente y empleado
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente,
                   e.nombre AS empleado
            FROM venta v
            JOIN cliente c ON v.id_cliente = c.id_cliente
            JOIN empleado e ON v.id_empleado = e.id_empleado
            ORDER BY v.fecha DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// GET detalle de una venta con JOIN a producto
router.get('/:id', async (req, res) => {
    try {
        const venta = await pool.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente,
                   e.nombre AS empleado
            FROM venta v
            JOIN cliente c ON v.id_cliente = c.id_cliente
            JOIN empleado e ON v.id_empleado = e.id_empleado
            WHERE v.id_venta = $1
        `, [req.params.id]);

        if (venta.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        const detalle = await pool.query(`
            SELECT dv.cantidad, dv.precio_unitario,
                   p.nombre AS producto
            FROM detalle_venta dv
            JOIN producto p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = $1
        `, [req.params.id]);

        res.json({ ...venta.rows[0], detalle: detalle.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener venta' });
    }
});

// POST crear venta con transacción explícita
router.post('/', async (req, res) => {
    const { id_cliente, id_empleado, detalle } = req.body;

    if (!id_cliente || !id_empleado || !detalle || detalle.length === 0) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Calcular total y verificar stock
        let total = 0;
        for (const item of detalle) {
            const producto = await client.query(
                'SELECT precio_unitario, stock FROM producto WHERE id_producto = $1',
                [item.id_producto]
            );

            if (producto.rows.length === 0) {
                throw new Error(`Producto ${item.id_producto} no encontrado`);
            }

            if (producto.rows[0].stock < item.cantidad) {
                throw new Error(`Stock insuficiente para producto ${item.id_producto}`);
            }

            total += producto.rows[0].precio_unitario * item.cantidad;
        }

        // Insertar venta
        const venta = await client.query(`
            INSERT INTO venta (fecha, total, id_cliente, id_empleado)
            VALUES (NOW(), $1, $2, $3)
            RETURNING id_venta
        `, [total, id_cliente, id_empleado]);

        const id_venta = venta.rows[0].id_venta;

        // Insertar detalle y descontar stock
        for (const item of detalle) {
            const producto = await client.query(
                'SELECT precio_unitario FROM producto WHERE id_producto = $1',
                [item.id_producto]
            );

            await client.query(`
                INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
            `, [id_venta, item.id_producto, item.cantidad, producto.rows[0].precio_unitario]);

            await client.query(`
                UPDATE producto SET stock = stock - $1
                WHERE id_producto = $2
            `, [item.cantidad, item.id_producto]);
        }

        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Venta creada correctamente', id_venta });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Error al crear venta' });
    } finally {
        client.release();
    }
});

module.exports = router;