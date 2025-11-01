import { openDb } from '../database/conexao.js';

export class Aluno {
  static async cadastrar(ra, nome, email, telefone) {
    const db = await openDb();
    try {
      const [result] = await db.execute(
        'INSERT INTO ALUNO (RA, NOME, EMAIL, TELEFONE) VALUES (?, ?, ?, ?)',
        [ra, nome, email, telefone]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      throw error;
    } finally {
      db.end();
    }
  }

  static async buscarPorRA(ra) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM ALUNO WHERE RA = ?', [ra]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar aluno por RA:', error);
      throw error;
    } finally {
      db.end();
    }
  }
}
