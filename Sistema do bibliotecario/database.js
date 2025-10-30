import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'YOUR_MYSQL_HOST',
  user: 'YOUR_MYSQL_USER',
  password: 'YOUR_MYSQL_PASSWORD',
  database: 'YOUR_MYSQL_DATABASE'
};

export async function openDb() {
  return await mysql.createConnection(dbConfig);
}

export async function createTable() {
  const db = await openDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS livros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(255) UNIQUE NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      autor VARCHAR(255) NOT NULL,
      quantidade INT NOT NULL DEFAULT 1,
      categoria VARCHAR(255) NOT NULL,
      editora VARCHAR(255) NOT NULL
    );
  `);
  db.end(); // Fechar a conexão após a criação da tabela
}
