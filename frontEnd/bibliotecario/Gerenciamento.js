const API_BASE = "http://localhost:3000"; //API BASE, pois faremos várias requisições neste arquivo

//Pega os elementos do HTML para poder alterá-los via JS, pelo ID
const tabelaLivros = document.getElementById("tabelaLivros");
const tabelaEmprestados = document.getElementById("tabelaEmprestados");
const tabelaHistorico = document.getElementById("tabelaHistorico");
const totalLivrosSpan = document.getElementById("totalLivros");
const livrosDisponiveisSpan = document.getElementById("livrosDisponiveis");
const livrosEmprestadosSpan = document.getElementById("livrosEmprestados");
const btnAtualizar = document.getElementById("btnAtualizar");

const modalEditar = document.getElementById("modalEditar");
const formEditarLivro = document.getElementById("formEditarLivro");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const mensagemEdicao = document.getElementById("mensagemEdicao");

const campoCodigo = document.getElementById("editarCodigo");
const campoTitulo = document.getElementById("editarTitulo");
const campoAutor = document.getElementById("editarAutor");
const campoCategoria = document.getElementById("editarCategoria");
const campoEditora = document.getElementById("editarEditora");
const campoQuantidade = document.getElementById("editarQuantidade");

let livrosCache = []; //Variável global -> Pode ser usada em várias partes do programa

// Funções a seguir apenas de formatação

function formatarData(dataISO) {
  if (!dataISO) return "--";
  const somenteData = dataISO.split("T")[0] || dataISO;
  const [ano, mes, dia] = somenteData.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`;
}

function formatarHora(hora) {
  if (!hora) return "--";
  const somenteHora = hora.includes("T") ? hora.split("T")[1] : hora;
  const [hh, mm, ss = "00"] = somenteHora.split(":");
  if (!hh || !mm) return somenteHora.slice(0, 8);
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.slice(0, 2).padStart(2, "0")}`;
}

function formatarDataHora(data, hora) {
  const dataFmt = formatarData(data);
  const horaFmt = formatarHora(hora);
  if (dataFmt === "--") return "--";
  return horaFmt === "--" ? dataFmt : `${dataFmt} às ${horaFmt}`;
}

// Função de exibir mensagens nas tabelas -> Usadas antes da requisição
function exibirMensagem(tbody, colunas, mensagem) {
  tbody.innerHTML = `<tr><td class="mensagem-vazia" colspan="${colunas}">${mensagem}</td></tr>`;
}

function setCarregando(tbody, colunas) {
  exibirMensagem(tbody, colunas, "Carregando...");
}

async function fetchJson(url) { // Recebe um parâmetro url, que é o endereço do BackEnd de onde os dados serão buscados
  const resposta = await fetch(url); //Buscar JSON do BackEnd, fazendo uma requisição
  if (!resposta.ok) {
    let detalhe = "";
    try { //Essa parte tenta extrair uma mensagem de erro mais detalhada do corpo da resposta
      const erro = await resposta.json();  //Tenta transformar a resposta em JSON
      detalhe = erro.mensagem || erro.status || ""; //Tente pegar a msg de erro
    } catch (_) {
      detalhe = resposta.statusText; //Se não conseguir, pega a mensagem padrão do navegador
    }
    throw new Error(detalhe || "Não foi possível carregar os dados.");
  }
  return resposta.json();
}

//Renderizar tabelas -> Pega-se o array de livros do backend e transforma em linha de tabela HTML
function renderizarLivros(livros = []) {
  if (!livros.length) {
    // Evita renderizar tabela vazia
    exibirMensagem(tabelaLivros, 7, "Nenhum livro cadastrado.");
    return;
  }

  /*Armazena os livros em uma variável global (livrosCache)
  (ex: quando o usuário clica em editar, busca-se o livro por código dentro desse cache) */
  livrosCache = livros;

  /*A tabelaLivros.innerHTML = ... -> substitui o conteúdo do <tbody id="tabelaLivros"> com esse HTML gerado —> isto atualiza a tabela inteira de uma vez
  O .map() pega um array e transforma cada item em outra coisa, criando um novo array.*/
  tabelaLivros.innerHTML = livros
    .map((livro) => {
      const statusDisponivel = livro.STATUS === "Disponível" && Number(livro.QTD) > 0;
      const statusClasse = statusDisponivel ? "status-disponivel" : "status-emprestado";
      const statusTexto = statusDisponivel ? "Disponível" : "Emprestado";

      return `
        <tr>
          <td>${livro.CODIGO}</td>
          <td>${livro.TITULO}</td>
          <td>${livro.AUTOR || "-"}</td>
          <td>${livro.CATEGORIA || "-"}</td>
          <td>${livro.QTD}</td>
          <td><span class="${statusClasse}">${statusTexto}</span></td>
          <td class="acoes">
            <button class="btn editar" data-acao="editar" data-codigo="${livro.CODIGO}">Editar</button>
            <button class="btn deletar" data-acao="deletar" data-codigo="${livro.CODIGO}">Deletar</button>
          </td>
        </tr>
      `;
    })

    /*Os botões de ação têm atributos data-acao e data-codigo —> isso permite o event delegation 
    (um único click listener em tabelaLivros captura cliques e lê data-codigo para identificar o livro)*/

    .join(""); //Concatena todas as strings num único HTML
}

