import { AlunoRepository } from '../repositories/alunoRepository.js'; //Classe que acessa o banco de dados (camada de persistência)
import Aluno from '../models/Aluno.js'; //Modelo/classe que representa um aluno
import Comunicado from '../models/Comunicado.js'; //Modelo para padronizar respostas de sucesso/erro
import { openDb } from "../database/conexao.js";

// LÓGICA DE NEGÓCIO 

// Exporta a função para ser usada em outros arquivos (routes)
// recebe Objeto da requisição HTTP (contém dados enviados pelo frontend)
// recebe Objeto da resposta HTTP (usado para enviar resposta ao frontend)
export const cadastrarAluno = async (req, res) => {

  // Obtém os dados enviados pelo frontend via POST
  const { ra, nome, email, telefone } = req.body; //Contém os dados JSON enviados pelo frontend

  // Encapsula os dados em um objeto tipado  
  const aluno = new Aluno(ra, nome, email, telefone); // Cria uma instância da classe `Aluno`(models) com os dados recebidos


  // VALIDAÇÕES DE SEGURANÇA 
  if (!ra || !nome || !email || !telefone) {
    return res.status(400).json(new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.'));
  }

  // Validação de formato para RA (apenas números, mínimo 5 e máximo 8 dígitos)
  if (!/^[0-9]{8}$/.test(ra)) {
    return res.status(400).json(new Comunicado('RA inválido', 'RA inválido. Deve conter exatamente 8 números.'));
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
    // BUSCA VIA REPOSITORY, POIS O REPOSITORY ACESSA O BD
    const alunoExistente = await AlunoRepository.buscarPorRA(ra);

    if (alunoExistente) {
      return res.status(409).json(new Comunicado('Aluno já cadastrado', 'Aluno com este RA já cadastrado.'));
    }

    // CADASTRA VIA REPOSITORY, POIS O REPOSITORY ACESSA O BD
    // `await`: Aguarda a resposta da consulta ao banco
    await AlunoRepository.cadastrar(aluno);
    
    res.status(201).json(new Comunicado('Sucesso', 'Aluno cadastrado com sucesso!'));
  } catch (error) {
    console.error('Erro no controller de cadastro de aluno:', error);
    console.error('Stack trace:', error.stack);
    const mensagemErro = error.message || 'Erro interno do servidor.';
    res.status(500).json(new Comunicado('Erro interno do servidor', mensagemErro));
  }
};



/* VISUALIZAR PONTUAÇÃO DO ALUNO ESPECÍFICO (últimos 6 meses) */
export const VisualizarPontuacao = async (req, res) => {
  const { ra } = req.params;
  try {
    if (!ra) return res.status(400).json({ erro: true, mensagem: "O RA deve ser informado." });
    if (!/^[0-9]{8}$/.test(ra)) {
      return res.status(400).json({ erro: true, mensagem: "O RA deve conter exatamente 8 números." });
    }
    
    // BUSCA VIA REPOSITORY
    const aluno = await AlunoRepository.buscarPorRA(ra);
    if (!aluno) return res.status(404).json({ erro: true, mensagem: "Aluno não encontrado." });

    // BUSCA VIA REPOSITORY
    const livros = await AlunoRepository.buscarLivrosUltimos6Meses(ra);

    const totalLivros = livros.length;
    const classificacao =
      totalLivros <= 5 ? "Leitor Iniciante" :
      totalLivros <= 10 ? "Leitor Regular" :
      totalLivros <= 20 ? "Leitor Ativo" :
      "Leitor Extremo";

    return res.status(200).json({
      erro: false,
      ra,
      totalLivros,
      classificacao,
      livros
    });

  } catch (error) {
    return res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar pontuação." });
  }
};



/* CLASSIFICAÇÃO GERAL -> Trabalha com entidade ALUNO, por isso está aqui, back organizado em entidade de negócio m */
export const ClassificacaoGeral = async (_req, res) => {
  try {
    // busca no repository
    const linhas = await AlunoRepository.buscarClassificacaoGeral();

    const ranking = linhas.map((linha) => {
      const total = Number(linha.totalLivros) || 0;
      const classificacao =
        total <= 5 ? "Leitor Iniciante" :
        total <= 10 ? "Leitor Regular" :
        total <= 20 ? "Leitor Ativo" :
        "Leitor Extremo";

      return {
        ra: linha.ra,
        nome: linha.nome,
        totalLivros: total,
        classificacao,
      };
    });

    const resumo = {
      iniciantes: 0,
      regulares: 0,
      ativos: 0,
      extremos: 0,
    };

    for (const aluno of ranking) {
      switch (aluno.classificacao) {
        case "Leitor Iniciante": resumo.iniciantes++; break;
        case "Leitor Regular": resumo.regulares++; break;
        case "Leitor Ativo": resumo.ativos++; break;
        case "Leitor Extremo": resumo.extremos++; break;
      }
    }

    return res.status(200).json({
      erro: false,
      totalAlunos: ranking.length,
      resumo,
      ranking,
    });

  } catch (error) {
    return res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar classificação geral." });
  }
};
