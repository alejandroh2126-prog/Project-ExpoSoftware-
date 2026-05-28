const API = 'http://localhost:3000/api';

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function mostrarExito(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
}

// LOGIN
const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (!email || !password) return mostrarError('error-msg', 'Completa todos los campos');
        btnLogin.textContent = 'Ingresando...';
        btnLogin.disabled = true;
        try {
            const res  = await fetch(`${API}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('token',   data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'dashboard.html';
        } catch (e) {
            mostrarError('error-msg', e.message);
            btnLogin.textContent = 'Iniciar sesión';
            btnLogin.disabled = false;
        }
    });

    document.getElementById('password').addEventListener('keydown', e => {
        if (e.key === 'Enter') btnLogin.click();
    });
}

// REGISTRO
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
        btnRegistro.textContent = 'Creando cuenta...';
        btnRegistro.disabled = true;
        try {
            const res  = await fetch(`${API}/auth/registro`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('token',   data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            mostrarExito('success-msg', '¡Cuenta creada! Redirigiendo...');
            setTimeout(() => window.location.href = 'dashboard.html', 1200);
        } catch (e) {
            mostrarError('error-msg', e.message);
            btnRegistro.textContent = 'Crear cuenta';
            btnRegistro.disabled = false;
        }
    });
}

// Redirigir si ya está logueado
if (localStorage.getItem('token') &&
    (window.location.pathname.includes('login') || window.location.pathname.includes('registro'))) {
    window.location.href = 'dashboard.html';
}