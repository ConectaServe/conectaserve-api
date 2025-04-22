import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ CORS headers obrigatórios para Vercel aceitar
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.status(405).json({ erro: "Método não permitido" });
    return;
  }

  const { id, resposta, status } = req.body;

  if (!id || !resposta || !resposta.trim()) {
    res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
    return;
  }

  try {
    await db.collection("suporte").doc(id).collection("mensagens").add({
      resposta,
      tipo: "admin",
      timestamp: new Date()
    });

    await db.collection("suporte").doc(id).set({
      resposta,
      status: status || "aberto",
      encerrado: status === "encerrado",
      respondidoEm: new Date()
    }, { merge: true });

    res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error("❌ Erro:", error);
    res.status(500).json({ erro: error.message });
  }
}
