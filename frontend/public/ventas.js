async function loadVentas() {
    const section = document.getElementById('section-ventas');
    section.innerHTML = `
        <h2>Ventas</h2>
        <div class="card">
            <div class="toolbar">
                <span id="ventas-count"></span>
                <button class="btn-success" onclick="abrirModalVenta()">+ Nueva Venta</button>
            </div>
            <div id="ventas-msg"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Empleado</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-ventas"></tbody>
                </table>
            </div>
        </div>

        <!-- Modal nueva venta -->
        <div id="modal-venta" class="modal-overlay hidden">
            <div class="modal" style="max-width: 650px;">
                <h3>Nueva Venta</h3>
                <div id="modal-venta-msg"></div>
                <div class="form-group">
                    <label>Cliente</label>
                    <select id="venta-cliente"></select>
                </div>
                <div class="form-group">
                    <label>Empleado</label>
                    <select id="venta-empleado"></select>
                </div>
                <hr style="margin: 1rem 0;">
                <h4 style="margin-bottom: 0.75rem;">Productos</h4>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <select id="venta-producto-select" style="flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px;"></select>
                    <input type="number" id="venta-cantidad" min="1" value="1" style="width: 80px; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <button class="btn-primary" style="width: auto;" onclick="agregarProductoVenta()">Agregar</button>
                </div>
                <div class="table-container" style="margin-bottom: 1rem;">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="tabla-detalle-venta"></tbody>
                    </table>
                </div>
                <div style="text-align: right; font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">
                    Total: Q<span id="venta-total">0.00</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-danger" onclick="cerrarModalVenta()">Cancelar</button>
                    <button class="btn-success" onclick="guardarVenta()">Registrar Venta</button>
                </div>
            </div>
        </div>

        <!-- Modal detalle venta -->
        <div id="modal-detalle" class="modal-overlay hidden">
            <div class="modal" style="max-width: 650px;">
                <h3>Detalle de Venta</h3>
                <div id="detalle-info"></div>
                <div class="table-container" style="margin-top: 1rem;">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-detalle-info"></tbody>
                    </table>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="cerrarModalDetalle()">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    await fetchVentas();
}

async function fetchVentas() {
    try {
        const res = await apiFetch('/ventas');
        const ventas = await res.json();

        if (!res.ok) {
            showMsg('ventas-msg', ventas.error || 'Error al cargar ventas');
            return;
        }

        document.getElementById('ventas-count').textContent = `${ventas.length} ventas registradas`;

        const tbody = document.getElementById('tabla-ventas');
        tbody.innerHTML = ventas.map(v => `
            <tr>
                <td>${v.id_venta}</td>
                <td>${new Date(v.fecha).toLocaleDateString('es-GT')}</td>
                <td>${v.cliente}</td>
                <td>${v.empleado}</td>
                <td>Q${parseFloat(v.total).toFixed(2)}</td>
                <td>
                    <button class="btn-primary" onclick="verDetalleVenta(${v.id_venta})">Ver Detalle</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('ventas-msg', 'No se pudo conectar con el servidor');
    }
}

let detalleVenta = [];

async function abrirModalVenta() {
    detalleVenta = [];
    actualizarTablaDetalle();

    try {
        const [resClientes, resEmpleados, resProductos] = await Promise.all([
            apiFetch('/clientes'),
            apiFetch('/empleados'),
            apiFetch('/productos')
        ]);

        const clientes = await resClientes.json();
        const empleados = await resEmpleados.json();
        const productos = await resProductos.json();

        document.getElementById('venta-cliente').innerHTML =
            clientes.map(c => `<option value="${c.id_cliente}">${c.nombre}</option>`).join('');

        document.getElementById('venta-empleado').innerHTML =
            empleados.map(e => `<option value="${e.id_empleado}">${e.nombre}</option>`).join('');

        document.getElementById('venta-producto-select').innerHTML =
            productos.map(p => `<option value="${p.id_producto}" data-precio="${p.precio_unitario}" data-stock="${p.stock}">${p.nombre} (Stock: ${p.stock})</option>`).join('');

    } catch (err) {
        showMsg('modal-venta-msg', 'Error al cargar datos');
        return;
    }

    document.getElementById('modal-venta').classList.remove('hidden');
}

