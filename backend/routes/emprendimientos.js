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

// OBTENER todos los emprendimientos del usuario
router.get('/', verificarToken, (req, res) => {
    const lista = db.prepare('SELECT * FROM emprendimientos WHERE usuario_id = ? ORDER BY fecha_creacion DESC')
        .all(req.usuario.id);
    res.json(lista);
});

// CREAR emprendimiento
router.post('/', verificarToken, (req, res) => {
    const { nombre, descripcion, sector, fecha_inicio } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const result = db.prepare(
        'INSERT INTO emprendimientos (usuario_id, nombre, descripcion, sector, fecha_inicio) VALUES (?, ?, ?, ?, ?)'
    ).run(req.usuario.id, nombre, descripcion || '', sector || '', fecha_inicio || '');
    const nuevo = db.prepare('SELECT * FROM emprendimientos WHERE id = ?').get(result.lastInsertRowid);
    res.json(nuevo);
});

// ACTUALIZAR emprendimiento
router.put('/:id', verificarToken, (req, res) => {
    const { nombre, descripcion, sector, fecha_inicio, estado } = req.body;
    const emp = db.prepare('SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?')
        .get(req.params.id, req.usuario.id);
    if (!emp) return res.status(404).json({ error: 'No encontrado' });
    db.prepare(
        'UPDATE emprendimientos SET nombre=?, descripcion=?, sector=?, fecha_inicio=?, estado=? WHERE id=?'
    ).run(nombre || emp.nombre, descripcion ?? emp.descripcion,
        sector ?? emp.sector, fecha_inicio ?? emp.fecha_inicio,
        estado ?? emp.estado, req.params.id);
    res.json({ mensaje: 'Actualizado correctamente' });
});

// ELIMINAR emprendimiento
router.delete('/:id', verificarToken, (req, res) => {
    const emp = db.prepare('SELECT * FROM emprendimientos WHERE id = ? AND usuario_id = ?')
        .get(req.params.id, req.usuario.id);
    if (!emp) return res.status(404).json({ error: 'No encontrado' });
    db.prepare('DELETE FROM transacciones WHERE emprendimiento_id = ?').run(req.params.id);
    db.prepare('DELETE FROM presupuestos   WHERE emprendimiento_id = ?').run(req.params.id);
    db.prepare('DELETE FROM emprendimientos WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Eliminado correctamente' });
});

module.exports = router;