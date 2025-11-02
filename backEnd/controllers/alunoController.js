import { Aluno } from '../repositories/alunoRepository.js';

export const cadastrarAluno = async (req, res) => {
  const { ra, nome, email, telefone } = req.body;

  if (!ra || !nome || !email || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  // Validação de formato para RA (apenas números e mínimo 5 dígitos)
  if (!/^[0-9]{5,}$/.test(ra)) {
    return res.status(400).json({ message: 'RA inválido. Deve conter apenas números de no mínimo 5 dígitos.' });
  }

  // Validação de formato para Nome (apenas letras e espaços, mínimo 3 letras)
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{10,}$/.test(nome)) {
    return res.status(400).json({ message: 'O nome digitado é inválido. O nome deve conter apenas letras.' });
  }

  // Validação de formato para Email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  // Validação de formato para Telefone (apenas números e mínimo 8 dígitos)
  if (!/^[0-9]{8,}$/.test(telefone)) {
    return res.status(400).json({ message: 'Telefone inválido. Deve conter apenas números e mínimo 8 dígitos.' });
  }

  try {
    const alunoExistente = await Aluno.buscarPorRA(ra);
    if (alunoExistente) {
      return res.status(409).json({ message: 'Aluno com este RA já cadastrado.' });
    }

    await Aluno.cadastrar(ra, nome, email, telefone);
    res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro no controller de cadastro de aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
