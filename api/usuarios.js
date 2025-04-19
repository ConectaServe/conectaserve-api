// ✅ scripts.js com edição de usuário
console.log("✅ scripts.js carregado");

window.onload = function () {
  loadPage("dashboard.php");
};

function loadPage(page) {
  fetch(page)
    .then(res => res.text())
    .then(html => {
      const content = document.getElementById("main-content");
      content.innerHTML = html;

      // Aguarda DOM carregar antes de ativar funções
      setTimeout(() => {
        if (page === "pedidos.php") ativarExcluirPedido();
        if (page === "verificacoes.php") ativarStatusVerificacao();
        if (page === "usuarios.php") ativarUsuarios();
      }, 200);
    })
    .catch(err => console.error("❌ Erro ao carregar página:", err));
}

function ativarExcluirPedido() {
  const botoes = document.querySelectorAll("[data-excluir-id]");
  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-excluir-id");
      if (confirm("Tem certeza que deseja excluir?")) {
        fetch(`https://conectaserve-api.vercel.app/api/excluirPedido?id=${id}`, { method: "DELETE" })
          .then(res => res.json())
          .then(data => {
            if (data.sucesso) {
              alert("Pedido excluído!");
              loadPage("pedidos.php");
            }
          });
      }
    });
  });
}

function ativarStatusVerificacao() {
  const aprovarBtns = document.querySelectorAll("[data-id].btn-aprovar");
  const reprovarBtns = document.querySelectorAll("[data-id].btn-reprovar");

  aprovarBtns.forEach(btn => {
    btn.addEventListener("click", () => atualizarStatus(btn.getAttribute("data-id"), "aprovado"));
  });

  reprovarBtns.forEach(btn => {
    btn.addEventListener("click", () => atualizarStatus(btn.getAttribute("data-id"), "recusado"));
  });
}

function atualizarStatus(id, novoStatus) {
  fetch(`https://conectaserve-api.vercel.app/api/atualizarStatusVerificacao?id=${id}&status=${novoStatus}`, {
    method: "PATCH"
  })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        alert("Status atualizado com sucesso!");
        loadPage("verificacoes.php");
      } else {
        alert("Erro ao atualizar status.");
      }
    })
    .catch(err => {
      console.error("Erro ao atualizar status:", err);
      alert("Erro na requisição.");
    });
}

function ativarUsuarios() {
  // Excluir
  document.querySelectorAll("[data-excluir-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-excluir-id");
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/excluirUsuario?id=${id}`, { method: "DELETE" })
          .then(res => res.json())
          .then(data => {
            if (data.sucesso) {
              alert("Usuário excluído com sucesso!");
              loadPage("usuarios.php");
            } else {
              alert("Erro ao excluir.");
            }
          });
      }
    });
  });

  // Bloquear
  document.querySelectorAll("[data-bloquear-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-bloquear-id");
      if (confirm("Deseja bloquear este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/bloquearUsuario?id=${id}`, { method: "PATCH" })
          .then(res => res.json())
          .then(data => {
            if (data.sucesso) {
              alert("Usuário bloqueado!");
              loadPage("usuarios.php");
            } else {
              alert("Erro ao bloquear.");
            }
          });
      }
    });
  });

  // Desbloquear
  document.querySelectorAll("[data-desbloquear-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-desbloquear-id");
      if (confirm("Deseja desbloquear este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/desbloquearUsuario?id=${id}`, { method: "PATCH" })
          .then(res => res.json())
          .then(data => {
            if (data.sucesso) {
              alert("Usuário desbloqueado!");
              loadPage("usuarios.php");
            } else {
              alert("Erro ao desbloquear.");
            }
          });
      }
    });
  });

  // Editar
  document.querySelectorAll("[data-editar-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-editar-id");
      const linha = btn.closest("tr");
      const nome = linha.children[0].innerText;
      const cpf = linha.children[1].innerText;
      const email = linha.children[2].innerText;
      const tipo = linha.children[3].innerText;

      const novoNome = prompt("Editar nome:", nome);
      const novoCpf = prompt("Editar CPF:", cpf);
      const novoEmail = prompt("Editar Email:", email);
      const novoTipo = prompt("Editar Tipo (cliente/prestador):", tipo);

      if (novoNome && novoCpf && novoEmail && novoTipo) {
        fetch(`https://conectaserve-api.vercel.app/api/editarUsuario`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, nome: novoNome, cpf: novoCpf, email: novoEmail, tipo: novoTipo })
        })
          .then(res => res.json())
          .then(data => {
            if (data.sucesso) {
              alert("Usuário atualizado!");
              loadPage("usuarios.php");
            } else {
              alert("Erro ao editar.");
            }
          });
      }
    });
  });
}
