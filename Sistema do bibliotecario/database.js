import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export async function openDb() {
  return open({
    filename: './livros.db',
    driver: sqlite3.Database
  });
}


export async function createTable() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      quantidade INTEGER NOT NULL CHECK (quantidade >= 1),
      categoria TEXT NOT NULL,
      editora TEXT NOT NULL
    );
  `);
}
