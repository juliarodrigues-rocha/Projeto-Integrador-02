import { AlunoRepository } from '../repositories/alunoRepository.js';
import Aluno from '../models/Aluno.js';
import Comunicado from '../models/Comunicado.js';

export const cadastrarAluno = async (req, res) => {
  const { ra, nome, email, telefone } = req.body;

  const aluno = new Aluno(ra, nome, email, telefone);

  if (!ra || !nome || !email || !telefone) {
    return res.status(400).json(new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.'));
  }

  // Validação de formato para RA (apenas números, mínimo 5 e máximo 8 dígitos)
  if (!/^[0-9]{5,8}$/.test(ra)) {
    return res.status(400).json(new Comunicado('RA inválido', 'RA inválido. Deve conter apenas números, mínimo 5 e máximo 8 caracteres.'));
  }

  // Validação de formato para Nome (apenas letras e espaços, mínimo 3 letras)
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(nome)) {
    return res.status(400).json(new Comunicado('Nome inválido', 'O nome digitado é inválido. O nome deve conter apenas letras.'));
  }

  // Validação de formato para Email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json(new Comunicado('Email inválido', 'Email inválido.'));
  }

  // Validação de formato para Telefone (apenas números, mínimo 8 e máximo 11 dígitos)
  if (!/^[0-9]{8,11}$/.test(telefone)) {
    return res.status(400).json(new Comunicado('Telefone inválido', 'Telefone inválido. Deve conter apenas números, mínimo 8 e máximo 11 números.'));
  }

  try {
    const alunoExistente = await AlunoRepository.buscarPorRA(ra);
    if (alunoExistente) {
      return res.status(409).json(new Comunicado('Aluno já cadastrado', 'Aluno com este RA já cadastrado.'));
    }

    await AlunoRepository.cadastrar(aluno);
    res.status(201).json(new Comunicado('Sucesso', 'Aluno cadastrado com sucesso!'));
  } catch (error) {
    console.error('Erro no controller de cadastro de aluno:', error);
    console.error('Stack trace:', error.stack);
    const mensagemErro = error.message || 'Erro interno do servidor.';
    res.status(500).json(new Comunicado('Erro interno do servidor', mensagemErro));
  }
};
