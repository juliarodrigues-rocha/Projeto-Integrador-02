const express = require('express');
const cors = require('cors');
const app = express();

const livrosRoutes = require('./rotas/livros');

app.use(cors());
app.use(express.json());
app.use('/api/livros', livrosRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
