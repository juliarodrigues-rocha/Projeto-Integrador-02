# 🚀 RESUMO RÁPIDO - ROTAS DO SISTEMA

## 📍 BASE URL
```
http://localhost:3000
```

---

## 👤 MÓDULO ALUNO (Sistema do Aluno)

### Cadastrar Aluno
```
POST /alunos
Body: { ra, nome, email, telefone }
```

### Ver Pontuação (própria pontuação)
```
GET /alunos/pontuacao/:ra
Exemplo: GET /alunos/pontuacao/12345678
```

### Consultar Livros
```
GET /api/livros              → Listar todos
GET /api/livros/:codigo      → Buscar por código
```

---

## 📚 MÓDULO BIBLIOTECÁRIO (Sistema do Bibliotecário)

### Classificação Geral (ranking de todos)
```
GET /alunos/classificacao-geral
```

---

### Gerenciar Livros
```
POST /api/livros              → Cadastrar livro
GET /api/livros               → Listar todos
GET /api/livros/:codigo       → Buscar por código
PUT /api/livros/:codigo       → Atualizar livro
DELETE /api/livros/:codigo    → Deletar livro
```

---

## 📚 MÓDULO LIVROS (Compartilhado)

### Cadastrar Livro
```
POST /api/livros
Body: { codigo, titulo, autor, quantidade, categoria, editora }
```

### Listar Todos
```
GET /api/livros
```

### Buscar por Código
```
GET /api/livros/:codigo
Exemplo: GET /api/livros/001
```

### Atualizar
```
PUT /api/livros/:codigo
Body: { titulo, autor, quantidade, categoria, editora }
```

### Deletar
```
DELETE /api/livros/:codigo
```

---

## 🔄 MÓDULO TOTEM (Autoatendimento)

### Retirar Livro
```
POST /api/emprestimos/retirada
Body: { ra, codigoLivro }
```

### Devolver Livro
```
POST /api/emprestimos/devolucao
Body: { ra, codigoLivro }
```

---

## 📊 MÓDULO EMPRÉSTIMOS (Sistema do Bibliotecário)

### Listar Todos
```
GET /api/emprestimos
```

### Listar Ativos
```
GET /api/emprestimos/ativos
```

### Ativos por Aluno
```
GET /api/emprestimos/ativos/aluno/:ra
```

---

## 🔄 FLUXO SIMPLES: CADASTRO DE ALUNO

```
1. HTML (CadastrarAluno.html)
   ↓
2. JS (cadastroAluno.js) → POST /alunos
   ↓
3. app.js (rota /alunos)
   ↓
4. routes/alunos.js
   ↓
5. controllers/alunoController.js
   ↓
6. repositories/alunoRepository.js
   ↓
7. MySQL (INSERT INTO ALUNOS)
   ↓
8. Resposta JSON → Frontend
```

---

## 🗂️ ESTRUTURA DE PASTAS

```
backEnd/
├── server.js          → Inicia servidor
├── app.js             → Configura Express + rotas
├── controllers/       → Lógica de negócio
├── repositories/      → Acesso ao banco
├── routes/           → Definição das rotas
├── models/           → Classes de dados
└── database/         → Conexão MySQL

frontEnd/
├── aluno/            → Sistema do aluno
├── bibliotecario/    → Sistema do bibliotecário
└── totem/            → Totem autoatendimento
```

---

## 🗄️ TABELAS DO BANCO

1. **ALUNOS** → RA, NOME, EMAIL, TELEFONE, PONTUACAO, CLASSIFICACAO
2. **LIVROS** → CODIGO, TITULO, AUTOR, QTD, CATEGORIA, EDITORA, STATUS
3. **EMPRESTIMOS** → CODIGO, RA_ALUNO, CODIGO_LIVRO, DATA_EMPRESTIMO, HORA_EMPRESTIMO, DATA_DEVOLUCAO, HORA_DEVOLUCAO

---

## ⚡ VALIDAÇÕES IMPORTANTES

- **RA**: 8 dígitos exatos
- **Nome**: Apenas letras, mínimo 3 caracteres
- **Email**: Formato válido, único
- **Telefone**: 8-11 dígitos, único
- **Livro**: Não pode deletar se tiver empréstimo ativo
- **Empréstimo**: Verifica se livro está disponível (QTD > 0)

---

## 🎯 CLASSIFICAÇÃO DE LEITURA

- 0-5 livros → **Leitor Iniciante**
- 6-10 livros → **Leitor Regular**
- 11-20 livros → **Leitor Ativo**
- 21+ livros → **Leitor Extremo**

*Baseado nos últimos 6 meses*

