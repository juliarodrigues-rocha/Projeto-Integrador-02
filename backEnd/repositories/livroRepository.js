import { openDb } from '../database/conexao.js';

export class LivroRepository {
  
  static async cadastrar(livro) {
    const db = await openDb();
    try {
      const [result] = await db.execute(
        'INSERT INTO LIVROS (CODIGO, TITULO, AUTOR, QTD, CATEGORIA, EDITORA) VALUES (?, ?, ?, ?, ?, ?)',
        [livro.codigo, livro.titulo, livro.autor, livro.quantidade, livro.categoria, livro.editora]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async buscarTodos() {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVROS');
      return rows;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async buscarPorCodigo(codigo) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVROS WHERE CODIGO = ?', [codigo]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar livro por código:', error);
      throw error;
    } finally {
      await db.end();
    }
  }
}
