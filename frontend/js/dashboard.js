const API   = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Emprendedor';

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

let empActivo = null;

// ── EMPRENDIMIENTOS ──────────────────────────────────────

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
    } catch (e) { console.error(e); }
}

const sectores = { comercio:'🛒', servicios:'🔧', tecnologia:'💻', alimentos:'🍽️', moda:'👗', salud:'❤️', educacion:'📚', otro:'📦', '':'🚀' };

function renderEmprendimientos(lista) {
    const grid = document.getElementById('empGrid');
    if (!lista.length) {
        grid.innerHTML = `<div class="empty-state"><p>🌱 Aún no tienes emprendimientos.<br/>¡Crea el primero!</p></div>`;
        return;
    }
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
        <button class="btn btn-primary btn-sm" onclick="abrirTrabajadores(${emp.id}, '${emp.nombre.replace(/'/g,"\\'")}')">👥 Trabajadores</button>
        <a href="finanzas.html?emp=${emp.id}" class="btn btn-outline btn-sm">💰 Finanzas</a>
        <button class="btn btn-danger btn-sm" onclick="eliminarEmp(${emp.id})">🗑️</button>
      </div>
    </div>`).join('');
}

document.getElementById('btnNuevoEmp').addEventListener('click', () => {
    document.getElementById('modalEmpTitulo').textContent = 'Nuevo emprendimiento';
    document.getElementById('empNombre').value = '';
    document.getElementById('empDesc').value   = '';
    document.getElementById('empSector').value = '';
    document.getElementById('empFecha').value  = '';
    document.getElementById('empId').value     = '';
    document.getElementById('errorEmp').style.display = 'none';
    document.getElementById('modalEmp').classList.add('active');
});

['cerrarModalEmp', 'cancelarEmp'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        document.getElementById('modalEmp').classList.remove('active');
    });
});

document.getElementById('guardarEmp').addEventListener('click', async () => {
    const id     = document.getElementById('empId').value;
    const nombre = document.getElementById('empNombre').value.trim();
    const errEl  = document.getElementById('errorEmp');
    if (!nombre) { errEl.textContent = 'El nombre es obligatorio'; errEl.style.display = 'block'; return; }
    const body = {
        nombre,
        descripcion:  document.getElementById('empDesc').value,
        sector:       document.getElementById('empSector').value,
        fecha_inicio: document.getElementById('empFecha').value,
    };
    const url    = id ? `${API}/emprendimientos/${id}` : `${API}/emprendimientos`;
    const method = id ? 'PUT' : 'POST';
    try {
        const res  = await fetch(url, { method, headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        document.getElementById('modalEmp').classList.remove('active');
        cargarEmprendimientos();
    } catch (e) { errEl.textContent = e.message; errEl.style.display = 'block'; }
});

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
    document.getElementById('errorEmp').style.display = 'none';
    document.getElementById('modalEmp').classList.add('active');
}

async function eliminarEmp(id) {
    if (!confirm('¿Eliminar este emprendimiento y todos sus datos?')) return;
    await fetch(`${API}/emprendimientos/${id}`, { method: 'DELETE', headers });
    cargarEmprendimientos();
}

// ── MODAL TRABAJADORES ───────────────────────────────────

function abrirTrabajadores(empId, empNombre) {
    empActivo = empId;
    document.getElementById('modalTrabTitulo').textContent = `👥 Trabajadores – ${empNombre}`;
    document.getElementById('modalTrab').classList.add('active');
    switchTab('lista');
    cargarCargos();
    cargarTrabajadores();
}

document.getElementById('cerrarModalTrab').addEventListener('click', () => {
    document.getElementById('modalTrab').classList.remove('active');
    empActivo = null;
});

function switchTab(name) {
    const nombres = ['lista', 'cargos', 'nuevo'];
    document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', nombres[i] === name));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    if (name === 'nuevo') {
        document.getElementById('trabNombre').value   = '';
        document.getElementById('trabApellido').value = '';
        document.getElementById('trabEdad').value     = '';
        document.getElementById('trabCedula').value   = '';
        document.getElementById('trabCargo').value    = '';
        document.getElementById('trabFecha').value    = new Date().toISOString().split('T')[0];
        document.getElementById('trabSalaryPreview').style.display = 'none';
        document.getElementById('errorTrab').style.display   = 'none';
        document.getElementById('successTrab').style.display = 'none';
    }
}

const fmt = n => '$' + Number(n || 0).toLocaleString('es-CO');

// ── CARGOS ───────────────────────────────────────────────

let cargosCache = [];

async function cargarCargos() {
    if (!empActivo) return;
    try {
        const res  = await fetch(`${API}/nomina/cargos/${empActivo}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        cargosCache = data;
        renderCargos(data);
        renderSelectCargos(data);
    } catch (e) { console.error('Error cargos:', e.message); }
}

