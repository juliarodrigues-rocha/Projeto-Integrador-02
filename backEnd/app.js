import express from 'express';
import cors from 'cors';
import logger from './middlewares/logger.js';
import bodyParser from 'body-parser';


// Rotas principais importadas
import alunoRoutes from './routes/alunos.js';
import livroRoutes from './routes/livros.js';
import emprestimoRoutes from './routes/emprestimo.js';

// Configura Express 
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(logger);

// Usa rotas
app.use('/alunos', alunoRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/emprestimos', emprestimoRoutes);

export default app;

