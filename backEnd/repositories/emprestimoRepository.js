import { openDb } from '../database/conexao.js';

export class EmprestimoRepository {

  // Registrar uma nova retirada de livro
  static async registrarEmprestimo(raAluno, codigoLivro) {
    const db = await openDb();
    try {
      // Verifica aluno
      const [alunoRows] = await db.execute('SELECT * FROM ALUNOS WHERE RA = ?', [raAluno]);
      if (alunoRows.length === 0) throw new Error('Aluno não encontrado.');

      // Verifica livro
      const [livroRows] = await db.execute('SELECT * FROM LIVROS WHERE CODIGO = ?', [codigoLivro]);
      if (livroRows.length === 0) throw new Error('Livro não encontrado.');

      const livro = livroRows[0];
      if (livro.QTD <= 0) throw new Error('Livro indisponível para retirada.');

      // Data e hora
      const now = new Date();
      const dataEmprestimo = now.toISOString().slice(0, 10);
      const horaEmprestimo = now.toTimeString().slice(0, 8);

      // INSERE empréstimo
      const [insertResult] = await db.execute(
        `INSERT INTO EMPRESTIMOS (RA_ALUNO, CODIGO_LIVRO, DATA_EMPRESTIMO, HORA_EMPRESTIMO)
         VALUES (?, ?, ?, ?)`,
        [raAluno, codigoLivro, dataEmprestimo, horaEmprestimo]
      );

      // Atualiza livro
      const novaQtd = livro.QTD - 1;
      const novoStatus = novaQtd > 0 ? "Disponível" : "Emprestado";

      await db.execute(
        'UPDATE LIVROS SET QTD = ?, STATUS = ? WHERE CODIGO = ?',
        [novaQtd, novoStatus, codigoLivro]
      );

      // RETORNA as datas
      return {
        dataEmprestimo,
        horaEmprestimo
      };

    } catch (error) {
      throw error;
    } finally {
      db.end();
    }
  }

  // Registrar devolução de livro
  static async registrarDevolucao(raAluno, codigoLivro) {
    const db = await openDb();
    try {
      // Empréstimo ativo
      const [rows] = await db.execute(
        `SELECT * FROM EMPRESTIMOS
         WHERE RA_ALUNO = ? AND CODIGO_LIVRO = ? AND DATA_DEVOLUCAO IS NULL
         ORDER BY CODIGO DESC LIMIT 1`,
        [raAluno, codigoLivro]
      );

      if (rows.length === 0) throw new Error("Nenhum empréstimo ativo encontrado.");

      const emprestimo = rows[0];

      // Data e hora
      const now = new Date();
      const dataDevolucao = now.toISOString().slice(0, 10);
      const horaDevolucao = now.toTimeString().slice(0, 8);

      // Atualiza devolução
      await db.execute(
        `UPDATE EMPRESTIMOS
         SET DATA_DEVOLUCAO = ?, HORA_DEVOLUCAO = ?
         WHERE CODIGO = ?`,
        [dataDevolucao, horaDevolucao, emprestimo.CODIGO]
      );

      // Atualiza livro
      const [livroRows] = await db.execute('SELECT * FROM LIVROS WHERE CODIGO = ?', [codigoLivro]);
      const livro = livroRows[0];

      await db.execute(
        'UPDATE LIVROS SET QTD = ?, STATUS = "Disponível" WHERE CODIGO = ?',
        [livro.QTD + 1, codigoLivro]
      );

      // RETORNA as datas
      return {
        dataDevolucao,
        horaDevolucao
      };

    } catch (error) {
      throw error;
    } finally {
      db.end();
    }
  }
}