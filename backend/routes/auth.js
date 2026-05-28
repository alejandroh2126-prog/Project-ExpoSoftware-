const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../database');

const router     = express.Router();
const SECRET_KEY = 'clave_secreta_poo_2024';

// REGISTRO
router.post('/registro', (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password)
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    if (password.length < 6)
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    try {
        const hash    = bcrypt.hashSync(password, 10);
        const stmt    = db.prepare('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)');
        const result  = stmt.run(nombre, email, hash);
        const token   = jwt.sign({ id: result.lastInsertRowid, nombre, email }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, usuario: { id: result.lastInsertRowid, nombre, email } });
    } catch (e) {
        if (e.message.includes('UNIQUE'))
            return res.status(400).json({ error: 'Este correo ya está registrado' });
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario)
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const valido = bcrypt.compareSync(password, usuario.password);
    if (!valido)
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
});

module.exports = router;