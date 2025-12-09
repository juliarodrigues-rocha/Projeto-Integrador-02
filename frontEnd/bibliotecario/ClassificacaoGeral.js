//Variável global para que outras funções acessem ela
let rankingGeral = []; //Receberá a lista de alunos completa do back

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

  //lista é um array de objetos
  // Cada item desse array é um aluno:
  lista.forEach((aluno) => { //Para cada aluno da lista, vamos inserir na tabela as informações
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

// Coloca no HTML o valor do resumo, mas se esse valor não existir, coloca 0.
  if (spanIniciantes) spanIniciantes.textContent = resumo.iniciantes ?? 0; //duplo "?" -> Se valor indefinido, nulo ou 0
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

//Acontece após o doc HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    //Requisição GET para buscar a classificação geral
    const resposta = await fetch('http://localhost:3000/alunos/classificacao-geral');
    const dados = await resposta.json();

    if (!resposta.ok || dados.erro) {
      console.error(dados.mensagem || 'Erro ao buscar classificação geral.');
      alert(dados.mensagem || 'Erro ao buscar classificação geral.');
      return;
    }

    //"Dados" é o JSON retornado pela API
    rankingGeral = dados.ranking || [];
    atualizarCards(dados.resumo);
    renderizarTabela(rankingGeral);
  } catch (erro) {
    console.error('Erro ao conectar com o servidor na classificação geral.', erro);
    alert('Erro ao conectar com o servidor.');
  }

  const botaoPesquisar = document.querySelector('.botaoPesquisar');
  const inputPesquisar = document.querySelector('.inputPesquisar');

  // Se clicar no botão, aplica o filtro
  if (botaoPesquisar) {
    botaoPesquisar.addEventListener('click', aplicarFiltroRA);
  }

  //Escuta as teclas digitadas no input
  if (inputPesquisar) {
    inputPesquisar.addEventListener('keyup', (event) => {
      //Se o usuário apertar ENTER → aplica o filtro
      if (event.key === 'Enter') {
        aplicarFiltroRA();
      } else if (!inputPesquisar.value.trim()) {
        //Se o campo ficar vazio, volta a mostrar todo o ranking
        renderizarTabela(rankingGeral);
      }
    });
  }
});



