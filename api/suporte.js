import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ GET: listar mensagens da coleção principal
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("suporte").orderBy("timestamp", "desc").get();
      const mensagens = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(mensagens);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  // ✅ POST: responder, encerrar ou reabrir
  if (req.method === "POST") {
    const { id, resposta, status } = req.body;

    if (!id || !resposta || !resposta.trim()) {
      return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
    }

    try {
      const suporteRef = db.collection("suporte").doc(id);

      // Salva resposta na subcoleção mensagens
      await suporteRef.collection("mensagens").add({
        resposta,
        tipo: "admin",
        timestamp: Timestamp.now(),
      });

      // Atualiza documento principal com status e resposta
      await suporteRef.set({
        resposta,
        status: status || "aberto",
        encerrado: status === "encerrado",
        respondidoEm: Timestamp.now(),
      }, { merge: true });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  return res.status(405).json({ erro: "Método não permitido" });
}
