const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Emprendedor';

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarEmprendimientos() {
    try {
        const res  = await fetch(`${API}/emprendimientos`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        renderEmprendimientos(data);
        document.getElementById('statTotal').textContent   = data.length;
        document.getElementById('statActivos').textContent = data.filter(e => e.estado === 'activo').length;
        document.getElementById('statFecha').textContent   = usuario.fecha_registro
            ? new Date(usuario.fecha_registro).toLocaleDateString('es-CO')
            : new Date().toLocaleDateString('es-CO');
    } catch (e) {
        console.error(e);
    }
}

function renderEmprendimientos(lista) {
    const grid = document.getElementById('empGrid');
    if (!lista.length) {
        grid.innerHTML = `<div class="empty-state"><p>🌱 Aún no tienes emprendimientos.<br/>¡Crea el primero!</p></div>`;
        return;
    }
    const sectores = { comercio:'🛒', servicios:'🔧', tecnologia:'💻', alimentos:'🍽️', moda:'👗', salud:'❤️', educacion:'📚', otro:'📦', '':' 🚀' };
    grid.innerHTML = lista.map(emp => `
    <div class="emp-card">
      <div class="emp-card-header">
        <span class="emp-sector-icon">${sectores[emp.sector] || '🚀'}</span>
        <span class="emp-estado ${emp.estado}">${emp.estado}</span>
      </div>
      <h3>${emp.nombre}</h3>
      <p class="emp-desc">${emp.descripcion || 'Sin descripción'}</p>
      <p class="emp-sector">${emp.sector || 'Sin sector'} · ${emp.fecha_inicio ? new Date(emp.fecha_inicio).toLocaleDateString('es-CO') : 'Sin fecha'}</p>
      <div class="emp-actions">
        <button class="btn btn-outline btn-sm" onclick="editarEmp(${emp.id})">✏️ Editar</button>
        <a href="finanzas.html?emp=${emp.id}" class="btn btn-primary btn-sm">💰 Finanzas</a>
        <button class="btn btn-danger btn-sm" onclick="eliminarEmp(${emp.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

// Abrir modal nuevo
document.getElementById('btnNuevoEmp').addEventListener('click', () => {
    document.getElementById('modalEmpTitulo').textContent = 'Nuevo emprendimiento';
    document.getElementById('empNombre').value = '';
    document.getElementById('empDesc').value   = '';
    document.getElementById('empSector').value = '';
    document.getElementById('empFecha').value  = '';
    document.getElementById('empId').value     = '';
    document.getElementById('modalEmp').classList.add('active');
});

['cerrarModalEmp', 'cancelarEmp'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        document.getElementById('modalEmp').classList.remove('active');
    });
});

// Guardar emprendimiento
document.getElementById('guardarEmp').addEventListener('click', async () => {
    const id     = document.getElementById('empId').value;
    const nombre = document.getElementById('empNombre').value.trim();
    if (!nombre) {
        document.getElementById('errorEmp').textContent = 'El nombre es obligatorio';
        document.getElementById('errorEmp').style.display = 'block';
        return;
    }
    const body = {
        nombre,
        descripcion:  document.getElementById('empDesc').value,
        sector:       document.getElementById('empSector').value,
        fecha_inicio: document.getElementById('empFecha').value,
    };
    const url    = id ? `${API}/emprendimientos/${id}` : `${API}/emprendimientos`;
    const method = id ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Error al guardar');
        document.getElementById('modalEmp').classList.remove('active');
        cargarEmprendimientos();
    } catch (e) {
        document.getElementById('errorEmp').textContent = e.message;
        document.getElementById('errorEmp').style.display = 'block';
    }
});

// Editar
async function editarEmp(id) {
    const res  = await fetch(`${API}/emprendimientos`, { headers });
    const data = await res.json();
    const emp  = data.find(e => e.id === id);
    if (!emp) return;
    document.getElementById('modalEmpTitulo').textContent = 'Editar emprendimiento';
    document.getElementById('empNombre').value = emp.nombre;
    document.getElementById('empDesc').value   = emp.descripcion;
    document.getElementById('empSector').value = emp.sector;
    document.getElementById('empFecha').value  = emp.fecha_inicio;
    document.getElementById('empId').value     = emp.id;
    document.getElementById('modalEmp').classList.add('active');
}

// Eliminar
async function eliminarEmp(id) {
    if (!confirm('¿Eliminar este emprendimiento y todos sus datos financieros?')) return;
    await fetch(`${API}/emprendimientos/${id}`, { method: 'DELETE', headers });
    cargarEmprendimientos();
}

cargarEmprendimientos();