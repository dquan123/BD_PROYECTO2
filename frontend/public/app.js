const API = 'http://localhost:3000/api';

// ========== AUTH ==========
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('login-error');

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
        document.getElementById('nav-username').textContent = data.username;

        showSection('productos');

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

// ========== NAVEGACIÓN ==========
function showSection(name) {
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

// Verificar si hay sesión activa al cargar
window.onload = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('nav-username').textContent = username;
        showSection('productos');
    }
};

// Enter en login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('login-screen').classList.contains('hidden')) {
        login();
    }
});