function renderSelectCargos(cargos) {
    const sel = document.getElementById('trabCargo');
    sel.innerHTML = '<option value="">— Selecciona un cargo —</option>';
    cargos.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nombre} — ${fmt(c.salario_base)}/mes`;
        sel.appendChild(opt);
    });
}

function renderCargos(cargos) {
    const cont = document.getElementById('cargosListModal');
    if (!cargos.length) { cont.innerHTML = '<div class="empty-state-sm">Sin cargos. Crea el primero.</div>'; return; }
    cont.innerHTML = cargos.map(c => `
        <div class="trab-card" style="flex-direction:column;align-items:stretch">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <strong style="font-size:15px">${c.nombre}</strong>
                <button class="btn-icon" onclick="eliminarCargo(${c.id})" title="Eliminar cargo">🗑️</button>
            </div>
            ${c.descripcion ? `<p style="font-size:12px;color:var(--texto-suave);margin:4px 0 8px">${c.descripcion}</p>` : '<div style="margin-bottom:8px"></div>'}
            <div class="trab-salarios">
                <span class="sal-chip mensual">💵 Mensual: ${fmt(c.salario_base)}</span>
                <span class="sal-chip quincenal">📅 Quincenal: ${fmt(c.salario_quincenal)}</span>
                <span class="sal-chip neto">✅ Neto: ${fmt(c.salario_neto)}</span>
            </div>
        </div>`).join('');
}

document.getElementById('btnNuevoCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'block';
    document.getElementById('cargoNombre').value  = '';
    document.getElementById('cargoSalario').value = '';
    document.getElementById('cargoDesc').value    = '';
    document.getElementById('cargoPreview').style.display = 'none';
});
document.getElementById('cancelarCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'none';
});

document.getElementById('cargoSalario').addEventListener('input', () => {
    const sal  = parseFloat(document.getElementById('cargoSalario').value) || 0;
    const prev = document.getElementById('cargoPreview');
    if (sal > 0) {
        prev.style.display = 'block';
        prev.innerHTML = `<strong>Vista previa del cargo:</strong><br/>
            💵 Mensual: <strong>${fmt(sal)}</strong> &nbsp;|&nbsp; 📅 Quincenal: <strong>${fmt(sal / 2)}</strong><br/>
            🏥 Descuento salud (4%): <strong>${fmt(sal * 0.04)}</strong> &nbsp;|&nbsp; 🏛️ Descuento pensión (4%): <strong>${fmt(sal * 0.04)}</strong><br/>
            ✅ Salario neto: <strong>${fmt(sal * 0.92)}</strong>`;
    } else { prev.style.display = 'none'; }
});

document.getElementById('guardarCargo').addEventListener('click', async () => {
    const nombre  = document.getElementById('cargoNombre').value.trim();
    const salario = parseFloat(document.getElementById('cargoSalario').value);
    if (!nombre)              return alert('El nombre del cargo es obligatorio');
    if (!salario || salario <= 0) return alert('El salario debe ser mayor a 0');
    try {
        const res = await fetch(`${API}/nomina/cargos`, {
            method: 'POST', headers,
            body: JSON.stringify({ emprendimiento_id: empActivo, nombre, salario_base: salario, descripcion: document.getElementById('cargoDesc').value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar cargo');
        document.getElementById('formCargo').style.display = 'none';
        cargarCargos();
    } catch (e) { alert(e.message); }
});

async function eliminarCargo(id) {
    if (!confirm('¿Eliminar este cargo?')) return;
    try {
        const res  = await fetch(`${API}/nomina/cargos/${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        cargarCargos();
        cargarTrabajadores();
    } catch (e) { alert(e.message); }
}

// ── TRABAJADORES ─────────────────────────────────────────

