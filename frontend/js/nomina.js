// ════════════════════════════════════════════
// SGAPE – Nómina sin servidor
// ════════════════════════════════════════════

const SESSION_KEY = 'sgape_session';

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

const session = getSession();
if (!session) window.location.href = 'login.html';

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

const fmt = n => '$' + Number(n || 0).toLocaleString('es-CO');

function getEmprendimientos() {
    try {
        return (JSON.parse(localStorage.getItem('sgape_emprendimientos')) || [])
            .filter(e => e.usuarioId === session.id);
    } catch { return []; }
}
function getCargos(empId) {
    try { return JSON.parse(localStorage.getItem('sgape_cargos_' + empId)) || []; }
    catch { return []; }
}
function saveCargos(empId, lista) {
    localStorage.setItem('sgape_cargos_' + empId, JSON.stringify(lista));
}
function getTrabajadores(empId) {
    try { return JSON.parse(localStorage.getItem('sgape_trabajadores_' + empId)) || []; }
    catch { return []; }
}
function saveTrabajadores(empId, lista) {
    localStorage.setItem('sgape_trabajadores_' + empId, JSON.stringify(lista));
}

function cargarSelector() {
    const sel  = document.getElementById('selectorEmp');
    const emps = getEmprendimientos();
    emps.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id; opt.textContent = e.nombre; sel.appendChild(opt);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('emp')) { sel.value = params.get('emp'); cargarDatos(params.get('emp')); }
}

document.getElementById('selectorEmp').addEventListener('change', e => {
    if (e.target.value) cargarDatos(e.target.value);
});

function cargarDatos(empId) {
    cargarResumen(empId);
    cargarCargos(empId);
    cargarTrabajadores(empId);
}

function cargarResumen(empId) {
    const trabs      = getTrabajadores(empId).filter(t => t.estado === 'activo');
    const cargos     = getCargos(empId);
    const nominaTotal = trabs.reduce((sum, t) => {
        const cargo = cargos.find(c => c.id === t.cargoId);
        return sum + (cargo ? cargo.salarioBase : 0);
    }, 0);
    document.getElementById('statTrabajadores').textContent = trabs.length;
    document.getElementById('statMensual').textContent      = fmt(nominaTotal);
    document.getElementById('statQuincenal').textContent    = fmt(nominaTotal / 2);
    document.getElementById('statNeta').textContent         = fmt(nominaTotal * 0.92);
}

