import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ GET → Histórico geral (usado no painel para listar todos os tickets)
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("suporte").orderBy("timestamp", "desc").get();
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(lista);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar mensagens", detalhe: error.message });
    }
  }

  // ✅ POST → Responder, encerrar ou reabrir
  if (req.method === "POST") {
    const { id, resposta, status } = req.body;

    if (!id || !resposta || !resposta.trim()) {
      return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
    }

    try {
      const ref = db.collection("suporte").doc(id);

      // Adiciona resposta na subcoleção 'mensagens'
      await ref.collection("mensagens").add({
        resposta,
        tipo: "admin",
        timestamp: new Date(),
      });

      // Atualiza o documento principal
      const encerrado = status === "encerrado";
      const novoStatus = encerrado ? "encerrado" : "aberto";

      await ref.update({
        resposta,
        status: novoStatus,
        encerrado,
        respondidoEm: new Date(),
      });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  // ❌ Se método inválido
  return res.status(405).json({ erro: "Método não permitido" });
}
