document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const livro = {
        codigo: document.getElementById("codigo").value.trim(),
        titulo: document.getElementById("titulo").value.trim(),
        autor: document.getElementById("autor").value.trim(),
        quantidade: parseInt(document.getElementById("quantidade").value.trim()),
        categoria: document.getElementById("categoria").value.trim(),
        editora: document.getElementById("editora").value.trim(),
      };

      try {
        const response = await fetch("http://localhost:3000/api/livros", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          e.target.reset();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert("Erro ao conectar ao servidor.");
      }
    });