async function cargarTrabajadores() {
    if (!empActivo) return;
    try {
        const res  = await fetch(`${API}/nomina/trabajadores/${empActivo}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        renderTrabajadores(data);
    } catch (e) {
        document.getElementById('trabListModal').innerHTML = `<div class="empty-state-sm">Error al cargar trabajadores.</div>`;
    }
}

function renderTrabajadores(lista) {
    const cont = document.getElementById('trabListModal');
    if (!lista.length) {
        cont.innerHTML = `<div class="empty-state-sm">🧑‍💼 Sin trabajadores aún.<br/>
            <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="switchTab('nuevo')">+ Agregar trabajador</button></div>`;
        return;
    }
    cont.innerHTML = lista.map(t => `
        <div class="trab-card">
            <div class="trab-info" style="flex:1">
                <strong>${t.nombre} ${t.apellido}</strong>
                <span class="trab-badge">${t.cargo_nombre || 'Sin cargo'}</span>
                <div class="trab-meta">
                    ${t.edad ? `🎂 ${t.edad} años &nbsp;|&nbsp;` : ''}
                    ${t.cedula ? `🪪 CC: ${t.cedula} &nbsp;|&nbsp;` : ''}
                    ${t.fecha_ingreso ? `📅 Ingreso: ${new Date(t.fecha_ingreso).toLocaleDateString('es-CO')}` : ''}
                </div>
                <div class="trab-salarios">
                    <span class="sal-chip mensual">💵 ${fmt(t.salario_base)}/mes</span>
                    <span class="sal-chip quincenal">📅 ${fmt(t.salario_quincenal)}/quin.</span>
                    <span class="sal-chip neto">✅ Neto: ${fmt(t.salario_neto)}</span>
                </div>
            </div>
            <button class="btn-icon" onclick="eliminarTrabajador(${t.id})" title="Eliminar trabajador">🗑️</button>
        </div>`).join('');
}

document.getElementById('trabCargo').addEventListener('change', () => {
    const cargoId = document.getElementById('trabCargo').value;
    const prev    = document.getElementById('trabSalaryPreview');
    if (!cargoId) { prev.style.display = 'none'; return; }
    const cargo = cargosCache.find(c => String(c.id) === String(cargoId));
    if (cargo) {
        prev.style.display = 'block';
        prev.innerHTML = `<strong>💼 Salario para "${cargo.nombre}":</strong><br/>
            💵 Mensual bruto: <strong>${fmt(cargo.salario_base)}</strong><br/>
            📅 Quincenal: <strong>${fmt(cargo.salario_quincenal)}</strong><br/>
            🏥 Descuento salud (4%): <strong>${fmt(cargo.deduccion_salud)}</strong><br/>
            🏛️ Descuento pensión (4%): <strong>${fmt(cargo.deduccion_pension)}</strong><br/>
            ✅ Salario neto mensual: <strong>${fmt(cargo.salario_neto)}</strong>`;
    }
});

document.getElementById('guardarTrab').addEventListener('click', async () => {
    const nombre   = document.getElementById('trabNombre').value.trim();
    const apellido = document.getElementById('trabApellido').value.trim();
    const edad     = document.getElementById('trabEdad').value.trim();
    const cedula   = document.getElementById('trabCedula').value.trim();
    const cargoId  = document.getElementById('trabCargo').value;
    const fecha    = document.getElementById('trabFecha').value;
    const errEl    = document.getElementById('errorTrab');
    const okEl     = document.getElementById('successTrab');
    errEl.style.display = 'none';
    okEl.style.display  = 'none';

    if (!nombre || !apellido) { errEl.textContent = 'Nombre y apellido son obligatorios'; errEl.style.display = 'block'; return; }
    if (!edad || isNaN(edad) || Number(edad) < 14) { errEl.textContent = 'Ingresa una edad válida (mínimo 14 años)'; errEl.style.display = 'block'; return; }
    if (!cargoId) { errEl.textContent = 'Debes seleccionar un cargo'; errEl.style.display = 'block'; return; }

    try {
        const res = await fetch(`${API}/nomina/trabajadores`, {
            method: 'POST', headers,
            body: JSON.stringify({ emprendimiento_id: empActivo, cargo_id: cargoId, nombre, apellido, edad: Number(edad), cedula, fecha_ingreso: fecha })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        okEl.textContent = `✅ ${nombre} ${apellido} registrado correctamente`;
        okEl.style.display = 'block';
        setTimeout(() => { okEl.style.display = 'none'; switchTab('lista'); cargarTrabajadores(); }, 1500);
    } catch (e) { errEl.textContent = e.message; errEl.style.display = 'block'; }
});

async function eliminarTrabajador(id) {
    if (!confirm('¿Eliminar este trabajador?')) return;
    try {
        await fetch(`${API}/nomina/trabajadores/${id}`, { method: 'DELETE', headers });
        cargarTrabajadores();
    } catch (e) { alert(e.message); }
}

cargarEmprendimientos();