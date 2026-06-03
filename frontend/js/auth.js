// ════════════════════════════════════════════
// SGAPE – Autenticación
// ════════════════════════════════════════════

const USUARIOS_KEY = 'sgape_usuarios';
const SESSION_KEY  = 'sgape_session';

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

function saveSession(usuario, token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
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

        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Correo o contraseña incorrectos');

            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            saveSession(data.usuario, data.token);
            window.location.href = 'dashboard.html';
        } catch (e) {
            if (e.message === 'Failed to fetch') {
                mostrarError('error-msg', 'No se puede conectar al servidor. Asegúrate de que el backend esté corriendo con: node server.js');
            } else {
                mostrarError('error-msg', e.message);
            }
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar sesión';
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

        btnRegistro.disabled = true;
        btnRegistro.textContent = 'Creando cuenta...';

        try {
            const res = await fetch('http://localhost:3000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'No fue posible registrar');

            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            saveSession(data.usuario, data.token);

            mostrarExito('success-msg', '✅ Cuenta creada correctamente. Redirigiendo...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
        } catch (e) {
            if (e.message === 'Failed to fetch') {
                mostrarError('error-msg', 'No se puede conectar al servidor. Asegúrate de que el backend esté corriendo con: node server.js');
            } else {
                mostrarError('error-msg', e.message);
            }
            btnRegistro.disabled = false;
            btnRegistro.textContent = 'Crear cuenta';
        }
    });
}

// ── REDIRIGIR SI YA HAY SESIÓN ───────────────
if (getSession() &&
    (window.location.pathname.includes('login') ||
        window.location.pathname.includes('registro'))) {
    window.location.href = 'dashboard.html';
}