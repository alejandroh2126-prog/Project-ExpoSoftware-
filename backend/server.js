const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes            = require('./routes/auth');
const emprendimientosRoutes = require('./routes/emprendimientos');
const finanzasRoutes        = require('./routes/finanzas');
const nominaRoutes          = require('./routes/nomina');



const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Sirve todos los archivos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/auth',            authRoutes);
app.use('/api/emprendimientos', emprendimientosRoutes);
app.use('/api/finanzas',        finanzasRoutes);
app.use('/api/nomina',           nominaRoutes);

// Página de inicio → landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log('✅ SGAPE corriendo en http://localhost:3000');
});