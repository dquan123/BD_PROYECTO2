async function loadProductos() {
    const section = document.getElementById('section-productos');
    section.innerHTML = `
        <h2>Productos</h2>
        <div class="card">
            <div class="toolbar">
                <span id="productos-count"></span>
                <button class="btn-success" onclick="abrirModalProducto()">+ Nuevo Producto</button>
            </div>
            <div id="productos-msg"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-productos"></tbody>
                </table>
            </div>
        </div>
        <div id="modal-producto" class="modal-overlay hidden">
            <div class="modal">
                <h3 id="modal-producto-titulo">Nuevo Producto</h3>
                <div id="modal-producto-msg"></div>
                <input type="hidden" id="producto-id">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="producto-nombre" placeholder="Nombre del producto">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="producto-descripcion" rows="2" placeholder="Descripción"></textarea>
                </div>
                <div class="form-group">
                    <label>Precio Unitario (Q)</label>
                    <input type="number" id="producto-precio" placeholder="0.00" step="0.01">
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" id="producto-stock" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select id="producto-categoria"></select>
                </div>
                <div class="form-group">
                    <label>Proveedor</label>
                    <select id="producto-proveedor"></select>
                </div>
                <div class="modal-actions">
                    <button class="btn-danger" onclick="cerrarModalProducto()">Cancelar</button>
                    <button class="btn-success" onclick="guardarProducto()">Guardar</button>
                </div>
            </div>
        </div>
    `;

    await fetchProductos();
}

async function fetchProductos() {
    try {
        const res = await apiFetch('/productos');
        const productos = await res.json();

        if (!res.ok) {
            showMsg('productos-msg', productos.error || 'Error al cargar productos');
            return;
        }

        document.getElementById('productos-count').textContent = `${productos.length} productos registrados`;

        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = productos.map(p => `
            <tr>
                <td>${p.id_producto}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.proveedor}</td>
                <td>Q${parseFloat(p.precio_unitario).toFixed(2)}</td>
                <td>
                    <span class="badge ${p.stock > 50 ? 'badge-success' : p.stock > 10 ? 'badge-warning' : 'badge-danger'}">
                        ${p.stock}
                    </span>
                </td>
                <td>
                    <button class="btn-warning" onclick="editarProducto(${p.id_producto})">Editar</button>
                    <button class="btn-danger" onclick="eliminarProducto(${p.id_producto}, '${p.nombre}')">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showMsg('productos-msg', 'No se pudo conectar con el servidor');
    }
}

async function abrirModalProducto() {
    document.getElementById('modal-producto-titulo').textContent = 'Nuevo Producto';
    document.getElementById('producto-id').value = '';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-descripcion').value = '';
    document.getElementById('producto-precio').value = '';
    document.getElementById('producto-stock').value = '';

    await cargarSelectsCategoriaProveedor();
    document.getElementById('modal-producto').classList.remove('hidden');
}

async function cargarSelectsCategoriaProveedor() {
    try {
        const [resCat, resProv] = await Promise.all([
            apiFetch('/categorias'),
            apiFetch('/proveedores')
        ]);
        const categorias = await resCat.json();
        const proveedores = await resProv.json();

        document.getElementById('producto-categoria').innerHTML =
            categorias.map(c => `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');

        document.getElementById('producto-proveedor').innerHTML =
            proveedores.map(p => `<option value="${p.id_proveedor}">${p.nombre}</option>`).join('');
    } catch (err) {
        showMsg('modal-producto-msg', 'Error al cargar categorías y proveedores');
    }
}

async function editarProducto(id) {
    try {
        const res = await apiFetch(`/productos/${id}`);
        const p = await res.json();

        if (!res.ok) {
            showMsg('productos-msg', p.error || 'Error al cargar producto');
            return;
        }

        await cargarSelectsCategoriaProveedor();

        document.getElementById('modal-producto-titulo').textContent = 'Editar Producto';
        document.getElementById('producto-id').value = p.id_producto;
        document.getElementById('producto-nombre').value = p.nombre;
        document.getElementById('producto-descripcion').value = p.descripcion || '';
        document.getElementById('producto-precio').value = p.precio_unitario;
        document.getElementById('producto-stock').value = p.stock;

        document.getElementById('modal-producto').classList.remove('hidden');
    } catch (err) {
        showMsg('productos-msg', 'No se pudo conectar con el servidor');
    }
}

async function guardarProducto() {
    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('producto-nombre').value.trim();
    const descripcion = document.getElementById('producto-descripcion').value.trim();
    const precio_unitario = document.getElementById('producto-precio').value;
    const stock = document.getElementById('producto-stock').value;
    const id_categoria = document.getElementById('producto-categoria').value;
    const id_proveedor = document.getElementById('producto-proveedor').value;

    if (!nombre || !precio_unitario || !stock || !id_categoria || !id_proveedor) {
        showMsg('modal-producto-msg', 'Todos los campos son obligatorios');
        return;
    }

    if (precio_unitario <= 0 || stock < 0) {
        showMsg('modal-producto-msg', 'El precio debe ser mayor a 0 y el stock no puede ser negativo');
        return;
    }

    const body = { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor };
    const url = id ? `/productos/${id}` : '/productos';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await apiFetch(url, { method, body: JSON.stringify(body) });
        const data = await res.json();

        if (!res.ok) {
            showMsg('modal-producto-msg', data.error || 'Error al guardar');
            return;
        }

        cerrarModalProducto();
        showMsg('productos-msg', id ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
        await fetchProductos();
    } catch (err) {
        showMsg('modal-producto-msg', 'No se pudo conectar con el servidor');
    }
}

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Estás seguro que deseas eliminar "${nombre}"?`)) return;

    try {
        const res = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            showMsg('productos-msg', data.error || 'Error al eliminar');
            return;
        }

        showMsg('productos-msg', 'Producto eliminado correctamente', 'success');
        await fetchProductos();
    } catch (err) {
        showMsg('productos-msg', 'No se pudo conectar con el servidor');
    }
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.add('hidden');
}