# ❓ PERGUNTAS E RESPOSTAS PARA A BANCA

## 📋 PERGUNTAS SOBRE ROTAS

### **P1: Quando o aluno realiza seu cadastro, qual será a rota que o sistema fará? Como ele funciona?**

**Resposta**:
A rota utilizada é `POST http://localhost:3000/alunos`.

**Fluxo completo**:
1. O aluno preenche o formulário em `CadastrarAluno.html`
2. O JavaScript (`cadastroAluno.js`) captura o submit e valida os dados no frontend
3. Faz uma requisição HTTP POST para `/alunos` com os dados em JSON (RA, nome, email, telefone)
4. O backend recebe em `app.js`, que configura o Express e roteia para `routes/alunos.js`
5. A rota direciona para o controller `alunoController.js`, função `cadastrarAluno()`
6. O controller valida os dados:
   - RA: exatamente 8 dígitos numéricos
   - Nome: apenas letras, mínimo 3 caracteres
   - Email: formato válido
   - Telefone: 8-11 dígitos
7. Verifica se o aluno já existe via `AlunoRepository.buscarPorRA()`
8. Se não existir, cadastra via `AlunoRepository.cadastrar()`
9. O repository executa SQL: `INSERT INTO ALUNOS (RA, NOME, EMAIL, TELEFONE) VALUES (?, ?, ?, ?)`
10. Retorna resposta JSON com status de sucesso ou erro
11. O frontend exibe a mensagem ao usuário

---

### **P2: Como funciona a rota de retirada de livro no totem?**

**Resposta**:
A rota é `POST http://localhost:3000/api/emprestimos/retirada`.

**Fluxo**:
1. O usuário informa RA e código do livro no totem (`Retirada.html`)
2. O JavaScript (`retiradaLivro.js`) envia POST com `{ ra, codigoLivro }`
3. O controller `emprestimoController.js` valida os dados
4. O repository `emprestimoRepository.js` verifica:
   - Se o aluno existe (SELECT na tabela ALUNOS)
   - Se o livro existe (SELECT na tabela LIVROS)
   - Se há quantidade disponível (QTD > 0)
5. Se tudo estiver OK:
   - Insere registro em EMPRESTIMOS com data/hora atual
   - Decrementa a quantidade do livro (UPDATE LIVROS SET QTD = QTD - 1)
   - Atualiza o STATUS do livro se necessário
6. Retorna JSON com status, mensagem, data e hora do empréstimo
7. O frontend exibe a confirmação com data e hora formatadas

---

### **P3: Qual a diferença entre as rotas GET /api/emprestimos e GET /api/emprestimos/ativos?**

**Resposta**:
- **GET /api/emprestimos**: Retorna TODOS os empréstimos (histórico completo), incluindo os já devolvidos e os ativos
- **GET /api/emprestimos/ativos**: Retorna APENAS os empréstimos ainda não devolvidos (onde `DATA_DEVOLUCAO IS NULL`)

A diferença está no filtro SQL aplicado no repository. A rota de ativos usa `WHERE e.DATA_DEVOLUCAO IS NULL` para filtrar apenas os pendentes.

---

### **P4: Como funciona a busca de livros? Quais rotas são utilizadas?**

**Resposta**:
O sistema utiliza duas rotas diferentes dependendo do tipo de busca:

1. **Buscar todos os livros**: `GET /api/livros`
   - Retorna array com todos os livros cadastrados
   - Usado quando o campo de busca está vazio

2. **Buscar por código**: `GET /api/livros/:codigo`
   - Busca um livro específico pelo código
   - Usado quando o usuário digita um número no campo de busca

3. **Busca por título** (filtro no frontend):
   - Faz GET /api/livros para buscar todos
   - Filtra no JavaScript por título usando `.includes()`

O frontend (`ConsultarLivro.js`) detecta automaticamente se é código numérico ou texto e usa a rota apropriada.

---

### **P5: Por que não é possível deletar um livro que tem empréstimo ativo?**

**Resposta**:
É uma regra de integridade referencial do sistema. O livro não pode ser deletado se houver empréstimos ativos porque:

1. **Integridade de dados**: Se deletássemos o livro, perderíamos a referência nos empréstimos ativos
2. **Regra de negócio**: Um livro emprestado ainda está "em uso" e não pode ser removido do acervo
3. **Rastreabilidade**: Precisamos manter o histórico completo de empréstimos

**Implementação**:
- O controller `deletarLivro()` verifica via `EmprestimoRepository.buscarAtivosPorLivro()`
- Se encontrar empréstimos ativos, retorna erro 400 com mensagem explicativa
- Se não houver empréstimos ativos, permite a exclusão e também remove os empréstimos históricos relacionados

---

## 🏗️ PERGUNTAS SOBRE ARQUITETURA

### **P6: Por que o projeto está dividido em controllers, repositories e routes?**

**Resposta**:
O projeto utiliza o padrão **MVC (Model-View-Controller)** com **Repository Pattern** para:

1. **Separação de responsabilidades**:
   - **Routes**: Apenas definem as rotas HTTP e direcionam para controllers
   - **Controllers**: Contêm a lógica de negócio e validações
   - **Repositories**: Abstraem o acesso ao banco de dados

