import { Livro } from '../models/Livro.js';

export const cadastrarLivro = async (req, res) => {
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
    const livroExistente = await Livro.buscarPorCodigo(codigo);
    if (livroExistente) {
      return res.status(409).json({ error: 'Código já cadastrado. Informe outro.' });
    }

    await Livro.cadastrar(codigo, titulo, autor, quantidade, categoria, editora);
    res.status(201).json({ message: 'Livro cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro no controller de cadastro de livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getLivros = async (req, res) => {
  try {
    const livros = await Livro.buscarTodos();
    res.status(200).json(livros);
  } catch (error) {
    console.error('Erro no controller de obter livros:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
