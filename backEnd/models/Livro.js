import { openDb } from '../database/conexao.js';

export class Livro {
  static async cadastrar(codigo, titulo, autor, quantidade, categoria, editora) {
    const db = await openDb();
    try {
      const [result] = await db.execute(
        'INSERT INTO LIVRO (CODIGO, TITULO, AUTOR, QTD, CATEGORIA, EDITORA) VALUES (?, ?, ?, ?, ?, ?)',
        [codigo, titulo, autor, quantidade, categoria, editora]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      throw error;
    } finally {
      db.end();
    }
  }

  static async buscarTodos() {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVRO');
      return rows;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    } finally {
      db.end();
    }
  }

  static async buscarPorCodigo(codigo) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVRO WHERE CODIGO = ?', [codigo]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar livro por código:', error);
      throw error;
    } finally {
      db.end();
    }
  }

  // Adicionar métodos para empréstimo e devolução, se necessário
}
