// ════════════════════════════════════════════
// SGAPE – Finanzas sin servidor
// ════════════════════════════════════════════

const SESSION_KEY = 'sgape_session';
const API         = 'http://localhost:3000/api';

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

const session = getSession();
const token   = localStorage.getItem('token');
if (!session || !token) window.location.href = 'login.html';

const apiHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

const fmt = n => '$' + Number(n || 0).toLocaleString('es-CO');




function getTrans(empId) {
    try { return JSON.parse(localStorage.getItem('sgape_trans_' + empId)) || []; }
    catch { return []; }
}
function saveTrans(empId, lista) {
    localStorage.setItem('sgape_trans_' + empId, JSON.stringify(lista));
}
function getPresup(empId) {
    try { return JSON.parse(localStorage.getItem('sgape_presup_' + empId)) || []; }
    catch { return []; }
}
function savePresup(empId, lista) {
    localStorage.setItem('sgape_presup_' + empId, JSON.stringify(lista));
}

// Cargar selector desde la API
async function cargarSelector() {
    const sel = document.getElementById('selectorEmp');
    try {
        const res  = await fetch(`${API}/emprendimientos`, { headers: apiHeaders });
        const emps = await res.json();
        if (!res.ok) throw new Error('Error al cargar emprendimientos');
        emps.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id; opt.textContent = e.nombre; sel.appendChild(opt);
        });
        const params = new URLSearchParams(window.location.search);
        if (params.get('emp')) { sel.value = params.get('emp'); cargarDatos(params.get('emp')); }
    } catch (e) { console.error('Error cargando emprendimientos:', e.message); }
}

document.getElementById('selectorEmp').addEventListener('change', e => {
    if (e.target.value) cargarDatos(e.target.value);
});

function cargarDatos(empId) {
    cargarResumen(empId);
    cargarTransacciones(empId);
    cargarPresupuestos(empId);
}

function cargarResumen(empId) {
    const trans    = getTrans(empId);
    const ingresos = trans.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
    const gastos   = trans.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
    const balance  = ingresos - gastos;
    document.getElementById('totalIngresos').textContent = fmt(ingresos);
    document.getElementById('totalGastos').textContent   = fmt(gastos);
    const balEl = document.getElementById('balance');
    balEl.textContent = fmt(balance);
    balEl.style.color = balance >= 0 ? 'var(--verde)' : '#E24B4A';
}

function cargarTransacciones(empId) {
    const lista = getTrans(empId);
    const cont  = document.getElementById('transLista');
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin transacciones aún.</p>'; return; }
    cont.innerHTML = lista.slice().reverse().map(t => `
        <div class="trans-item ${t.tipo}">
            <div class="trans-info">
                <strong>${t.descripcion || t.categoria}</strong>
                <span class="trans-cat">${t.categoria} · ${t.fecha}</span>
            </div>
            <div class="trans-monto">
                <span class="${t.tipo}">${t.tipo === 'ingreso' ? '+' : '-'}${fmt(t.monto)}</span>
                <button class="btn-icon" onclick="eliminarTrans('${t.id}','${empId}')">🗑️</button>
            </div>
        </div>`).join('');
}

function eliminarTrans(id, empId) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    saveTrans(empId, getTrans(empId).filter(t => t.id !== id));
    cargarDatos(empId);
}

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
    const monto = parseFloat(document.getElementById('transMonto').value);
    if (!monto || monto <= 0) return alert('Ingresa un monto válido');

    const token = localStorage.getItem('token');
    if (!token) return alert('Debes estar logueado');

    const body = {
        emprendimiento_id: empId,
        tipo:        document.getElementById('transTipo').value,
        categoria:   document.getElementById('transCategoria').value,
        descripcion: document.getElementById('transDesc').value,
        monto,
        fecha:       document.getElementById('transFecha').value,
    };

    try {
        const res = await fetch('http://localhost:3000/api/finanzas/transacciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');

        // Si quieres seguir guardando localmente para offline:
        const lista = getTrans(empId);
        lista.push({ ...body, id: data.id || Date.now().toString() });
        saveTrans(empId, lista);

        document.getElementById('formTrans').style.display = 'none';
        document.getElementById('transMonto').value = '';
        document.getElementById('transDesc').value  = '';
        cargarDatos(empId);
    } catch (e) {
        alert(e.message);
    }
});

function cargarPresupuestos(empId) {
    const lista = getPresup(empId);
    const cont  = document.getElementById('presupLista');
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin presupuestos aún.</p>'; return; }
    cont.innerHTML = lista.map(p => `
        <div class="presup-item">
            <div><strong>${p.categoria}</strong><span class="trans-cat"> · ${p.mes}</span></div>
            <div style="display:flex;align-items:center;gap:10px">
                <span class="presup-limite">Límite: ${fmt(p.monto_limite)}</span>
                <button class="btn-icon" onclick="eliminarPresup('${p.id}','${empId}')">🗑️</button>
            </div>
        </div>`).join('');
}

function eliminarPresup(id, empId) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    savePresup(empId, getPresup(empId).filter(p => p.id !== id));
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
    const monto = parseFloat(document.getElementById('presupMonto').value);
    if (!monto || monto <= 0) return alert('Ingresa un monto válido');

    const token = localStorage.getItem('token');
    if (!token) return alert('Debes estar logueado');

    const body = {
        emprendimiento_id: empId,
        categoria:   document.getElementById('presupCategoria').value,
        monto_limite: monto,
        mes:         document.getElementById('presupMes').value,
    };

    try {
        const res = await fetch('http://localhost:3000/api/finanzas/presupuestos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        // Guarda también local si quieres mantener datos offline:
        const lista = getPresup(empId);
        lista.push({ ...body, id: data.id || Date.now().toString() });
        savePresup(empId, lista);
        document.getElementById('formPresup').style.display = 'none';
        document.getElementById('presupMonto').value = '';
        cargarDatos(empId);
    } catch (e) {
        alert(e.message);
    }
});

cargarSelector();