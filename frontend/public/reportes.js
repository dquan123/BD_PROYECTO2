async function loadReportes() {
    const section = document.getElementById('section-reportes');
    section.innerHTML = `
        <h2>Reportes</h2>

        <!-- Reporte 1: Ventas detalladas (JOIN múltiple) -->
        <div class="card">
            <h3>Ventas Detalladas (JOIN múltiple)</h3>
            <div id="msg-ventas-detalle"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#Venta</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Empleado</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-ventas-detalle"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 2: Productos con categoría y proveedor (JOIN múltiple) -->
        <div class="card">
            <h3>Productos por Categoría y Proveedor (JOIN múltiple)</h3>
            <div id="msg-productos-detalle"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Email Proveedor</th>
                            <th>Precio</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-productos-detalle"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 3: Empleados con usuario (JOIN múltiple) -->
        <div class="card">
            <h3>Empleados y Usuarios (JOIN múltiple)</h3>
            <div id="msg-empleados-usuarios"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Empleado</th>
                            <th>Puesto</th>
                            <th>Username</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-empleados-usuarios"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 4: Clientes con ventas (Subquery IN) -->
        <div class="card">
            <h3>Clientes con Compras Registradas (Subquery IN)</h3>
            <div id="msg-clientes-ventas"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-clientes-ventas"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 5: Productos bajo stock promedio (Subquery) -->
        <div class="card">
            <h3>Productos con Stock Bajo el Promedio (Subquery)</h3>
            <div id="msg-bajo-stock"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-bajo-stock"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 6: Ventas por empleado (GROUP BY, HAVING, agregación) -->
        <div class="card">
            <h3>Ventas por Empleado (GROUP BY + HAVING + Agregación)</h3>
            <div id="msg-ventas-empleado"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Total Ventas</th>
                            <th>Total Recaudado</th>
                            <th>Promedio por Venta</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-ventas-empleado"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 7: Top productos (CTE) -->
        <div class="card">
            <h3>Top 5 Productos Más Vendidos (CTE)</h3>
            <div id="msg-top-productos"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Total Vendido</th>
                            <th>Ingreso Total</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-top-productos"></tbody>
                </table>
            </div>
        </div>

        <!-- Reporte 8: Resumen ventas por cliente (VIEW) -->
        <div class="card">
            <h3>Resumen de Ventas por Cliente (VIEW)</h3>
            <div id="msg-resumen-ventas"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Total Compras</th>
                            <th>Total Gastado</th>
                            <th>Última Compra</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-resumen-ventas"></tbody>
                </table>
            </div>
        </div>
    `;

    await Promise.all([
        fetchVentasDetalle(),
        fetchProductosDetalle(),
        fetchEmpleadosUsuarios(),
        fetchClientesConVentas(),
        fetchProductosBajoStock(),
        fetchVentasPorEmpleado(),
        fetchTopProductos(),
        fetchResumenVentas()
    ]);
}

async function fetchVentasDetalle() {
    try {
        const res = await apiFetch('/reportes/ventas-detalle');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-ventas-detalle', data.error); return; }
        document.getElementById('tabla-ventas-detalle').innerHTML = data.map(r => `
            <tr>
                <td>${r.id_venta}</td>
                <td>${new Date(r.fecha).toLocaleDateString('es-GT')}</td>
                <td>${r.cliente}</td>
                <td>${r.empleado}</td>
                <td>${r.producto}</td>
                <td>${r.cantidad}</td>
                <td>Q${parseFloat(r.precio_unitario).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-ventas-detalle', 'No se pudo conectar con el servidor');
    }
}

async function fetchProductosDetalle() {
    try {
        const res = await apiFetch('/reportes/productos-detalle');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-productos-detalle', data.error); return; }
        document.getElementById('tabla-productos-detalle').innerHTML = data.map(r => `
            <tr>
                <td>${r.producto}</td>
                <td>${r.categoria}</td>
                <td>${r.proveedor}</td>
                <td>${r.email_proveedor}</td>
                <td>Q${parseFloat(r.precio_unitario).toFixed(2)}</td>
                <td>
                    <span class="badge ${r.stock > 50 ? 'badge-success' : r.stock > 10 ? 'badge-warning' : 'badge-danger'}">
                        ${r.stock}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-productos-detalle', 'No se pudo conectar con el servidor');
    }
}

async function fetchEmpleadosUsuarios() {
    try {
        const res = await apiFetch('/reportes/empleados-usuarios');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-empleados-usuarios', data.error); return; }
        document.getElementById('tabla-empleados-usuarios').innerHTML = data.map(r => `
            <tr>
                <td>${r.id_empleado}</td>
                <td>${r.empleado}</td>
                <td>${r.puesto}</td>
                <td>${r.username}</td>
                <td><span class="badge ${r.rol === 'admin' ? 'badge-danger' : 'badge-success'}">${r.rol}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-empleados-usuarios', 'No se pudo conectar con el servidor');
    }
}

async function fetchClientesConVentas() {
    try {
        const res = await apiFetch('/reportes/clientes-con-ventas');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-clientes-ventas', data.error); return; }
        document.getElementById('tabla-clientes-ventas').innerHTML = data.map(r => `
            <tr>
                <td>${r.id_cliente}</td>
                <td>${r.nombre}</td>
                <td>${r.email}</td>
                <td>${r.telefono}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-clientes-ventas', 'No se pudo conectar con el servidor');
    }
}

async function fetchProductosBajoStock() {
    try {
        const res = await apiFetch('/reportes/productos-bajo-stock');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-bajo-stock', data.error); return; }
        document.getElementById('tabla-bajo-stock').innerHTML = data.map(r => `
            <tr>
                <td>${r.nombre}</td>
                <td>${r.categoria}</td>
                <td><span class="badge badge-warning">${r.stock}</span></td>
                <td>Q${parseFloat(r.precio_unitario).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-bajo-stock', 'No se pudo conectar con el servidor');
    }
}

async function fetchVentasPorEmpleado() {
    try {
        const res = await apiFetch('/reportes/ventas-por-empleado');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-ventas-empleado', data.error); return; }
        document.getElementById('tabla-ventas-empleado').innerHTML = data.map(r => `
            <tr>
                <td>${r.empleado}</td>
                <td>${r.total_ventas}</td>
                <td>Q${parseFloat(r.total_recaudado).toFixed(2)}</td>
                <td>Q${parseFloat(r.promedio_por_venta).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-ventas-empleado', 'No se pudo conectar con el servidor');
    }
}

async function fetchTopProductos() {
    try {
        const res = await apiFetch('/reportes/top-productos');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-top-productos', data.error); return; }
        document.getElementById('tabla-top-productos').innerHTML = data.map(r => `
            <tr>
                <td>${r.producto}</td>
                <td>${r.total_vendido}</td>
                <td>Q${parseFloat(r.ingreso_total).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-top-productos', 'No se pudo conectar con el servidor');
    }
}

async function fetchResumenVentas() {
    try {
        const res = await apiFetch('/reportes/resumen-ventas');
        const data = await res.json();
        if (!res.ok) { showMsg('msg-resumen-ventas', data.error); return; }
        document.getElementById('tabla-resumen-ventas').innerHTML = data.map(r => `
            <tr>
                <td>${r.cliente}</td>
                <td>${r.total_compras}</td>
                <td>Q${parseFloat(r.total_gastado).toFixed(2)}</td>
                <td>${new Date(r.ultima_compra).toLocaleDateString('es-GT')}</td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('msg-resumen-ventas', 'No se pudo conectar con el servidor');
    }
}