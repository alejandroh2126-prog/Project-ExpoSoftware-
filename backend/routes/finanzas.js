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

// OBTENER transacciones de un emprendimiento
router.get('/transacciones/:empId', verificarToken, (req, res) => {
    const emp = db.prepare('SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?')
        .get(req.params.empId, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });
    const lista = db.prepare('SELECT * FROM transacciones WHERE emprendimiento_id = ? ORDER BY fecha DESC')
        .all(req.params.empId);
    res.json(lista);
});

// CREAR transacción
router.post('/transacciones', verificarToken, (req, res) => {
    const { emprendimiento_id, tipo, categoria, descripcion, monto, fecha } = req.body;
    if (!emprendimiento_id || !tipo || !categoria || !monto || !fecha)
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const emp = db.prepare('SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?')
        .get(emprendimiento_id, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });
    const result = db.prepare(
        'INSERT INTO transacciones (emprendimiento_id, tipo, categoria, descripcion, monto, fecha) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(emprendimiento_id, tipo, categoria, descripcion || '', monto, fecha);
    res.json({ id: result.lastInsertRowid, mensaje: 'Transacción registrada' });
});

// ELIMINAR transacción
router.delete('/transacciones/:id', verificarToken, (req, res) => {
    db.prepare('DELETE FROM transacciones WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Eliminada correctamente' });
});

// OBTENER presupuestos
router.get('/presupuestos/:empId', verificarToken, (req, res) => {
    const lista = db.prepare('SELECT * FROM presupuestos WHERE emprendimiento_id = ?')
        .all(req.params.empId);
    res.json(lista);
});

// CREAR presupuesto
router.post('/presupuestos', verificarToken, (req, res) => {
    const { emprendimiento_id, categoria, monto_limite, mes } = req.body;
    if (!emprendimiento_id || !categoria || !monto_limite || !mes)
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const result = db.prepare(
        'INSERT INTO presupuestos (emprendimiento_id, categoria, monto_limite, mes) VALUES (?, ?, ?, ?)'
    ).run(emprendimiento_id, categoria, monto_limite, mes);
    res.json({ id: result.lastInsertRowid, mensaje: 'Presupuesto creado' });
});

// ELIMINAR presupuesto
router.delete('/presupuestos/:id', verificarToken, (req, res) => {
    db.prepare('DELETE FROM presupuestos WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Eliminado correctamente' });
});

// RESUMEN financiero
router.get('/resumen/:empId', verificarToken, (req, res) => {
    const emp = db.prepare('SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?')
        .get(req.params.empId, req.usuario.id);
    if (!emp) return res.status(403).json({ error: 'Acceso denegado' });

    const ingresos = db.prepare(
        "SELECT COALESCE(SUM(monto),0) as total FROM transacciones WHERE emprendimiento_id = ? AND tipo = 'ingreso'"
    ).get(req.params.empId).total;

    const gastos = db.prepare(
        "SELECT COALESCE(SUM(monto),0) as total FROM transacciones WHERE emprendimiento_id = ? AND tipo = 'gasto'"
    ).get(req.params.empId).total;

    const porCategoria = db.prepare(
        "SELECT categoria, SUM(monto) as total FROM transacciones WHERE emprendimiento_id = ? AND tipo = 'gasto' GROUP BY categoria"
    ).all(req.params.empId);

    res.json({
        ingresos,
        gastos,
        balance: ingresos - gastos,
        por_categoria: porCategoria
    });
});

module.exports = router;