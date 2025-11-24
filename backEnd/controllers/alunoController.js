import { AlunoRepository } from '../repositories/alunoRepository.js';
import Aluno from '../models/Aluno.js';
import Comunicado from '../models/Comunicado.js';
import { openDb } from "../database/conexao.js";

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



export const VisualizarPontuacao = async (req, res) => {
  const { ra } = req.params;

  try {
    // 1) Validação do RA
    if (!ra) return res.status(400).json({ erro: true, mensagem: "O RA deve ser informado." });
    if (!/^[0-9]+$/.test(ra)) return res.status(400).json({ erro: true, mensagem: "O RA deve conter apenas números." });
    if (ra.length < 8) return res.status(400).json({ erro: true, mensagem: "O RA deve conter no mínimo 8 dígitos." });
    if (ra.length > 9) return res.status(400).json({ erro: true, mensagem: "O RA deve conter no máximo 9 dígitos." });

    // 2) Verificar se aluno existe
    const aluno = await AlunoRepository.buscarPorRA(ra);
    if (!aluno) return res.status(404).json({ erro: true, mensagem: "Aluno não encontrado." });

    // 3) Buscar livros lidos últimos 6 meses (DATA + HORA)
    const db = await openDb();

    const [linhas] = await db.execute(
      `SELECT 
          l.CODIGO AS codigo,
          l.TITULO AS titulo,

          -- junta DATA + HORA da devolução
          CONCAT(
            DATE_FORMAT(e.DATA_DEVOLUCAO, '%Y-%m-%d'),
            ' ',
            DATE_FORMAT(e.HORA_DEVOLUCAO, '%H:%i:%s')
          ) AS datahora

       FROM EMPRESTIMOS e
       JOIN LIVROS l ON l.CODIGO = e.CODIGO_LIVRO
       WHERE e.RA_ALUNO = ?
         AND e.DATA_DEVOLUCAO IS NOT NULL
         AND e.DATA_DEVOLUCAO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       ORDER BY e.DATA_DEVOLUCAO DESC`,
      [ra]
    );

    await db.end();

    // 4) Calcular classificação
    const totalLivros = linhas.length;
    let classificacao =
      totalLivros <= 5 ? "Leitor Iniciante" :
      totalLivros <= 10 ? "Leitor Regular" :
      totalLivros <= 20 ? "Leitor Ativo" :
      "Leitor Extremo";

    // 5) Retornar
    return res.status(200).json({
      erro: false,
      ra,
      totalLivros,
      classificacao,
      livros: linhas
    });

  } catch (error) {
    return res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar pontuação." });
  }
};