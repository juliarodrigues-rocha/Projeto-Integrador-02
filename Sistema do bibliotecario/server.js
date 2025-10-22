import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { openDb, createTable } from './database.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

createTable();


app.post('/api/livros', async (req, res) => {
  const { codigo, titulo, autor, quantidade, categoria, editora } = req.body;

  if (!codigo || !titulo || !autor || !quantidade || !categoria || !editora) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (isNaN(codigo) || !Number.isInteger(Number(codigo))) {
    return res.status(400).json({ error: 'O código deve conter apenas números inteiros.' });
  }


  if (isNaN(quantidade) || Number(quantidade) < 1) {
    return res.status(400).json({ error: 'A quantidade deve ser um número >= 1.' });
  }

  try {
    const db = await openDb();

  
    const existing = await db.get('SELECT * FROM livros WHERE codigo = ?', [codigo]);
    if (existing) {
      return res.status(400).json({ error: 'Código já cadastrado. Informe outro.' });
    }

    await db.run(
      `INSERT INTO livros (codigo, titulo, autor, quantidade, categoria, editora)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, titulo, autor, quantidade, categoria, editora]
    );

    res.json({ message: 'Livro cadastrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar o livro.' });
  }
});


app.get('/api/livros', async (req, res) => {
  const db = await openDb();
  const livros = await db.all('SELECT * FROM livros');
  res.json(livros);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
