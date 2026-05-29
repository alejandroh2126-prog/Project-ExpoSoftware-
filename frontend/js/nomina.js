const API     = 'http://localhost:3000/api';
const token   = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear(); window.location.href = 'login.html';
});

const fmt = n => '$' + Number(n).toLocaleString('es-CO');

/* ── SELECTOR DE EMPRENDIMIENTO ── */
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
    await Promise.all([cargarResumen(empId), cargarCargos(empId), cargarTrabajadores(empId)]);
}

/* ── RESUMEN ── */
async function cargarResumen(empId) {
    const res  = await fetch(`${API}/nomina/resumen/${empId}`, { headers });
    const data = await res.json();
    document.getElementById('statTrabajadores').textContent = data.total_trabajadores;
    document.getElementById('statMensual').textContent      = fmt(data.nomina_mensual);
    document.getElementById('statQuincenal').textContent    = fmt(data.nomina_quincenal);
    document.getElementById('statNeta').textContent         = fmt(data.nomina_neta);
}

/* ── CARGOS ── */
async function cargarCargos(empId) {
    const res   = await fetch(`${API}/nomina/cargos/${empId}`, { headers });
    const lista = await res.json();
    const cont  = document.getElementById('cargosList');

    // También llenar el select de trabajadores
    const sel = document.getElementById('trabCargo');
    sel.innerHTML = '<option value="">Selecciona un cargo</option>';
    lista.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nombre} — ${fmt(c.salario_base)}/mes`;
        sel.appendChild(opt);
    });

    if (!lista.length) {
        cont.innerHTML = '<p class="empty-msg">Sin cargos. Crea el primero.</p>';
        return;
    }

    cont.innerHTML = lista.map(c => `
    <div class="trans-item" style="flex-direction:column;align-items:flex-start;gap:8px">
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
        <strong style="font-size:15px;color:#1a1a18">${c.nombre}</strong>
        <button class="btn-icon" onclick="eliminarCargo(${c.id}, ${empId})">🗑️</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%">
        <div style="background:#E1F5EE;border-radius:8px;padding:8px 10px;font-size:12px">
          <div style="color:#085041;font-weight:700">Mensual</div>
          <div style="color:#1D9E75;font-weight:700;font-size:14px">${fmt(c.salario_base)}</div>
        </div>
        <div style="background:#E1F5EE;border-radius:8px;padding:8px 10px;font-size:12px">
          <div style="color:#085041;font-weight:700">Quincenal</div>
          <div style="color:#1D9E75;font-weight:700;font-size:14px">${fmt(c.salario_quincenal)}</div>
        </div>
        <div style="background:#FAEEDA;border-radius:8px;padding:8px 10px;font-size:12px">
          <div style="color:#BA7517;font-weight:700">Neto (−8%)</div>
          <div style="color:#BA7517;font-weight:700;font-size:14px">${fmt(c.salario_neto)}</div>
        </div>
      </div>
      ${c.descripcion ? `<p style="font-size:12px;color:#888">${c.descripcion}</p>` : ''}
    </div>
  `).join('');
}

// Preview automático al escribir salario
document.getElementById('cargoSalario').addEventListener('input', () => {
    const sal   = parseFloat(document.getElementById('cargoSalario').value) || 0;
    const prev  = document.getElementById('cargoPreview');
    if (sal > 0) {
        prev.style.display = 'block';
        prev.innerHTML = `
      <strong>Vista previa del cálculo:</strong><br/>
      💵 Salario mensual: <strong>${fmt(sal)}</strong><br/>
      📅 Quincena: <strong>${fmt(sal / 2)}</strong><br/>
      🏥 Deducción salud (4%): <strong>${fmt(sal * 0.04)}</strong><br/>
      🏦 Deducción pensión (4%): <strong>${fmt(sal * 0.04)}</strong><br/>
      ✅ Salario neto: <strong>${fmt(sal * 0.92)}</strong>
    `;
    } else {
        prev.style.display = 'none';
    }
});

document.getElementById('btnNuevoCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'block';
});
document.getElementById('cancelarCargo').addEventListener('click', () => {
    document.getElementById('formCargo').style.display = 'none';
    document.getElementById('cargoPreview').style.display = 'none';
    document.getElementById('cargoNombre').value  = '';
    document.getElementById('cargoSalario').value = '';
    document.getElementById('cargoDesc').value    = '';
});
document.getElementById('guardarCargo').addEventListener('click', async () => {
    const empId  = document.getElementById('selectorEmp').value;
    const nombre = document.getElementById('cargoNombre').value.trim();
    const salario= document.getElementById('cargoSalario').value;
    if (!empId)   return alert('Selecciona un emprendimiento primero');
    if (!nombre)  return alert('El nombre del cargo es obligatorio');
    if (!salario) return alert('El salario es obligatorio');
    await fetch(`${API}/nomina/cargos`, {
        method: 'POST', headers,
        body: JSON.stringify({
            emprendimiento_id: empId,
            nombre, salario_base: parseFloat(salario),
            descripcion: document.getElementById('cargoDesc').value
        })
    });
    document.getElementById('cancelarCargo').click();
    cargarDatos(empId);
});

async function eliminarCargo(id, empId) {
    if (!confirm('¿Eliminar este cargo?')) return;
    const res  = await fetch(`${API}/nomina/cargos/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (data.error) return alert(data.error);
    cargarDatos(empId);
}

