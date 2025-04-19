document.querySelectorAll("[data-bloquear-id]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.bloquearId;
    console.log("🔒 Bloquear clicado para:", id); // 👈 debug opcional

    if (confirm("Bloquear usuário?")) {
      fetch(`https://conectaserve-api.vercel.app/api/bloquearUsuario?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bloqueado: true })
      })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          alert("Usuário bloqueado!");
          location.reload(); // ou loadPage("usuarios.php");
        } else {
          alert("Erro ao bloquear.");
        }
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        alert("Erro ao tentar bloquear.");
      });
    }
  };
});
