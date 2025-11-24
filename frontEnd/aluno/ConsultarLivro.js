document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const busca = document.getElementById("buscarLivro").value.trim();
  const tbody = document.querySelector("tbody");
  const mensagem = document.getElementById("mensagem");

  // Limpa tabela e mensagem
  tbody.innerHTML = "";
  mensagem.textContent = "";

 
  if (busca === "") {
    mensagem.textContent = "Digite um código ou título para buscar.";
    mensagem.style.color = "red";
    return;
  }

  let livros = [];

  // Se for código numérico
  if (!isNaN(busca)) {
    const response = await fetch(`http://localhost:3000/api/livros/${busca}`);
      
    if (response.ok) {
      const livro = await response.json();
      livros = [livro];
    }

  } else {
    // Busca todos e filtra por título
    const response = await fetch("http://localhost:3000/api/livros");
    const todos = await response.json();

    livros = todos.filter(l =>
      l.TITULO.toLowerCase().includes(busca.toLowerCase())
    );
  }

  // Nenhum livro encontrado
  if (livros.length === 0) {
    mensagem.textContent = "Nenhum livro encontrado.";
    mensagem.style.color = "red";
    return;
  }

  // Preenche tabela
  livros.forEach(livro => {
    const status = livro.QTD > 0 ? "Disponível" : "Emprestado";
    const classe = livro.QTD > 0 ? "disponivel" : "emprestado";

    tbody.innerHTML += `
      <tr>
        <td>${livro.CODIGO}</td>
        <td>${livro.TITULO}</td>
        <td>${livro.QTD}</td>
        <td class="${classe}">${status}</td>
      </tr>
    `;
  });
});
