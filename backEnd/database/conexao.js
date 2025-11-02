import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Julia180882*', // Substitua pela sua senha do MySQL
  database: process.env.DB_DATABASE || 'biblioteca'
};

export async function openDb() {
  return await mysql.createConnection(dbConfig);
}

export async function createTables() {
  const db = await openDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ALUNO (
      RA VARCHAR(8) NOT NULL UNIQUE,
      NOME VARCHAR(100) NOT NULL,
      EMAIL VARCHAR UNIQUE(100) NOT NULL,
      TELEFONE UNIQUE NOT NULL VARCHAR(20),
      PONTUACAO INT DEFAULT 0,
      CLASSIFICACAO ENUM('Iniciante', 'Regular', 'Ativo', 'Extremo') DEFAULT 'Iniciante',
      PRIMARY KEY (RA)
    );
  `);


  await db.execute(`
    CREATE TABLE IF NOT EXISTS LIVRO (
      CODIGO VARCHAR(255) UNIQUE NOT NULL,
      TITULO VARCHAR(150) NOT NULL,
      AUTOR VARCHAR(100),
      QTD INT DEFAULT 1,
      CATEGORIA VARCHAR(50),
      EDITORA VARCHAR(100),
      STATUS ENUM('Disponível', 'Emprestado') DEFAULT 'Disponível'
    );
  `);

  db.end();
}
