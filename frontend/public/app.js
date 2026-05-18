const API = 'http://localhost:3000/api';

// Permisos por rol
const PERMISOS = {
    admin: ['productos', 'clientes', 'ventas', 'reportes'],
    gerente: ['productos', 'clientes', 'ventas', 'reportes'],
    vendedor: ['productos', 'ventas'],
    cajero: ['ventas'],
    bodeguero: ['productos']
};

// ========== AUTH ==========
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showLoginError('Por favor ingresa usuario y contraseña');
        return;
    }

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showLoginError(data.error || 'Error al iniciar sesión');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('rol', data.rol);

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('nav-username').textContent = `${data.username} (${data.rol})`;

        construirMenu(data.rol);
        const seccionInicial = PERMISOS[data.rol][0];
        showSection(seccionInicial);

    } catch (err) {
        showLoginError('No se pudo conectar con el servidor');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showLoginError(msg) {
    const div = document.getElementById('login-error');
    div.textContent = msg;
    div.classList.remove('hidden');
}

// ========== MENÚ DINÁMICO POR ROL ==========
function construirMenu(rol) {
    const secciones = PERMISOS[rol] || [];
    const nombres = {
        productos: 'Productos',
        clientes: 'Clientes',
        ventas: 'Ventas',
        reportes: 'Reportes'
    };

    const navLinks = document.querySelector('.nav-links');
    navLinks.innerHTML = secciones.map(s => `
        <a onclick="showSection('${s}')">${nombres[s]}</a>
    `).join('');
}

// ========== NAVEGACIÓN ==========
function showSection(name) {
    const rol = localStorage.getItem('rol');
    const permitidas = PERMISOS[rol] || [];

    if (!permitidas.includes(name)) {
        alert('No tienes permiso para acceder a esta sección');
        return;
    }

    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(`section-${name}`);
    section.classList.remove('hidden');

    if (name === 'productos') loadProductos();
    if (name === 'clientes') loadClientes();
    if (name === 'ventas') loadVentas();
    if (name === 'reportes') loadReportes();
}

// ========== HELPERS ==========
function getToken() {
    return localStorage.getItem('token');
}

function getRol() {
    return localStorage.getItem('rol');
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    };
    const res = await fetch(`${API}${url}`, { ...options, headers });
    return res;
}

function showMsg(containerId, msg, type = 'error') {
    const div = document.getElementById(containerId);
    if (!div) return;
    div.textContent = msg;
    div.className = type === 'error' ? 'error-msg' : 'success-msg';
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 4000);
}

// Verificar sesión activa al cargar
window.onload = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const rol = localStorage.getItem('rol');
    if (token && username && rol) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('nav-username').textContent = `${username} (${rol})`;
        construirMenu(rol);
        const seccionInicial = PERMISOS[rol][0];
        showSection(seccionInicial);
    }
};

// Enter en login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('login-screen').classList.contains('hidden')) {
        login();
    }
});