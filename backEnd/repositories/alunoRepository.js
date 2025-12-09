import { openDb } from '../database/conexao.js';

// ACESSO AO BANCO DE DADOS
export class AlunoRepository {
  
  // CADASTRO DE ALUNO
  static async cadastrar(aluno) {
    const db = await openDb();
    try {
      // Toda operação no MySQL retorna um array com informações da execução (resultados ou status)
      // [result] contém informações sobre o status da execução (insertId, affectedRows, etc.)
      const [result] = await db.execute(
        'INSERT INTO ALUNOS (RA, NOME, EMAIL, TELEFONE) VALUES (?, ?, ?, ?)',
        [aluno.ra, aluno.nome, aluno.email, aluno.telefone]
      );
      return result.affectedRows > 0; // Se houver linhas afetadas, então o INSERT deu certo
    } finally {
      await db.end();
    }
  }

  static async buscarPorRA(ra) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM ALUNOS WHERE RA = ?', [ra]);
      return rows[0];
    } finally {
      await db.end();
    }
  }

  // CONSULTAR LIVROS 
  static async buscarPontuacaoUltimos6Meses(ra) {
    const db = await openDb();
    try {
      const [linhas] = await db.execute(
        `SELECT 
          l.CODIGO AS codigo,
          l.TITULO AS titulo,
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
      return linhas;
    } finally {
      await db.end();
    }
  }

  //ATUALIZAR tabela ALUNOS
  static async atualizarPontuacaoEClassificacao(ra, pontuacao, classificacao) {
  const db = await openDb();
  try {
    const [resultado] = await db.execute(
      `UPDATE ALUNOS
       SET PONTUACAO = ?, CLASSIFICACAO = ?
       WHERE RA = ?`,
      [pontuacao, classificacao, ra]
    );
    return resultado.affectedRows; // retorna quantas linhas foram atualizadas
  } finally {
    await db.end();
  }
}

  // VISUALIZAR PONTUAÇÃO 
  static async buscarClassificacaoGeral() {
    const db = await openDb();
    try {
      const [linhas] = await db.execute(
        `SELECT 
           a.RA   AS ra,
           a.NOME AS nome,
           SUM(
             CASE 
               WHEN e.DATA_DEVOLUCAO IS NOT NULL
                AND e.DATA_DEVOLUCAO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
               THEN 1 
               ELSE 0 
             END
           ) AS totalLivros
         FROM ALUNOS a
         LEFT JOIN EMPRESTIMOS e ON e.RA_ALUNO = a.RA
         GROUP BY a.RA, a.NOME
         ORDER BY totalLivros DESC, a.NOME ASC`
      );
      return linhas;
    } finally {
      await db.end();
    }
  }
}

