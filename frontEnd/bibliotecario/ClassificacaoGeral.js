//Receberá a lista de alunos completa do back
//Variável global para que outras funções acessem ela
let rankingGeral = [];

//Renderiza as linhas da tabela de acordo com a lista informada
function renderizarTabela(lista) {
  //Vai buscar um <tbody> dentro da tabela que tem a classe .tabelaRanking
  const tbody = document.querySelector('.tabelaRanking tbody');
  //Se não existir um <tbody> na tela, a função simplesmente para de executa
  if (!tbody) return;

  tbody.innerHTML = '';

  //Se não houver nada na lista, aparece mensagem de aluno não encontrado
  if (!lista || lista.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4">Nenhum aluno encontrado para o período.</td>';
    tbody.appendChild(tr);
    return;
  }

  lista.forEach((aluno) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${aluno.ra}</td>
      <td>${aluno.nome}</td>
      <td>${aluno.totalLivros}</td>
      <td>${aluno.classificacao}</td>
    `;
    //Insere essa nova linha no HTML dentro do <tbody>
    tbody.appendChild(tr);
  });
}

//Atualiza os cards de resumo com os totais recebidos da API
function atualizarCards(resumo) {
  const spanIniciantes = document.getElementById('qtdIniciantes');
  const spanRegulares = document.getElementById('qtdRegulares');
  const spanAtivos = document.getElementById('qtdAtivos');
  const spanExtremos = document.getElementById('qtdExtremos');

  if (!resumo) return;

// A linha coloca no HTML o valor do resumo, mas se esse valor não existir, coloca 0.
//duplo "?" -> Se valor indefinido, nulo ou 0
  if (spanIniciantes) spanIniciantes.textContent = resumo.iniciantes ?? 0;
  if (spanRegulares) spanRegulares.textContent = resumo.regulares ?? 0;
  if (spanAtivos) spanAtivos.textContent = resumo.ativos ?? 0;
  if (spanExtremos) spanExtremos.textContent = resumo.extremos ?? 0;
}

//Filtra a lista de alunos (rankingGeral) com base no que o usuário pesquisou
function aplicarFiltroRA() {
  const input = document.querySelector('.inputPesquisar');
  if (!input) return;

  const termo = input.value.trim();

  //Se o usuário apagou tudo, mostrar a tabela completa
  if (!termo) {
    renderizarTabela(rankingGeral);
    return;
  }

  //Filtrar os alunos cujo RA contém o que foi digitado
  const filtrado = rankingGeral.filter((aluno) =>
    String(aluno.ra).includes(termo)
  );

  renderizarTabela(filtrado);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const resposta = await fetch('http://localhost:3000/alunos/classificacao-geral');
    const dados = await resposta.json();

    if (!resposta.ok || dados.erro) {
      console.error(dados.mensagem || 'Erro ao buscar classificação geral.');
      alert(dados.mensagem || 'Erro ao buscar classificação geral.');
      return;
    }

    rankingGeral = dados.ranking || [];
    atualizarCards(dados.resumo);
    renderizarTabela(rankingGeral);
  } catch (erro) {
    console.error('Erro ao conectar com o servidor na classificação geral.', erro);
    alert('Erro ao conectar com o servidor.');
  }

  const botaoPesquisar = document.querySelector('.botaoPesquisar');
  const inputPesquisar = document.querySelector('.inputPesquisar');

  //Se existir algum conteúdo escrito, aplica  filtro
  if (botaoPesquisar) {
    botaoPesquisar.addEventListener('click', aplicarFiltroRA);
  }

  if (inputPesquisar) {
    //Aqui ele fica "escutando" cada tecla que o usuário pressiona dentro do campo de pesquisa
    inputPesquisar.addEventListener('keyup', (event) => {
      //Se o usuário apertar ENTER → aplica o filtro
      if (event.key === 'Enter') {
        aplicarFiltroRA();
      } else if (!inputPesquisar.value.trim()) {
        // Se o campo ficar vazio, volta a mostrar todo o ranking
        renderizarTabela(rankingGeral);
      }
    });
  }
});



