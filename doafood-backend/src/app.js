const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const pontosColetaRoutes = require('./routes/pontosColetaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', catalogoRoutes);
app.use('/api/pontos-coleta', pontosColetaRoutes);

module.exports = app;
