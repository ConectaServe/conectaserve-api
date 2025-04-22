import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET = listar mensagens
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("suporte").orderBy("timestamp", "desc").get();
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(lista);
    } catch (e) {
      return res.status(500).json({ erro: e.message });
    }
  }

  // POST = responder / encerrar / reabrir
  if (req.method === "POST") {
    const { id, resposta, status } = req.body;

    if (!id || !resposta || !resposta.trim()) {
      return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
    }

    try {
      // adiciona na subcoleção mensagens
      await db.collection("suporte").doc(id).collection("mensagens").add({
        resposta,
        tipo: "admin",
        timestamp: new Date()
      });

      // atualiza status e dados principais
      await db.collection("suporte").doc(id).set({
        resposta,
        status: status || "aberto",
        encerrado: status === "encerrado",
        respondidoEm: new Date()
      }, { merge: true });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  // Se método não for aceito
  return res.status(405).json({ erro: "Método não permitido" });
}
