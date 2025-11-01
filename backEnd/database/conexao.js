import mysql from 'mysql2/promise';

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Julia180882*', // Substitua pela sua senha do MySQL
  database: 'biblioteca'
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
      EMAIL VARCHAR(100),
      TELEFONE VARCHAR(20),
      PONTUACAO INT DEFAULT 0,
      CLASSIFICACAO ENUM('Iniciante', 'Regular', 'Ativo', 'Extremo') DEFAULT 'Iniciante',
      PRIMARY KEY (RA)
    );
  `);


  await db.execute(`
    CREATE TABLE IF NOT EXISTS LIVRO (
      ID_LIVRO INT AUTO_INCREMENT PRIMARY KEY,
      CODIGO VARCHAR(255) UNIQUE NOT NULL,
      TITULO VARCHAR(150) NOT NULL,
      AUTOR VARCHAR(100),
      QTD INT DEFAULT 1,
      CATEGORIA VARCHAR(50),
      EDITORA VARCHAR(100),
      STATUS ENUM('Disponível', 'Emprestado') DEFAULT 'Disponível'
    );
  `);


  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS EMPRESTIMO (
        ID_EMPRESTIMO INT AUTO_INCREMENT PRIMARY KEY,
        RA_ALUNO VARCHAR(8) NOT NULL,
        ID_LIVRO INT NOT NULL,
        DATA_RETIRADA DATETIME DEFAULT CURRENT_TIMESTAMP,
        DATA_DEVOLUCAO DATETIME DEFAULT NULL,
        status ENUM('Em andamento', 'Devolvido') DEFAULT 'Em andamento',
        SEMESTRE VARCHAR(10),
        CONSTRAINT FK_ALUNO FOREIGN KEY (RA_ALUNO) REFERENCES ALUNO(RA)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_LIVRO FOREIGN KEY (ID_LIVRO) REFERENCES LIVRO(ID_LIVRO)
            ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  db.end();
}