function renderizarEmprestados(emprestimos = []) { // Preenche dinbamicamente a tabela com os dados que recebe
  if (!emprestimos.length) {
    exibirMensagem(tabelaEmprestados, 6, "Nenhum empréstimo pendente.");
    return;
  }

  tabelaEmprestados.innerHTML = emprestimos
    .map(
      (emprestimo) => `
      <tr>
        <td>${emprestimo.codigoLivro}</td>
        <td>${emprestimo.tituloLivro}</td>
        <td>${emprestimo.raAluno}</td>
        <td>${emprestimo.nomeAluno}</td>
        <td>${formatarData(emprestimo.dataEmprestimo)}</td>
        <td>${formatarHora(emprestimo.horaEmprestimo)}</td>
      </tr>
    `
    )
    .join("");
}

function renderizarHistorico(emprestimos = []) { // Preenche dinbamicamente a tabela com os dados que recebe
  if (!emprestimos.length) {
    exibirMensagem(tabelaHistorico, 6, "Nenhum empréstimo registrado.");
    return;
  }

  tabelaHistorico.innerHTML = emprestimos
    .map((emprestimo) => {
      const devolvido = Boolean(emprestimo.dataDevolucao);
      const statusClasse = devolvido ? "status-chip status-finalizado" : "status-chip status-ativo";
      const statusTexto = devolvido ? "Finalizado" : "Em aberto";
      return `
        <tr>
          <td>${emprestimo.codigoEmprestimo}</td>
          <td>${emprestimo.tituloLivro} (${emprestimo.codigoLivro})</td>
          <td>${emprestimo.nomeAluno} (${emprestimo.raAluno})</td>
          <td>${formatarDataHora(emprestimo.dataEmprestimo, emprestimo.horaEmprestimo)}</td>
          <td>${formatarDataHora(emprestimo.dataDevolucao, emprestimo.horaDevolucao)}</td>
          <td><span class="${statusClasse}">${statusTexto}</span></td>
        </tr>
      `;
    })
    .join("");
}

/*Atualiza: total de títulos, exemplares disponíveis, exemplares emprestados
E escreve nos <strong> do HTML*/
function atualizarResumo(livros = [], emprestimosAtivos = []) {
  const totalTitulos = livros.length;  //Conta qts livros existem no total
  //Calcula qts exemplares estão disponíveis no estoque
  const totalDisponiveis = livros.reduce((acc, livro) => { //Reduce percorre cada livro e soma sua quantidade (livro.QTD)
    const quantidade = Number(livro.QTD);
    return acc + (Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0); // Garante que só some valores válidos e positivos.
  }, 0);
  // Conta quantos livros estão emprestados atualmente
  const totalEmprestados = Array.isArray(emprestimosAtivos) ? emprestimosAtivos.length : 0; // Se emprestimosAtivos não for um array, retorna 0.

  //Atualiza dinamicamente os elementos HTML que mostram os números do resumo:
  totalLivrosSpan.textContent = totalTitulos;
  livrosDisponiveisSpan.textContent = totalDisponiveis;
  livrosEmprestadosSpan.textContent = totalEmprestados;
}

// Carregar todos os dados da página de gerenciamento (livros, empréstimos ativos e histórico), atualizar as tabelas e exibir mensagens de erro ou carregamento.
async function carregarGerenciamento() { // Mostra Carregando... nas tabelas
  setCarregando(tabelaLivros, 7);
  setCarregando(tabelaEmprestados, 6);
  setCarregando(tabelaHistorico, 6);

   // Promise.all() faz as três ao mesmo tempo → mais rápido.

  try {
    // Faz 3 chamadas simultâneas ao backend 
    const [livros, emprestimosAtivos, historico] = await Promise.all([ //Promise.all() executa todas as requisições simultaneamente, e só continua quando todas terminarem
      fetchJson(`${API_BASE}/api/livros`),
      fetchJson(`${API_BASE}/api/emprestimos/ativos`),
      fetchJson(`${API_BASE}/api/emprestimos`),
    ]);

    // Renderizar os dados no HTML
    //Cada função pega os dados e monta dinamicamente a tabela correspondente
    renderizarLivros(livros);
    renderizarEmprestados(emprestimosAtivos);
    renderizarHistorico(historico);
    atualizarResumo(livros, emprestimosAtivos); //Atualizar o resumo dos livros
  } catch (error) { //Msg de erro exibidas no lugar das tabelas
    exibirMensagem(tabelaLivros, 7, `Erro ao carregar livros: ${error.message}`);
    exibirMensagem(tabelaEmprestados, 6, `Erro ao carregar empréstimos: ${error.message}`);
    exibirMensagem(tabelaHistorico, 6, `Erro ao carregar histórico: ${error.message}`);
  }
}

