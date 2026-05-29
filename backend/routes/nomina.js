const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../database');

const router     = express.Router();
const SECRET_KEY = 'clave_secreta_poo_2024';

function verificarToken(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Token requerido' });
    try {
        req.usuario = jwt.verify(auth.split(' ')[1], SECRET_KEY);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

/* ══════════════════════════════
   CARGOS
══════════════════════════════ */

// Obtener todos los cargos de un emprendimiento
router.get('/cargos/:empId', verificarToken, (req, res) => {
    const emp = db.prepare(
        'SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?'
    ).get(req.params.empId, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });

    const cargos = db.prepare(
        'SELECT * FROM cargos WHERE emprendimiento_id = ? ORDER BY nombre'
    ).all(req.params.empId);

    // Calcular quincena y mensual para cada cargo
    const resultado = cargos.map(c => ({
        ...c,
        salario_quincenal: parseFloat((c.salario_base / 2).toFixed(2)),
        salario_mensual:   c.salario_base,
        deduccion_salud:   parseFloat((c.salario_base * 0.04).toFixed(2)),
        deduccion_pension: parseFloat((c.salario_base * 0.04).toFixed(2)),
        salario_neto:      parseFloat((c.salario_base * 0.92).toFixed(2)),
    }));

    res.json(resultado);
});

// Crear cargo
router.post('/cargos', verificarToken, (req, res) => {
    const { emprendimiento_id, nombre, salario_base, descripcion } = req.body;
    if (!emprendimiento_id || !nombre || !salario_base)
        return res.status(400).json({ error: 'Nombre y salario son obligatorios' });

    const emp = db.prepare(
        'SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?'
    ).get(emprendimiento_id, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });

    const result = db.prepare(
        'INSERT INTO cargos (emprendimiento_id, nombre, salario_base, descripcion) VALUES (?, ?, ?, ?)'
    ).run(emprendimiento_id, nombre, parseFloat(salario_base), descripcion || '');

    res.json({ id: result.lastInsertRowid, mensaje: 'Cargo creado correctamente' });
});

// Eliminar cargo
router.delete('/cargos/:id', verificarToken, (req, res) => {
    const trabajadores = db.prepare(
        'SELECT COUNT(*) as total FROM trabajadores WHERE cargo_id = ?'
    ).get(req.params.id);
    if (trabajadores.total > 0)
        return res.status(400).json({ error: 'No puedes eliminar un cargo que tiene trabajadores asignados' });

    db.prepare('DELETE FROM cargos WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Cargo eliminado' });
});

/* ══════════════════════════════
   TRABAJADORES
══════════════════════════════ */

// Obtener trabajadores de un emprendimiento
router.get('/trabajadores/:empId', verificarToken, (req, res) => {
    const emp = db.prepare(
        'SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?'
    ).get(req.params.empId, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });

    const trabajadores = db.prepare(`
    SELECT t.*, c.nombre as cargo_nombre, c.salario_base,
           ROUND(c.salario_base / 2, 2)       as salario_quincenal,
           ROUND(c.salario_base * 0.92, 2)    as salario_neto,
           ROUND(c.salario_base * 0.04, 2)    as deduccion_salud,
           ROUND(c.salario_base * 0.04, 2)    as deduccion_pension
    FROM trabajadores t
    JOIN cargos c ON t.cargo_id = c.id
    WHERE t.emprendimiento_id = ?
    ORDER BY t.nombre
  `).all(req.params.empId);

    res.json(trabajadores);
});

// Crear trabajador
router.post('/trabajadores', verificarToken, (req, res) => {
    const { emprendimiento_id, cargo_id, nombre, apellido, cedula, fecha_ingreso } = req.body;
    if (!emprendimiento_id || !cargo_id || !nombre || !apellido)
        return res.status(400).json({ error: 'Nombre, apellido y cargo son obligatorios' });

    const result = db.prepare(
        'INSERT INTO trabajadores (emprendimiento_id, cargo_id, nombre, apellido, cedula, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(emprendimiento_id, cargo_id, nombre, apellido, cedula || '', fecha_ingreso || '');

    res.json({ id: result.lastInsertRowid, mensaje: 'Trabajador registrado correctamente' });
});

// Actualizar trabajador
router.put('/trabajadores/:id', verificarToken, (req, res) => {
    const { cargo_id, nombre, apellido, cedula, fecha_ingreso, estado } = req.body;
    const t = db.prepare('SELECT * FROM trabajadores WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ error: 'Trabajador no encontrado' });

    db.prepare(
        'UPDATE trabajadores SET cargo_id=?, nombre=?, apellido=?, cedula=?, fecha_ingreso=?, estado=? WHERE id=?'
    ).run(
        cargo_id || t.cargo_id, nombre || t.nombre, apellido || t.apellido,
        cedula ?? t.cedula, fecha_ingreso ?? t.fecha_ingreso, estado ?? t.estado,
        req.params.id
    );
    res.json({ mensaje: 'Actualizado correctamente' });
});

// Eliminar trabajador
router.delete('/trabajadores/:id', verificarToken, (req, res) => {
    db.prepare('DELETE FROM trabajadores WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Trabajador eliminado' });
});

/* ══════════════════════════════
   RESUMEN DE NÓMINA
══════════════════════════════ */
router.get('/resumen/:empId', verificarToken, (req, res) => {
    const emp = db.prepare(
        'SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?'
    ).get(req.params.empId, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });

    const totalTrabajadores = db.prepare(
        "SELECT COUNT(*) as total FROM trabajadores WHERE emprendimiento_id = ? AND estado = 'activo'"
    ).get(req.params.empId).total;

    const nominaMensual = db.prepare(`
    SELECT COALESCE(SUM(c.salario_base), 0) as total
    FROM trabajadores t JOIN cargos c ON t.cargo_id = c.id
    WHERE t.emprendimiento_id = ? AND t.estado = 'activo'
  `).get(req.params.empId).total;

    res.json({
        total_trabajadores: totalTrabajadores,
        nomina_mensual:     parseFloat(nominaMensual.toFixed(2)),
        nomina_quincenal:   parseFloat((nominaMensual / 2).toFixed(2)),
        total_deducciones:  parseFloat((nominaMensual * 0.08).toFixed(2)),
        nomina_neta:        parseFloat((nominaMensual * 0.92).toFixed(2)),
    });
});

module.exports = router;