2. **Manutenibilidade**: Cada camada tem uma responsabilidade clara, facilitando manutenção

3. **Testabilidade**: Cada camada pode ser testada independentemente

4. **Reutilização**: A lógica de acesso ao banco fica centralizada no repository

**Exemplo prático**:
- Se precisarmos mudar de MySQL para PostgreSQL, só alteramos os repositories
- Se precisarmos mudar a lógica de validação, só alteramos os controllers
- Se precisarmos mudar as rotas, só alteramos o arquivo de routes

---

### **P7: O que são middlewares e qual é usado no projeto?**

**Resposta**:
Middlewares são funções que executam entre a requisição HTTP e a resposta final. No projeto, utilizamos:

1. **CORS** (`cors`): Permite que o frontend (rodando em outra origem) faça requisições ao backend
2. **Body Parser** (`body-parser`): Converte o corpo da requisição JSON em objeto JavaScript
3. **Logger** (`middlewares/logger.js`): Middleware customizado que registra todas as requisições no console, mostrando método HTTP, URL e tempo de processamento

**Fluxo**:
```
Requisição → CORS → Body Parser → Logger → Rota → Controller → Repository → Banco
```

---

### **P8: Como funciona a classificação de leitura dos alunos?**

**Resposta**:
A classificação é baseada na quantidade de livros devolvidos nos **últimos 6 meses**:

- **0-5 livros**: Leitor Iniciante
- **6-10 livros**: Leitor Regular
- **11-20 livros**: Leitor Ativo
- **21+ livros**: Leitor Extremo

**Implementação**:
1. A rota `GET /alunos/pontuacao/:ra` busca livros devolvidos nos últimos 6 meses
2. O repository executa SQL com `DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`
3. Conta apenas empréstimos onde `DATA_DEVOLUCAO IS NOT NULL`
4. Calcula a classificação baseada no total
5. Para classificação geral, faz JOIN entre ALUNOS e EMPRESTIMOS e agrupa por aluno

---

## 🗄️ PERGUNTAS SOBRE BANCO DE DADOS

### **P9: Qual a estrutura do banco de dados? Como as tabelas se relacionam?**

**Resposta**:
O banco possui 3 tabelas principais:

1. **ALUNOS**: Armazena dados dos alunos
   - Chave primária: RA (VARCHAR(8))
   - Campos: NOME, EMAIL, TELEFONE, PONTUACAO, CLASSIFICACAO

2. **LIVROS**: Armazena dados dos livros
   - Chave primária: CODIGO (VARCHAR(255))
   - Campos: TITULO, AUTOR, QTD, CATEGORIA, EDITORA, STATUS

3. **EMPRESTIMOS**: Armazena os empréstimos
   - Chave primária: CODIGO (INT AUTO_INCREMENT)
   - Chaves estrangeiras:
     - RA_ALUNO → referencia ALUNOS.RA
     - CODIGO_LIVRO → referencia LIVROS.CODIGO
   - Campos: DATA_EMPRESTIMO, HORA_EMPRESTIMO, DATA_DEVOLUCAO, HORA_DEVOLUCAO

**Relacionamento**:
- Um aluno pode ter vários empréstimos (1:N)
- Um livro pode ter vários empréstimos (1:N)
- Um empréstimo pertence a um aluno e um livro (N:1 e N:1)

---

### **P10: Como o sistema controla a quantidade de livros disponíveis?**

**Resposta**:
O controle é feito através do campo `QTD` na tabela LIVROS:

1. **Ao cadastrar**: Define a quantidade inicial
2. **Ao retirar** (`POST /api/emprestimos/retirada`):
   - Decrementa QTD: `UPDATE LIVROS SET QTD = QTD - 1`
   - Se QTD ficar 0, atualiza STATUS para "Emprestado"
3. **Ao devolver** (`POST /api/emprestimos/devolucao`):
   - Incrementa QTD: `UPDATE LIVROS SET QTD = QTD + 1`
   - Atualiza STATUS para "Disponível"

**Validação**: Antes de permitir retirada, verifica se `QTD > 0`. Se não houver exemplares disponíveis, retorna erro.

---

## 🔄 PERGUNTAS SOBRE FLUXO

### **P11: O que acontece quando um aluno tenta retirar um livro que não tem exemplares disponíveis?**

**Resposta**:
O sistema impede a retirada através de validação no repository:

1. O repository verifica se o livro existe
2. Verifica se `QTD > 0`
3. Se `QTD = 0`, lança erro: "Livro indisponível para retirada"
4. O controller captura o erro e retorna resposta HTTP 500 com mensagem de erro
5. O frontend exibe a mensagem de erro ao usuário

**Código relevante**:
```javascript
if (livro.QTD <= 0) throw new Error('Livro indisponível para retirada.');
```

---

### **P12: Como funciona a devolução de livro? O que acontece se tentar devolver um livro que não foi retirado?**

