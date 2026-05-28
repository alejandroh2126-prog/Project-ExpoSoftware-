const API   = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear(); window.location.href = 'login.html';
});

// Cargar selector de emprendimientos
async function cargarSelector() {
    const res  = await fetch(`${API}/emprendimientos`, { headers });
    const data = await res.json();
    const sel  = document.getElementById('selectorEmp');
    data.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id; opt.textContent = e.nombre; sel.appendChild(opt);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('emp')) { sel.value = params.get('emp'); cargarDatos(params.get('emp')); }
}

document.getElementById('selectorEmp').addEventListener('change', e => {
    if (e.target.value) cargarDatos(e.target.value);
});

async function cargarDatos(empId) {
    await Promise.all([cargarResumen(empId), cargarTransacciones(empId), cargarPresupuestos(empId)]);
}

// RESUMEN
async function cargarResumen(empId) {
    const res  = await fetch(`${API}/finanzas/resumen/${empId}`, { headers });
    const data = await res.json();
    const fmt  = n => '$' + Number(n).toLocaleString('es-CO');
    document.getElementById('totalIngresos').textContent = fmt(data.ingresos);
    document.getElementById('totalGastos').textContent   = fmt(data.gastos);
    const balEl = document.getElementById('balance');
    balEl.textContent   = fmt(data.balance);
    balEl.style.color   = data.balance >= 0 ? 'var(--verde)' : '#E24B4A';
}

// TRANSACCIONES
async function cargarTransacciones(empId) {
    const res   = await fetch(`${API}/finanzas/transacciones/${empId}`, { headers });
    const lista = await res.json();
    const cont  = document.getElementById('transLista');
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin transacciones aún.</p>'; return; }
    cont.innerHTML = lista.map(t => `
    <div class="trans-item ${t.tipo}">
      <div class="trans-info">
        <strong>${t.descripcion || t.categoria}</strong>
        <span class="trans-cat">${t.categoria} · ${t.fecha}</span>
      </div>
      <div class="trans-monto">
        <span class="${t.tipo}">${t.tipo === 'ingreso' ? '+' : '-'}$${Number(t.monto).toLocaleString('es-CO')}</span>
        <button class="btn-icon" onclick="eliminarTrans(${t.id}, ${empId})">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function eliminarTrans(id, empId) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    await fetch(`${API}/finanzas/transacciones/${id}`, { method: 'DELETE', headers });
    cargarDatos(empId);
}

// Form transacción
document.getElementById('btnNuevaTrans').addEventListener('click', () => {
    document.getElementById('formTrans').style.display = 'block';
    document.getElementById('transFecha').value = new Date().toISOString().split('T')[0];
});
document.getElementById('cancelarTrans').addEventListener('click', () => {
    document.getElementById('formTrans').style.display = 'none';
});
document.getElementById('guardarTrans').addEventListener('click', async () => {
    const empId = document.getElementById('selectorEmp').value;
    if (!empId) return alert('Selecciona un emprendimiento');
    const monto = document.getElementById('transMonto').value;
    if (!monto || monto <= 0) return alert('Ingresa un monto válido');
    await fetch(`${API}/finanzas/transacciones`, {
        method: 'POST', headers,
        body: JSON.stringify({
            emprendimiento_id: empId,
            tipo:       document.getElementById('transTipo').value,
            categoria:  document.getElementById('transCategoria').value,
            descripcion:document.getElementById('transDesc').value,
            monto:      parseFloat(monto),
            fecha:      document.getElementById('transFecha').value,
        })
    });
    document.getElementById('formTrans').style.display = 'none';
    document.getElementById('transMonto').value = '';
    document.getElementById('transDesc').value  = '';
    cargarDatos(empId);
});

// PRESUPUESTOS
async function cargarPresupuestos(empId) {
    const res   = await fetch(`${API}/finanzas/presupuestos/${empId}`, { headers });
    const lista = await res.json();
    const cont  = document.getElementById('presupLista');
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin presupuestos aún.</p>'; return; }
    cont.innerHTML = lista.map(p => `
    <div class="presup-item">
      <div>
        <strong>${p.categoria}</strong>
        <span class="trans-cat">${p.mes}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="presup-limite">Límite: $${Number(p.monto_limite).toLocaleString('es-CO')}</span>
        <button class="btn-icon" onclick="eliminarPresup(${p.id}, ${empId})">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function eliminarPresup(id, empId) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    await fetch(`${API}/finanzas/presupuestos/${id}`, { method: 'DELETE', headers });
    cargarDatos(empId);
}

document.getElementById('btnNuevoPresup').addEventListener('click', () => {
    document.getElementById('formPresup').style.display = 'block';
    const hoy = new Date();
    document.getElementById('presupMes').value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`;
});
document.getElementById('cancelarPresup').addEventListener('click', () => {
    document.getElementById('formPresup').style.display = 'none';
});
document.getElementById('guardarPresup').addEventListener('click', async () => {
    const empId = document.getElementById('selectorEmp').value;
    if (!empId) return alert('Selecciona un emprendimiento');
    const monto = document.getElementById('presupMonto').value;
    if (!monto || monto <= 0) return alert('Ingresa un monto válido');
    await fetch(`${API}/finanzas/presupuestos`, {
        method: 'POST', headers,
        body: JSON.stringify({
            emprendimiento_id: empId,
            categoria:    document.getElementById('presupCategoria').value,
            monto_limite: parseFloat(monto),
            mes:          document.getElementById('presupMes').value,
        })
    });
    document.getElementById('formPresup').style.display = 'none';
    document.getElementById('presupMonto').value = '';
    cargarDatos(empId);
});

cargarSelector();