function cargarCargos(empId) {
    const lista = getCargos(empId);
    const cont  = document.getElementById('cargosList');
    const sel   = document.getElementById('trabCargo');
    sel.innerHTML = '<option value="">Selecciona un cargo</option>';
    lista.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nombre} — ${fmt(c.salarioBase)}/mes`;
        sel.appendChild(opt);
    });
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin cargos. Crea el primero.</p>'; return; }
    cont.innerHTML = lista.map(c => `
        <div class="trans-item" style="flex-direction:column;align-items:flex-start;gap:8px">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
                <strong>${c.nombre}</strong>
                <button class="btn-icon" onclick="eliminarCargo('${c.id}','${empId}')">🗑️</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%">
                <div style="background:#E1F5EE;border-radius:8px;padding:8px 10px;font-size:12px">
                    <div style="color:#085041;font-weight:700">Mensual</div>
                    <div style="color:#1D9E75;font-weight:700">${fmt(c.salarioBase)}</div>
                </div>
                <div style="background:#E1F5EE;border-radius:8px;padding:8px 10px;font-size:12px">
                    <div style="color:#085041;font-weight:700">Quincenal</div>
                    <div style="color:#1D9E75;font-weight:700">${fmt(c.salarioBase / 2)}</div>
                </div>
                <div style="background:#FAEEDA;border-radius:8px;padding:8px 10px;font-size:12px">
                    <div style="color:#BA7517;font-weight:700">Neto (−8%)</div>
                    <div style="color:#BA7517;font-weight:700">${fmt(c.salarioBase * 0.92)}</div>
                </div>
            </div>
        </div>`).join('');
}

function eliminarCargo(id, empId) {
    const trabs = getTrabajadores(empId);
    if (trabs.find(t => t.cargoId === id))
        return alert('No puedes eliminar un cargo con trabajadores asignados.');
    if (!confirm('¿Eliminar este cargo?')) return;
    saveCargos(empId, getCargos(empId).filter(c => c.id !== id));
    cargarDatos(empId);
}

document.getElementById('cargoSalario').addEventListener('input', () => {
    const sal  = parseFloat(document.getElementById('cargoSalario').value) || 0;
    const prev = document.getElementById('cargoPreview');
    if (sal > 0) {
        prev.style.display = 'block';
        prev.innerHTML = `<strong>Vista previa:</strong><br/>
            💵 Mensual: <strong>${fmt(sal)}</strong><br/>
            📅 Quincenal: <strong>${fmt(sal/2)}</strong><br/>
            🏥 Salud+Pensión (8%): <strong>${fmt(sal*0.08)}</strong><br/>
            ✅ Neto: <strong>${fmt(sal*0.92)}</strong>`;
    } else prev.style.display = 'none';
});

document.getElementById('btnNuevoCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'block';
});
document.getElementById('cancelarCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'none';
    document.getElementById('cargoPreview').style.display = 'none';
    document.getElementById('cargoNombre').value = '';
    document.getElementById('cargoSalario').value = '';
    document.getElementById('cargoDesc').value = '';
});
document.getElementById('guardarCargo').addEventListener('click', async () => {
    const empId  = document.getElementById('selectorEmp').value;
    const nombre = document.getElementById('cargoNombre').value.trim();
    const salario = parseFloat(document.getElementById('cargoSalario').value);
    if (!empId)  return alert('Selecciona un emprendimiento primero');
    if (!nombre) return alert('El nombre del cargo es obligatorio');
    if (!salario || salario <= 0) return alert('El salario debe ser mayor a 0');

    const token = localStorage.getItem('token');
    if (!token) return alert('Debes estar logueado');

    const body = {
        emprendimiento_id: empId,
        nombre,
        salario_base: salario,
        descripcion: document.getElementById('cargoDesc').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/nomina/cargos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        // Si quieres mantener la lógica local offline:
        const lista = getCargos(empId);
        lista.push({ ...body, id: data.id || Date.now().toString(), salarioBase: salario });
        saveCargos(empId, lista);
        document.getElementById('cancelarCargo').click();
        cargarDatos(empId);
    } catch (e) {
        alert(e.message);
    }
});

function cargarTrabajadores(empId) {
    const lista  = getTrabajadores(empId);
    const cargos = getCargos(empId);
    const cont   = document.getElementById('trabList');
    if (!lista.length) { cont.innerHTML = '<p class="empty-msg">Sin trabajadores. Crea el primero.</p>'; return; }
    cont.innerHTML = lista.map(t => {
        const cargo = cargos.find(c => c.id === t.cargoId) || {};
        return `
        <div class="trans-item" style="flex-direction:column;align-items:flex-start;gap:6px">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
                <div>
                    <strong>${t.nombre} ${t.apellido}</strong>
                    <span style="margin-left:8px;font-size:11px;background:#E1F5EE;color:#085041;padding:2px 8px;border-radius:999px;font-weight:700">${cargo.nombre || 'Sin cargo'}</span>
                </div>
                <button class="btn-icon" onclick="eliminarTrab('${t.id}','${empId}')">🗑️</button>
            </div>
            ${t.cedula ? `<p style="font-size:12px;color:#888">CC: ${t.cedula}</p>` : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%">
                <div style="background:#f8f7f3;border-radius:8px;padding:7px 10px;font-size:12px">
                    <div style="color:#888;font-weight:600">Mensual</div>
                    <div style="color:#1D9E75;font-weight:700">${fmt(cargo.salarioBase)}</div>
                </div>
                <div style="background:#f8f7f3;border-radius:8px;padding:7px 10px;font-size:12px">
                    <div style="color:#888;font-weight:600">Quincenal</div>
                    <div style="color:#1D9E75;font-weight:700">${fmt((cargo.salarioBase||0)/2)}</div>
                </div>
                <div style="background:#FAEEDA;border-radius:8px;padding:7px 10px;font-size:12px">
                    <div style="color:#BA7517;font-weight:600">Neto</div>
                    <div style="color:#BA7517;font-weight:700">${fmt((cargo.salarioBase||0)*0.92)}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function eliminarTrab(id, empId) {
    if (!confirm('¿Eliminar este trabajador?')) return;
    saveTrabajadores(empId, getTrabajadores(empId).filter(t => t.id !== id));
    cargarDatos(empId);
}

document.getElementById('trabCargo').addEventListener('change', () => {
    const sel  = document.getElementById('trabCargo');
    const prev = document.getElementById('trabPreview');
    if (!sel.value) { prev.style.display = 'none'; return; }
    const empId = document.getElementById('selectorEmp').value;
    const cargo = getCargos(empId).find(c => c.id === sel.value);
    if (cargo) {
        prev.style.display = 'block';
        prev.innerHTML = `<strong>Cálculo para este cargo:</strong><br/>
            💵 Mensual: <strong>${fmt(cargo.salarioBase)}</strong><br/>
            📅 Quincenal: <strong>${fmt(cargo.salarioBase/2)}</strong><br/>
            🏥 Deducciones (8%): <strong>${fmt(cargo.salarioBase*0.08)}</strong><br/>
            ✅ Neto: <strong>${fmt(cargo.salarioBase*0.92)}</strong>`;
    }
});

document.getElementById('btnNuevoTrabajador').addEventListener('click', () => {
    const empId = document.getElementById('selectorEmp').value;
    if (!empId) return alert('Selecciona un emprendimiento primero');
    document.getElementById('formTrabajador').style.display = 'block';
    document.getElementById('trabFecha').value = new Date().toISOString().split('T')[0];
});
document.getElementById('cancelarTrab').addEventListener('click', () => {
    document.getElementById('formTrabajador').style.display = 'none';
    document.getElementById('trabPreview').style.display = 'none';
    document.getElementById('trabNombre').value = '';
    document.getElementById('trabApellido').value = '';
    document.getElementById('trabCedula').value = '';
    document.getElementById('trabCargo').value = '';
});
document.getElementById('guardarTrab').addEventListener('click', async () => {
    const empId   = document.getElementById('selectorEmp').value;
    const nombre  = document.getElementById('trabNombre').value.trim();
    const apellido= document.getElementById('trabApellido').value.trim();
    const cargoId = document.getElementById('trabCargo').value;
    if (!nombre || !apellido) return alert('Nombre y apellido son obligatorios');
    if (!cargoId) return alert('Selecciona un cargo');

    const token = localStorage.getItem('token');
    if (!token) return alert('Debes estar logueado');

    const body = {
        emprendimiento_id: empId,
        cargo_id: cargoId,
        nombre,
        apellido,
        cedula: document.getElementById('trabCedula').value,
        fecha_ingreso: document.getElementById('trabFecha').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/nomina/trabajadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        // Guarda local también si quieres
        const lista = getTrabajadores(empId);
        lista.push({ ...body, id: data.id || Date.now().toString(), estado: 'activo' });
        saveTrabajadores(empId, lista);
        document.getElementById('cancelarTrab').click();
        cargarDatos(empId);
    } catch (e) {
        alert(e.message);
    }
});

cargarSelector();