import { LivroRepository } from '../repositories/livroRepository.js';
import Livro from '../models/Livro.js';
import Comunicado from '../models/Comunicado.js';

export const cadastrarLivro = async (req, res) => {
  const { codigo, titulo, autor, quantidade, categoria, editora } = req.body;

  const livro = new Livro(codigo, titulo, autor, quantidade, categoria, editora);

  if (!codigo || !titulo || !autor || !quantidade || !categoria || !editora) {
    return res.status(400).json(new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.'));
  }

  if (isNaN(codigo) || !Number.isInteger(Number(codigo))) {
    return res.status(400).json(new Comunicado('Código inválido', 'O código deve conter apenas números inteiros.'));
  }

  if (isNaN(quantidade) || Number(quantidade) < 1) {
    return res.status(400).json(new Comunicado('Quantidade inválida', 'A quantidade deve ser um número >= 1.'));
  }

  // Validações para campos de texto
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(titulo)) {
    return res.status(400).json(new Comunicado('Título inválido', 'O título deve conter apenas letras e espaços.'));
  }
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(autor)) {
    return res.status(400).json(new Comunicado('Autor inválido', 'O nome do autor deve conter apenas letras e espaços.'));
  }
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(categoria)) {
    return res.status(400).json(new Comunicado('Categoria inválida', 'A categoria deve conter apenas letras e espaços.'));
  }
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(editora)) {
    return res.status(400).json(new Comunicado('Editora inválida', 'A editora deve conter apenas letras e espaços.'));
  }

  try {
    const livroExistente = await LivroRepository.buscarPorCodigo(codigo);
    if (livroExistente) {
      return res.status(409).json(new Comunicado('Livro já cadastrado', 'Código já cadastrado. Informe outro.'));
    }

    await LivroRepository.cadastrar(livro);
    res.status(201).json(new Comunicado('Sucesso', 'Livro cadastrado com sucesso!'));
  } catch (error) {
    console.error('Erro no controller de cadastro de livro:', error);
    res.status(500).json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};

export const getLivros = async (req, res) => {
  try {
    const livros = await LivroRepository.buscarTodos();
    res.status(200).json(livros);
  } catch (error) {
    console.error('Erro no controller de obter livros:', error);
    res.status(500).json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};
