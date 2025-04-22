import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { userId, resposta, status } = req.body;

  if (!userId || !resposta || !resposta.trim()) {
    return res.status(400).json({ erro: "userId ou resposta ausente ou inválida" });
  }

  try {
    // adiciona a nova resposta à subcoleção 'mensagens'
    await db.collection("suporte").doc(userId).collection("mensagens").add({
      resposta,
      tipo: "admin",
      timestamp: new Date()
    });

    // atualiza o status e última resposta
    await db.collection("suporte").doc(userId).set({
      resposta,
      status: status || "aberto",
      respondidoEm: new Date()
    }, { merge: true });

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
