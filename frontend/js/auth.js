// ════════════════════════════════════════════
// SGAPE – Autenticación sin servidor
// Usa localStorage para persistir usuarios
// ════════════════════════════════════════════

const USUARIOS_KEY = 'sgape_usuarios';
const SESSION_KEY  = 'sgape_session';

function getUsuarios() {
    try { return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || []; }
    catch { return []; }
}

function saveUsuarios(lista) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(lista));
}

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

function saveSession(usuario, token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    if (token) {
        localStorage.setItem('token', token);
    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
}


function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function mostrarExito(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
}

// ── LOGIN ────────────────────────────────────
const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password)
            return mostrarError('error-msg', 'Completa todos los campos');

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Correo o contraseña incorrectos');
            }
            // Guardar datos sesión de respuesta backend (token y usuario)
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            saveSession(data.usuario, data.token);
            window.location.href = 'dashboard.html';
        } catch (e) {
            mostrarError('error-msg', e.message);
        }
    });

    document.getElementById('password').addEventListener('keydown', e => {
        if (e.key === 'Enter') btnLogin.click();
    });
}

// ── REGISTRO ─────────────────────────────────
const btnRegistro = document.getElementById('btnRegistro');
if (btnRegistro) {
    btnRegistro.addEventListener('click', async () => {
        const nombre    = document.getElementById('nombre').value.trim();
        const email     = document.getElementById('email').value.trim();
        const password  = document.getElementById('password').value;
        const password2 = document.getElementById('password2').value;

        if (!nombre || !email || !password || !password2)
            return mostrarError('error-msg', 'Completa todos los campos');
        if (password !== password2)
            return mostrarError('error-msg', 'Las contraseñas no coinciden');
        if (password.length < 6)
            return mostrarError('error-msg', 'La contraseña debe tener al menos 6 caracteres');
        if (!email.includes('@'))
            return mostrarError('error-msg', 'Ingresa un correo válido');

        try {
            const res = await fetch('http://localhost:3000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'No fue posible registrar');
            }
            // Guardar datos de sesión/backend
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            saveSession(data.usuario, data.token);
            window.location.href = 'dashboard.html';
        } catch (e) {
            mostrarError('error-msg', e.message);
        }
    });
}


// ── REDIRIGIR SI YA HAY SESIÓN ───────────────
if (getSession() &&
    (window.location.pathname.includes('login') ||
     window.location.pathname.includes('registro'))) {
    window.location.href = 'dashboard.html';
}