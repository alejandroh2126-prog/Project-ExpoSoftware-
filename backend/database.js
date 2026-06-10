// ============================================================
// SGAPE – Conexión y configuración de la base de datos SQLite
// Autor: Alejandro Henríquez Quinchia
// Universidad Popular del Cesar · 2026
// ============================================================

'use strict';

const Database = require('better-sqlite3');
const path     = require('path');

// Abre (o crea) el archivo de base de datos en la carpeta backend/
const db = new Database(path.join(__dirname, 'emprendedor.db'));

// Activa WAL para mejor rendimiento en lecturas concurrentes
db.pragma('journal_mode = WAL');

// ── Creación de tablas si no existen ────────────────────────
db.exec(`

  -- Usuarios del sistema
  CREATE TABLE IF NOT EXISTS usuarios (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT    NOT NULL,
    email     TEXT    UNIQUE NOT NULL,
    password  TEXT    NOT NULL,
    fecha_registro TEXT DEFAULT (date('now'))
  );

  -- Emprendimientos asociados a cada usuario
  CREATE TABLE IF NOT EXISTS emprendimientos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    nombre          TEXT    NOT NULL,
    descripcion     TEXT    DEFAULT '',
    sector          TEXT    DEFAULT '',
    fecha_inicio    TEXT    DEFAULT '',
    estado          TEXT    DEFAULT 'activo',
    fecha_creacion  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  -- Cargos laborales por emprendimiento
  CREATE TABLE IF NOT EXISTS cargos (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id  INTEGER NOT NULL,
    nombre             TEXT    NOT NULL,
    salario_base       REAL    NOT NULL DEFAULT 0,
    descripcion        TEXT    DEFAULT '',
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id) ON DELETE CASCADE
  );

  -- Trabajadores por emprendimiento
  CREATE TABLE IF NOT EXISTS trabajadores (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id  INTEGER NOT NULL,
    cargo_id           INTEGER NOT NULL,
    nombre             TEXT    NOT NULL,
    apellido           TEXT    NOT NULL,
    edad               INTEGER,
    cedula             TEXT    DEFAULT '',
    fecha_ingreso      TEXT    DEFAULT '',
    estado             TEXT    DEFAULT 'activo',
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id) ON DELETE CASCADE,
    FOREIGN KEY (cargo_id)          REFERENCES cargos(id)
  );

  -- Transacciones financieras (ingresos y gastos)
  CREATE TABLE IF NOT EXISTS transacciones (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id  INTEGER NOT NULL,
    tipo               TEXT    NOT NULL CHECK(tipo IN ('ingreso','gasto')),
    categoria          TEXT    NOT NULL,
    descripcion        TEXT    DEFAULT '',
    monto              REAL    NOT NULL DEFAULT 0,
    fecha              TEXT    NOT NULL,
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id) ON DELETE CASCADE
  );

  -- Presupuestos por categoría y mes
  CREATE TABLE IF NOT EXISTS presupuestos (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    emprendimiento_id  INTEGER NOT NULL,
    categoria          TEXT    NOT NULL,
    monto_limite       REAL    NOT NULL DEFAULT 0,
    mes                TEXT    NOT NULL,
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id) ON DELETE CASCADE
  );

`);

module.exports = db;