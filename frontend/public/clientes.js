async function loadClientes() {
    const rol = getRol();
    const puedeEditar = ['admin', 'gerente'].includes(rol);
    const puedeEliminar = ['admin'].includes(rol);

    const section = document.getElementById('section-clientes');
    section.innerHTML = `
        <h2>Clientes</h2>
        <div class="card">
            <div class="toolbar">
                <span id="clientes-count"></span>
                ${puedeEditar ? '<button class="btn-success" onclick="abrirModalCliente()">+ Nuevo Cliente</button>' : ''}
            </div>
            <div id="clientes-msg"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            ${puedeEditar ? '<th>Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="tabla-clientes"></tbody>
                </table>
            </div>
        </div>
        ${puedeEditar ? `
        <div id="modal-cliente" class="modal-overlay hidden">
            <div class="modal">
                <h3 id="modal-cliente-titulo">Nuevo Cliente</h3>
                <div id="modal-cliente-msg"></div>
                <input type="hidden" id="cliente-id">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="cliente-nombre" placeholder="Nombre completo">
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" id="cliente-telefono" placeholder="Número de teléfono">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="cliente-email" placeholder="correo@ejemplo.com">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" id="cliente-direccion" placeholder="Dirección completa">
                </div>
                <div class="modal-actions">
                    <button class="btn-danger" onclick="cerrarModalCliente()">Cancelar</button>
                    <button class="btn-success" onclick="guardarCliente()">Guardar</button>
                </div>
            </div>
        </div>` : ''}
    `;

    await fetchClientes(puedeEditar, puedeEliminar);
}

async function fetchClientes(puedeEditar, puedeEliminar) {
    try {
        const res = await apiFetch('/clientes');
        const clientes = await res.json();

        if (!res.ok) {
            showMsg('clientes-msg', clientes.error || 'Error al cargar clientes');
            return;
        }

        document.getElementById('clientes-count').textContent = `${clientes.length} clientes registrados`;

        const tbody = document.getElementById('tabla-clientes');
        tbody.innerHTML = clientes.map(c => `
            <tr>
                <td>${c.id_cliente}</td>
                <td>${c.nombre}</td>
                <td>${c.telefono}</td>
                <td>${c.email}</td>
                <td>${c.direccion}</td>
                ${puedeEditar ? `
                <td>
                    <button class="btn-warning" onclick="editarCliente(${c.id_cliente})">Editar</button>
                    ${puedeEliminar ? `<button class="btn-danger" onclick="eliminarCliente(${c.id_cliente}, '${c.nombre}')">Eliminar</button>` : ''}
                </td>` : ''}
            </tr>
        `).join('');
    } catch (err) {
        showMsg('clientes-msg', 'No se pudo conectar con el servidor');
    }
}

async function abrirModalCliente() {
    document.getElementById('modal-cliente-titulo').textContent = 'Nuevo Cliente';
    document.getElementById('cliente-id').value = '';
    document.getElementById('cliente-nombre').value = '';
    document.getElementById('cliente-telefono').value = '';
    document.getElementById('cliente-email').value = '';
    document.getElementById('cliente-direccion').value = '';
    document.getElementById('modal-cliente').classList.remove('hidden');
}

async function editarCliente(id) {
    try {
        const res = await apiFetch(`/clientes/${id}`);
        const c = await res.json();

        if (!res.ok) {
            showMsg('clientes-msg', c.error || 'Error al cargar cliente');
            return;
        }

        document.getElementById('modal-cliente-titulo').textContent = 'Editar Cliente';
        document.getElementById('cliente-id').value = c.id_cliente;
        document.getElementById('cliente-nombre').value = c.nombre;
        document.getElementById('cliente-telefono').value = c.telefono;
        document.getElementById('cliente-email').value = c.email;
        document.getElementById('cliente-direccion').value = c.direccion;
        document.getElementById('modal-cliente').classList.remove('hidden');
    } catch (err) {
        showMsg('clientes-msg', 'No se pudo conectar con el servidor');
    }
}

async function guardarCliente() {
    const id = document.getElementById('cliente-id').value;
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const telefono = document.getElementById('cliente-telefono').value.trim();
    const email = document.getElementById('cliente-email').value.trim();
    const direccion = document.getElementById('cliente-direccion').value.trim();

    if (!nombre || !telefono || !email || !direccion) {
        showMsg('modal-cliente-msg', 'Todos los campos son obligatorios');
        return;
    }

    if (!email.includes('@')) {
        showMsg('modal-cliente-msg', 'El email no es válido');
        return;
    }

    const body = { nombre, telefono, email, direccion };
    const url = id ? `/clientes/${id}` : '/clientes';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await apiFetch(url, { method, body: JSON.stringify(body) });
        const data = await res.json();

        if (!res.ok) {
            showMsg('modal-cliente-msg', data.error || 'Error al guardar');
            return;
        }

        cerrarModalCliente();
        showMsg('clientes-msg', id ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente', 'success');
        await fetchClientes(['admin', 'gerente'].includes(getRol()), getRol() === 'admin');
    } catch (err) {
        showMsg('modal-cliente-msg', 'No se pudo conectar con el servidor');
    }
}

async function eliminarCliente(id, nombre) {
    if (!confirm(`¿Estás seguro que deseas eliminar a "${nombre}"?`)) return;

    try {
        const res = await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            showMsg('clientes-msg', data.error || 'Error al eliminar');
            return;
        }

        showMsg('clientes-msg', 'Cliente eliminado correctamente', 'success');
        await fetchClientes(['admin', 'gerente'].includes(getRol()), getRol() === 'admin');
    } catch (err) {
        showMsg('clientes-msg', 'No se pudo conectar con el servidor');
    }
}

function cerrarModalCliente() {
    document.getElementById('modal-cliente').classList.add('hidden');
}