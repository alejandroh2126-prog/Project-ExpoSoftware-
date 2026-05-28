const express    = require('express');
const cors       = require('cors');
const path       = require('path');

const authRoutes            = require('./routes/auth');
const emprendimientosRoutes = require('./routes/emprendimientos');
const finanzasRoutes        = require('./routes/finanzas');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Sirve los archivos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas del API
app.use('/api/auth',             authRoutes);
app.use('/api/emprendimientos',  emprendimientosRoutes);
app.use('/api/finanzas',         finanzasRoutes);

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login.html'))
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});