/* ── TRABAJADORES ── */
async function cargarTrabajadores(empId) {
    const res   = await fetch(`${API}/nomina/trabajadores/${empId}`, { headers });
    const lista = await res.json();
    const cont  = document.getElementById('trabList');
    if (!lista.length) {
        cont.innerHTML = '<p class="empty-msg">Sin trabajadores. Crea el primero.</p>';
        return;
    }
    cont.innerHTML = lista.map(t => `
    <div class="trans-item" style="flex-direction:column;align-items:flex-start;gap:6px">
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
        <div>
          <strong style="font-size:15px;color:#1a1a18">${t.nombre} ${t.apellido}</strong>
          <span style="margin-left:8px;font-size:11px;background:#E1F5EE;color:#085041;padding:2px 8px;border-radius:999px;font-weight:700">${t.cargo_nombre}</span>
        </div>
        <button class="btn-icon" onclick="eliminarTrab(${t.id}, ${empId})">🗑️</button>
      </div>
      ${t.cedula ? `<p style="font-size:12px;color:#888">CC: ${t.cedula}</p>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%">
        <div style="background:#f8f7f3;border-radius:8px;padding:7px 10px;font-size:12px">
          <div style="color:#888;font-weight:600">Mensual bruto</div>
          <div style="color:#1D9E75;font-weight:700">${fmt(t.salario_base)}</div>
        </div>
        <div style="background:#f8f7f3;border-radius:8px;padding:7px 10px;font-size:12px">
          <div style="color:#888;font-weight:600">Quincenal</div>
          <div style="color:#1D9E75;font-weight:700">${fmt(t.salario_quincenal)}</div>
        </div>
        <div style="background:#FAEEDA;border-radius:8px;padding:7px 10px;font-size:12px">
          <div style="color:#BA7517;font-weight:600">Neto mensual</div>
          <div style="color:#BA7517;font-weight:700">${fmt(t.salario_neto)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Preview al seleccionar cargo
document.getElementById('trabCargo').addEventListener('change', () => {
    const sel   = document.getElementById('trabCargo');
    const opt   = sel.options[sel.selectedIndex];
    const prev  = document.getElementById('trabPreview');
    if (!sel.value) { prev.style.display = 'none'; return; }
    const texto = opt.textContent;
    const match = texto.match(/\$([\d.,]+)/);
    if (match) {
        const sal = parseFloat(match[1].replace(/\./g,'').replace(',','.'));
        prev.style.display = 'block';
        prev.innerHTML = `
      <strong>Cálculo para este cargo:</strong><br/>
      💵 Mensual bruto: <strong>${fmt(sal)}</strong><br/>
      📅 Quincenal: <strong>${fmt(sal/2)}</strong><br/>
      🏥 Salud + pensión (8%): <strong>${fmt(sal*0.08)}</strong><br/>
      ✅ Neto mensual: <strong>${fmt(sal*0.92)}</strong>
    `;
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
    document.getElementById('trabPreview').style.display    = 'none';
    document.getElementById('trabNombre').value   = '';
    document.getElementById('trabApellido').value = '';
    document.getElementById('trabCedula').value   = '';
    document.getElementById('trabCargo').value    = '';
});
document.getElementById('guardarTrab').addEventListener('click', async () => {
    const empId   = document.getElementById('selectorEmp').value;
    const nombre  = document.getElementById('trabNombre').value.trim();
    const apellido= document.getElementById('trabApellido').value.trim();
    const cargoId = document.getElementById('trabCargo').value;
    if (!nombre || !apellido) return alert('Nombre y apellido son obligatorios');
    if (!cargoId) return alert('Selecciona un cargo');
    await fetch(`${API}/nomina/trabajadores`, {
        method: 'POST', headers,
        body: JSON.stringify({
            emprendimiento_id: empId, cargo_id: cargoId,
            nombre, apellido,
            cedula:        document.getElementById('trabCedula').value,
            fecha_ingreso: document.getElementById('trabFecha').value,
        })
    });
    document.getElementById('cancelarTrab').click();
    cargarDatos(empId);
});

async function eliminarTrab(id, empId) {
    if (!confirm('¿Eliminar este trabajador?')) return;
    await fetch(`${API}/nomina/trabajadores/${id}`, { method: 'DELETE', headers });
    cargarDatos(empId);
}

cargarSelector();