import { LivroRepository } from '../repositories/livroRepository.js';
import Livro from '../models/Livro.js';
import Comunicado from '../models/Comunicado.js';



//   CADASTRAR LIVRO

export const cadastrarLivro = async (req, res) => {
  try {
    const { codigo, titulo, autor, quantidade, categoria, editora } = req.body;

    if (!codigo || !titulo || !autor || !quantidade || !categoria || !editora) {
      return res.status(400)
        .json(new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.'));
    }

    if (isNaN(codigo) || !Number.isInteger(Number(codigo))) {
      return res.status(400)
        .json(new Comunicado('Código inválido', 'O código deve conter apenas números inteiros.'));
    }

    if (isNaN(quantidade) || Number(quantidade) < 1) {
      return res.status(400)
        .json(new Comunicado('Quantidade inválida', 'A quantidade deve ser um número >= 1.'));
    }

    const soLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!soLetras.test(titulo)) {
      return res.status(400)
        .json(new Comunicado('Título inválido', 'O título deve conter apenas letras e espaços.'));
    }

    if (!soLetras.test(autor)) {
      return res.status(400)
        .json(new Comunicado('Autor inválido', 'O nome do autor deve conter apenas letras e espaços.'));
    }

    if (!soLetras.test(categoria)) {
      return res.status(400)
        .json(new Comunicado('Categoria inválida', 'A categoria deve conter apenas letras e espaços.'));
    }

    if (!soLetras.test(editora)) {
      return res.status(400)
        .json(new Comunicado('Editora inválida', 'A editora deve conter apenas letras e espaços.'));
    }

    const livroExistente = await LivroRepository.buscarPorCodigo(codigo);

    if (livroExistente) {
      return res.status(409)
        .json(new Comunicado('Livro já cadastrado', 'Código já cadastrado. Informe outro.'));
    }

    const livro = new Livro(codigo, titulo, autor, quantidade, categoria, editora);
    await LivroRepository.cadastrar(livro);

    return res.status(201)
      .json(new Comunicado('Sucesso', 'Livro cadastrado com sucesso!'));

  } catch (error) {
    console.error('Erro no controller de cadastro de livro:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};



//   BUSCAR TODOS OS LIVROS

export const getLivros = async (req, res) => {
  try {
    const livros = await LivroRepository.buscarTodos();
    return res.status(200).json(livros);

  } catch (error) {
    console.error('Erro ao obter livros:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};



//   BUSCAR LIVRO POR CÓDIGO

export const getLivroPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const livro = await LivroRepository.buscarPorCodigo(codigo);

    if (!livro) {
      return res.status(404)
        .json(new Comunicado('Livro não encontrado', 'Nenhum livro com este código.'));
    }

    return res.status(200).json(livro);

  } catch (error) {
    console.error('Erro ao buscar livro por código:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};
