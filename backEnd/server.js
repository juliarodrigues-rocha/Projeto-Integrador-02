import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createTables } from './database/conexao.js';

// Importar rotas
import alunoRoutes from './routes/alunos.js';
import livroRoutes from './routes/livros.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Usar rotas
app.use('/alunos', alunoRoutes);
app.use('/api/livros', livroRoutes);

// Inicia o servidor e cria as tabelas no banco de dados
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await createTables();
  console.log('Tabelas verificadas/criadas no banco de dados.');
});
