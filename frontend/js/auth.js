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

function saveSession(usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    // Compatibilidad con el resto del sistema
    localStorage.setItem('token', 'local_token_' + usuario.id);
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
    btnLogin.addEventListener('click', () => {
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password)
            return mostrarError('error-msg', 'Completa todos los campos');

        const usuarios = getUsuarios();
        const usuario  = usuarios.find(u => u.email === email);

        if (!usuario)
            return mostrarError('error-msg', 'Correo o contraseña incorrectos');

        // Verificar contraseña (hash simple con btoa)
        const hashIngresado = btoa(password + usuario.salt);
        if (hashIngresado !== usuario.password)
            return mostrarError('error-msg', 'Correo o contraseña incorrectos');

        saveSession({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
        window.location.href = 'dashboard.html';
    });

    document.getElementById('password').addEventListener('keydown', e => {
        if (e.key === 'Enter') btnLogin.click();
    });
}

// ── REGISTRO ─────────────────────────────────
const btnRegistro = document.getElementById('btnRegistro');
if (btnRegistro) {
    btnRegistro.addEventListener('click', () => {
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

        const usuarios = getUsuarios();
        if (usuarios.find(u => u.email === email))
            return mostrarError('error-msg', 'Este correo ya está registrado');

        // Hash simple (salt + btoa para no depender de bcrypt)
        const salt     = Math.random().toString(36).substring(2);
        const hashPass = btoa(password + salt);
        const nuevoId  = Date.now();

        const nuevoUsuario = {
            id: nuevoId, nombre, email,
            password: hashPass, salt,
            fecha_registro: new Date().toLocaleDateString('es-CO')
        };

        usuarios.push(nuevoUsuario);
        saveUsuarios(usuarios);
        saveSession({ id: nuevoId, nombre, email });

        mostrarExito('success-msg', '¡Cuenta creada exitosamente! Redirigiendo...');
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
}

// ── REDIRIGIR SI YA HAY SESIÓN ───────────────
if (getSession() &&
    (window.location.pathname.includes('login') ||
     window.location.pathname.includes('registro'))) {
    window.location.href = 'dashboard.html';
}