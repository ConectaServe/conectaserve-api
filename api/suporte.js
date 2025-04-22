import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { tipo } = req.method === "GET" ? req.query : req.body;

  // 🔹 GET → Buscar histórico
  if (req.method === "GET") {
    if (tipo === "historico") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ erro: "ID ausente." });

      try {
        const snapshot = await db
          .collection("suporte")
          .doc(id)
          .collection("mensagens")
          .orderBy("timestamp", "asc")
          .get();

        const mensagens = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return res.status(200).json(mensagens);
      } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
        return res.status(500).json({ erro: error.message });
      }
    }

    return res.status(400).json({ erro: "Tipo inválido para GET" });
  }

  // 🔹 POST → Responder, Encerrar ou Reabrir
  if (req.method === "POST") {
    const { id, resposta } = req.body;
    if (!id || !resposta || !resposta.trim()) {
      return res.status(400).json({ erro: "ID ou resposta ausente" });
    }

    try {
      // Salva a nova mensagem na subcoleção
      await db.collection("suporte").doc(id).collection("mensagens").add({
        resposta,
        tipo: "admin",
        timestamp: new Date()
      });

      // Define status com base no tipo
      let status = "aberto";
      if (tipo === "encerrar") status = "encerrado";

      // Atualiza documento principal
      await db.collection("suporte").doc(id).set({
        resposta,
        status,
        encerrado: status === "encerrado",
        respondidoEm: new Date()
      }, { merge: true });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      console.error("❌ Erro ao processar POST:", error);
      return res.status(500).json({ erro: error.message });
    }
  }

  // 🔒 Método não permitido
  return res.status(405).json({ erro: "Método não permitido" });
}
