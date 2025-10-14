document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("formCadastro");
    const msg = document.getElementById("mensagem");

    function mostrarMensagem(texto, cor) {
        msg.innerText = texto;
        msg.style.color = cor;
    }

    function validarRA(ra) { return /^[0-9]{5,}$/.test(ra); }
    function validarNome(nome) { return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(nome); }
    function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function validarTelefone(tel) { return /^[0-9]{8,}$/.test(tel); }

    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const ra = document.getElementById("ra").value.trim();
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefone = document.getElementById("tel").value.trim();

        if (!validarRA(ra)) return mostrarMensagem("RA inválido. Deve conter apenas números e mínimo 5 dígitos.", "red");
        if (!validarNome(nome)) return mostrarMensagem("Nome inválido. Deve conter pelo menos 3 letras.", "red");
        if (!validarEmail(email)) return mostrarMensagem("Email inválido.", "red");
        if (!validarTelefone(telefone)) return mostrarMensagem("Telefone inválido. Deve conter apenas números e mínimo 8 dígitos.", "red");

        try {
            const resposta = await fetch("http://localhost:3000/alunos/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ra, nome, email, tel: telefone })
            });

            const dados = await resposta.json();
            mostrarMensagem(dados.mensagem, "green");
            form.reset();
        } catch (erro) {
            mostrarMensagem("Erro ao cadastrar aluno!", "red");
            console.error(erro);
        }
    });
});
