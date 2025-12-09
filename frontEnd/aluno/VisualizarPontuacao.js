//A msg é escondida por padrão, mas quando precisa ser mostrada, remove a class "hidden"
function showMessage(msg) {
  document.getElementById("msgText").innerText = msg;
  document.getElementById("msgBox").classList.remove("hidden");
}

//"Esconde" A mensagem quando clica em "ok"
document.getElementById("msgClose").addEventListener("click", () => {
  document.getElementById("msgBox").classList.add("hidden");
});

document.getElementById("buscar").addEventListener("click", async () => {
  const ra = document.getElementById("ra").value.trim();

  if (!ra) return showMessage("Digite seu RA.");
  if (!/^[0-9]+$/.test(ra)) {
    return showMessage("RA deve conter apenas números.");
  }

  if (!/^\d{8}$/.test(ra)) {
      return showMessage("RA deve ter exatamente 8 dígitos.");
  }


  try {

    // Requisição GET para Routes 
    const response = await fetch(`http://localhost:3000/alunos/pontuacao/${ra}`);
    const data = await response.json();

    if (!response.ok || data.erro) return showMessage(data.mensagem || "Erro ao buscar pontuação.");

    //Recebemos a resposta do JSON e pegamos o totalLivros e classificação e preenche os campos HTML pelo ID
    document.getElementById("Livroslidos").value = data.totalLivros;
    document.getElementById("classif").value = data.classificacao;

    const tbody = document.querySelector("tbody"); // querySelector("tbody") -> encontra o corpo da tabela.
    tbody.innerHTML = ""; // tbody.innerHTML = "" limpa o que havia antes

    if (data.livros.length === 0) { //Caso não tenha sido retornado nenhum livro
      tbody.innerHTML = `<tr><td colspan="3">Nenhum livro lido.</td></tr>`;
      return;
    }

    data.livros.forEach(livro => { //forEach cria <tr>(linhas) para cada livro
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${livro.codigo}</td>
        <td>${livro.titulo}</td>
        <td>${livro.datahora}</td>
      `;
      tbody.appendChild(tr); //appendChild coloca cada linha de livro na tabela
    });

  } catch (err) {
    return showMessage("Erro ao conectar com o servidor.");
  }
});
// JS preencheu dinamicamente o HTML
