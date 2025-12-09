// Aguarda o HTML carregar completamente antes de executar o código
document.addEventListener("DOMContentLoaded", function () 
{
  // Obtém referência ao formulário HTML pelo ID "formCadastro"
  const form = document.getElementById("formCadastro");
  //  Obtém referência ao elemento que exibirá mensagens (ID "mensagem")
  const msg = document.getElementById("mensagem");
  // Garantem que o JavaScript só execute quando os elementos HTML estiverem prontos, evitando erros.


  function mostrarMensagem(texto, cor) {
    msg.innerText = texto;
    msg.style.color = cor;
  }

  // VALIDAÇÕES   
  function validarRA(ra) {
    return /^[0-9]{8}$/.test(ra);
  }

  function validarNome(nome) {
    // Maiúsculas e minúsculas, caracteres acentuados, espaços em branco, mínimo de 3 caracteres, sem máximo )
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(nome);
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarTelefone(tel) {
    return /^[0-9]{8,11}$/.test(tel);
  }


  // Função executada quando o usuário submete o formulário 
  // Escuta o evento de submissão do formulário e usa `await` para requisições assíncronas
  form.addEventListener("submit", async function (e) { 
    e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

    // trim() - Remove espaços em branco no início e fim
    const ra = document.getElementById("ra").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("tel").value.trim();

    // Verifica se todos os campos estão em branco
    if (!ra && !nome && !email && !telefone) {
      mostrarMensagem("Todos os campos estão em branco, por favor, preencha para realizar o cadastro.", "red");
      return;
    }

    // Valida usando as funções criadas anteriormente
    if (!validarRA(ra))
      return mostrarMensagem("RA inválido. Deve conter 8 números.", "red");
    if (!validarNome(nome))
      return mostrarMensagem("Nome inválido. Deve conter apenas letras.", "red");
    if (!validarEmail(email))
      return mostrarMensagem("Email inválido.", "red");
    if (!validarTelefone(telefone))
      return mostrarMensagem("Telefone inválido. Deve conter apenas números, mínimo 8 e máximo 11 números.", "red");


    // `fetch()`: Faz requisição HTTP assíncrona 
    try {
      const resposta = await fetch("http://localhost:3000/alunos", { // URL do backend (rota POST /alunos)
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Define que estamos enviando JSON
        body: JSON.stringify({ ra, nome, email, telefone }), // Converte objeto JavaScript em JSON e envia
      });

      if (!resposta.ok) {
        const erroData = await resposta.json(); // Converte resposta JSON em objeto
        mostrarMensagem(erroData.mensagem || erroData.message || `Erro do servidor: ${resposta.status}`, "red");
        return;
      }

      mostrarMensagem("Cadastro realizado com sucesso!", "green");
      form.reset(); //Limpa todos os campos do formulário
    } catch (erro) { //Captura erros que não são respostas HTTP (ex: servidor offline, erro de rede)
      mostrarMensagem("Erro ao conectar ao servidor. Tente novamente mais tarde.", "red");
    }
  });
});