**Resposta**:
**Fluxo de devolução normal**:
1. Usuário informa RA e código do livro
2. Sistema busca empréstimo ativo (onde `DATA_DEVOLUCAO IS NULL`)
3. Atualiza `DATA_DEVOLUCAO` e `HORA_DEVOLUCAO` com data/hora atual
4. Incrementa `QTD` do livro
5. Atualiza STATUS para "Disponível"

**Se tentar devolver livro não retirado**:
- O repository não encontra empréstimo ativo
- Lança erro: "Nenhum empréstimo ativo encontrado"
- Retorna HTTP 500 com mensagem de erro
- Frontend exibe mensagem informando que não há empréstimo ativo

---

## 🎯 PERGUNTAS SOBRE VALIDAÇÕES

### **P13: Quais validações são feitas no cadastro de aluno?**

**Resposta**:
Validações no frontend E no backend:

**Frontend** (`cadastroAluno.js`):
- RA: 8 dígitos exatos
- Nome: apenas letras, mínimo 3 caracteres
- Email: formato válido
- Telefone: 8-11 dígitos

**Backend** (`alunoController.js`):
- Mesmas validações do frontend (segurança)
- Verifica se RA já existe (duplicata)
- Verifica se email já existe (único)
- Verifica se telefone já existe (único)

**Por que validar em ambos?**
- Frontend: Melhor experiência do usuário (feedback imediato)
- Backend: Segurança (não confia no frontend, pode ser burlado)

---

### **P14: Por que o RA precisa ter exatamente 8 dígitos?**

**Resposta**:
É uma regra de negócio do sistema. O RA (Registro Acadêmico) segue um padrão fixo de 8 dígitos, que é comum em instituições de ensino. A validação garante:

1. **Consistência**: Todos os RAs têm o mesmo formato
2. **Integridade**: Facilita buscas e relacionamentos
3. **Validação**: Usa regex `/^[0-9]{8}$/` para garantir formato

---

## 🛠️ PERGUNTAS TÉCNICAS

### **P15: Por que usar Express.js? Quais suas vantagens?**

**Resposta**:
Express.js é um framework minimalista para Node.js que facilita:

1. **Roteamento**: Define rotas de forma simples e organizada
2. **Middlewares**: Sistema de middlewares para processar requisições
3. **JSON**: Facilita trabalhar com JSON (muito usado em APIs REST)
4. **Performance**: Leve e rápido
5. **Ecosystem**: Grande comunidade e bibliotecas disponíveis

**No projeto**: Usado para criar a API REST que comunica frontend e backend.

---

### **P16: Por que o frontend está separado do backend?**

**Resposta**:
Separação permite:

1. **Desenvolvimento independente**: Frontend e backend podem ser desenvolvidos por equipes diferentes
2. **Escalabilidade**: Backend pode ser escalado independentemente
3. **Reutilização**: O mesmo backend pode servir múltiplos frontends (web, mobile, etc.)
4. **Tecnologias diferentes**: Frontend pode usar qualquer tecnologia (React, Vue, etc.)
5. **Deploy separado**: Podem ser hospedados em servidores diferentes

**No projeto**: Frontend é HTML/CSS/JS puro, backend é Node.js/Express.

---

## 📊 PERGUNTAS SOBRE FUNCIONALIDADES

### **P17: Como o sistema calcula a pontuação do aluno?**

**Resposta**:
A pontuação é baseada na quantidade de livros devolvidos nos últimos 6 meses:

1. Busca empréstimos onde `DATA_DEVOLUCAO IS NOT NULL`
2. Filtra pelos últimos 6 meses: `DATA_DEVOLUCAO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`
3. Conta quantos livros foram devolvidos
4. Classifica baseado na quantidade:
   - Total de livros = pontuação
   - Classificação baseada na faixa

**Nota**: O campo `PONTUACAO` na tabela ALUNOS existe mas não é atualizado automaticamente. A pontuação é calculada dinamicamente na consulta.

---

### **P18: O que acontece se tentar cadastrar um aluno com RA duplicado?**

**Resposta**:
O sistema impede o cadastro:

1. Controller verifica se aluno existe via `AlunoRepository.buscarPorRA()`
2. Se encontrar, retorna HTTP 409 (Conflict)
3. Resposta JSON: `{ status: "Aluno já cadastrado", mensagem: "Aluno com este RA já cadastrado." }`
4. Frontend exibe mensagem de erro

**Por que 409?**: É o código HTTP apropriado para conflito de recursos (recurso já existe).

---

## 🎓 DICAS PARA A APRESENTAÇÃO

1. **Demonstre o fluxo completo**: Mostre uma operação do início ao fim (ex: cadastrar aluno → retirar livro → devolver → ver pontuação)

2. **Explique a arquitetura**: Mostre como as camadas se comunicam (Routes → Controller → Repository → Banco)

3. **Destaque as validações**: Mostre que o sistema valida dados e previne erros

4. **Mostre o banco de dados**: Se possível, mostre as tabelas e relacionamentos

5. **Fale sobre segurança**: Mencione validações no frontend E backend

6. **Explique as regras de negócio**: Por que não pode deletar livro com empréstimo ativo, etc.

---

**Boa sorte na apresentação! 🚀**