function agregarProductoVenta() {
    const select = document.getElementById('venta-producto-select');
    const cantidad = parseInt(document.getElementById('venta-cantidad').value);
    const id_producto = parseInt(select.value);
    const nombre = select.options[select.selectedIndex].text.split(' (Stock')[0];
    const precio = parseFloat(select.options[select.selectedIndex].dataset.precio);
    const stock = parseInt(select.options[select.selectedIndex].dataset.stock);

    if (!cantidad || cantidad <= 0) {
        showMsg('modal-venta-msg', 'La cantidad debe ser mayor a 0');
        return;
    }

    if (cantidad > stock) {
        showMsg('modal-venta-msg', `Stock insuficiente. Disponible: ${stock}`);
        return;
    }

    const existe = detalleVenta.find(d => d.id_producto === id_producto);
    if (existe) {
        if (existe.cantidad + cantidad > stock) {
            showMsg('modal-venta-msg', `Stock insuficiente. Disponible: ${stock}`);
            return;
        }
        existe.cantidad += cantidad;
    } else {
        detalleVenta.push({ id_producto, nombre, cantidad, precio_unitario: precio });
    }

    actualizarTablaDetalle();
    document.getElementById('venta-cantidad').value = 1;
}

function actualizarTablaDetalle() {
    const tbody = document.getElementById('tabla-detalle-venta');
    if (!tbody) return;

    tbody.innerHTML = detalleVenta.map((d, i) => `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.cantidad}</td>
            <td>Q${d.precio_unitario.toFixed(2)}</td>
            <td>Q${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
            <td><button class="btn-danger" onclick="quitarProductoVenta(${i})">X</button></td>
        </tr>
    `).join('');

    const total = detalleVenta.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);
    const totalEl = document.getElementById('venta-total');
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

function quitarProductoVenta(index) {
    detalleVenta.splice(index, 1);
    actualizarTablaDetalle();
}

async function guardarVenta() {
    const id_cliente = document.getElementById('venta-cliente').value;
    const id_empleado = document.getElementById('venta-empleado').value;

    if (!id_cliente || !id_empleado) {
        showMsg('modal-venta-msg', 'Selecciona cliente y empleado');
        return;
    }

    if (detalleVenta.length === 0) {
        showMsg('modal-venta-msg', 'Agrega al menos un producto');
        return;
    }

    try {
        const res = await apiFetch('/ventas', {
            method: 'POST',
            body: JSON.stringify({ id_cliente, id_empleado, detalle: detalleVenta })
        });

        const data = await res.json();

        if (!res.ok) {
            showMsg('modal-venta-msg', data.error || 'Error al registrar venta');
            return;
        }

        cerrarModalVenta();
        showMsg('ventas-msg', 'Venta registrada correctamente', 'success');
        await fetchVentas();
    } catch (err) {
        showMsg('modal-venta-msg', 'No se pudo conectar con el servidor');
    }
}

async function verDetalleVenta(id) {
    try {
        const res = await apiFetch(`/ventas/${id}`);
        const venta = await res.json();

        if (!res.ok) {
            showMsg('ventas-msg', venta.error || 'Error al cargar detalle');
            return;
        }

        document.getElementById('detalle-info').innerHTML = `
            <p><strong>Cliente:</strong> ${venta.cliente}</p>
            <p><strong>Empleado:</strong> ${venta.empleado}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleDateString('es-GT')}</p>
            <p><strong>Total:</strong> Q${parseFloat(venta.total).toFixed(2)}</p>
        `;

        document.getElementById('tabla-detalle-info').innerHTML = venta.detalle.map(d => `
            <tr>
                <td>${d.producto}</td>
                <td>${d.cantidad}</td>
                <td>Q${parseFloat(d.precio_unitario).toFixed(2)}</td>
                <td>Q${(d.cantidad * parseFloat(d.precio_unitario)).toFixed(2)}</td>
            </tr>
        `).join('');

        document.getElementById('modal-detalle').classList.remove('hidden');
    } catch (err) {
        showMsg('ventas-msg', 'No se pudo conectar con el servidor');
    }
}

function cerrarModalVenta() {
    document.getElementById('modal-venta').classList.add('hidden');
    detalleVenta = [];
}

function cerrarModalDetalle() {
    document.getElementById('modal-detalle').classList.add('hidden');
}