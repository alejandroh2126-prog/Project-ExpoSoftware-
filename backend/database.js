const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'emprendedor.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fecha_registro TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS emprendimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    sector TEXT,
    fecha_inicio TEXT,
    estado TEXT DEFAULT 'activo',
    fecha_creacion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS transacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT,
    monto REAL NOT NULL,
    fecha TEXT NOT NULL,
    fecha_creacion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id)
  );

  CREATE TABLE IF NOT EXISTS presupuestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    monto_limite REAL NOT NULL,
    mes TEXT NOT NULL,
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id)
  );
`);

module.exports = db;