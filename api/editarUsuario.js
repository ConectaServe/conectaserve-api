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
        if (page === "pedidos.php") {
          ativarExcluirPedido();
        }

        if (page === "verificacoes.php") {
          ativarStatusVerificacao();
        }

        if (page === "usuarios.php") {
          ativarUsuarios(); // ✅ Ativa botões de usuários
        }
      }, 100);
    })
    .catch(err => console.error("❌ Erro ao carregar página:", err));
}

function ativarExcluirPedido() {
  const botoes = document.querySelectorAll("[data-excluir-id]");
  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-excluir-id");
      if (confirm("Tem certeza que deseja excluir?")) {
        fetch(`https://conectaserve-api.vercel.app/api/excluirPedido?id=${id}`, {
          method: "DELETE"
        })
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

  console.log("Ativando botões de verificação...");

  aprovarBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      atualizarStatus(id, "aprovado");
    });
  });

  reprovarBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      atualizarStatus(id, "recusado");
    });
  });
}

function atualizarStatus(id, novoStatus) {
  console.log(`🔄 Atualizando status para ${novoStatus} - ID: ${id}`);

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

// ✅ NOVO: Ativa botões de usuários (Excluir / Bloquear / Desbloquear / Editar)
function ativarUsuarios() {
  document.querySelectorAll("[data-excluir-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-excluir-id");
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/excluirUsuario?id=${id}`, {
          method: "DELETE"
        }).then(res => res.json()).then(data => {
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

  document.querySelectorAll("[data-bloquear-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-bloquear-id");
      if (confirm("Deseja bloquear este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/bloquearUsuario?id=${id}`, {
          method: "PATCH"
        }).then(res => res.json()).then(data => {
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

  document.querySelectorAll("[data-desbloquear-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-desbloquear-id");
      if (confirm("Deseja desbloquear este usuário?")) {
        fetch(`https://conectaserve-api.vercel.app/api/desbloquearUsuario?id=${id}`, {
          method: "PATCH"
        }).then(res => res.json()).then(data => {
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
        fetch(`https://conectaserve-api.vercel.app/api/editarUsuario?id=${id}&nome=${encodeURIComponent(novoNome)}&cpf=${encodeURIComponent(novoCpf)}&email=${encodeURIComponent(novoEmail)}&tipo=${encodeURIComponent(novoTipo)}`, {
          method: "PATCH"
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