//A função é chamada quando:
btnAtualizar.addEventListener("click", carregarGerenciamento); //Clica em atualizar
document.addEventListener("DOMContentLoaded", carregarGerenciamento); // Página carrega

// Interações de edição/deleção
function abrirModalEdicao(livro) {
  campoCodigo.value = livro.CODIGO;
  campoTitulo.value = livro.TITULO;
  campoAutor.value = livro.AUTOR || "";
  campoCategoria.value = livro.CATEGORIA || "";
  campoEditora.value = livro.EDITORA || "";
  campoQuantidade.value = livro.QTD;
  mensagemEdicao.textContent = "";
  modalEditar.classList.remove("oculto");
}

function fecharModalEdicao() {
  modalEditar.classList.add("oculto"); //Add classed oculta -> Some a caixa
  formEditarLivro.reset();
}

function mostrarMensagemEdicao(texto, tipo = "erro") {
  mensagemEdicao.textContent = texto;
  mensagemEdicao.style.color = tipo === "sucesso" ? "#1f7a3b" : "#c62828";
}

// Sempre que alguém clicar em QUALQUER elemento dentro da tabela de livros,
// esta função será executada → isso é delegação de eventos
tabelaLivros.addEventListener("click", (event) => {

  const botao = event.target.closest("button[data-acao]"); // Event.target = o elemento exato onde você clicou (ex: pode ser o texto dentro do botão).
  if (!botao) return; // .closest("button[data-acao]") → sobe na hierarquia de elementos até encontrar um <button> que possua o atributo data-acao.
   /* 
     Ou seja, ele encontra botões como:
     <button class="btn editar" data-acao="editar" data-codigo="123">Editar</button>
     <button class="btn deletar" data-acao="deletar" data-codigo="123">Deletar</button>
  */


  // Pega o código do livro a partir do botão
  // .dataset pega atributos HTML que começam com data-
  const codigo = botao.dataset.codigo;

  const livro = livrosCache.find((l) => String(l.CODIGO) === String(codigo)); // Procurando o livro correspondente no cache. LivrosCache -> Lista vinda do back
  if (!livro) return; // Find() procura dentro derssa lista o livro com o mesmo código. Depois converte tudo para string

  // Verifica qual ação o botão pede
  if (botao.dataset.acao === "editar") {
    abrirModalEdicao(livro);
  } else if (botao.dataset.acao === "deletar") {
    deletarLivro(livro);
  }
});

btnCancelarEdicao.addEventListener("click", fecharModalEdicao); // Ao cancelar a edição, fecha o modal


//Essa função envia uma requisição PUT para atualizar um livro existente no banco
formEditarLivro.addEventListener("submit", async (event) => { // Executa envio do formulário, quando clicar em "salvar" é ativado
  event.preventDefault();
  const codigo = campoCodigo.value; //Pega o codigo do livro sendo editado
  //Monta o payload (JSON com os dados atualizados)
  const payload = { //Todos os campos do livro
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    categoria: campoCategoria.value.trim(),
    editora: campoEditora.value.trim(),
    quantidade: Number(campoQuantidade.value)
  };

  try {
    const resposta = await fetch(`${API_BASE}/api/livros/${codigo}`, {
      method: "PUT", // Função da requisição: editar / atualizar um livro existente no banco de dados
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagemEdicao(resultado.mensagem || "Erro ao atualizar livro.");
      return;
    }

    mostrarMensagemEdicao(resultado.mensagem || "Livro atualizado com sucesso!", "sucesso");
    setTimeout(() => {
      fecharModalEdicao();
      carregarGerenciamento(); // Carregar todos os dados da página de gerenciamento (livros, empréstimos ativos e histórico), atualizar as tabelas e exibir mensagens de erro ou carregamento.
    }, 800);
  } catch (error) {
    mostrarMensagemEdicao("Erro ao conectar ao servidor.");
  }
});

async function deletarLivro(livro) {
  const confirmar = window.confirm(`Tem certeza que deseja excluir o livro "${livro.TITULO}"?`);  //Alert
  if (!confirmar) return;

  try {
    const codigo = String(livro.CODIGO);
    const resposta = await fetch(`${API_BASE}/api/livros/${codigo}`, { // Requisição para deletar um livro
      method: "DELETE"
    });

    const resultado = await resposta.json();
    if (!resposta.ok) {
      alert(resultado.mensagem || "Erro ao excluir livro.");
      return;
    }

    alert(resultado.mensagem || "Livro excluído com sucesso!");
    carregarGerenciamento();
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
    alert("Erro ao conectar ao servidor.");
  }
}

