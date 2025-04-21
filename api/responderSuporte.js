// /api/responderSuporte.js (Vercel)

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

  const { id, resposta } = req.body;

  if (!id || !resposta || !resposta.trim()) {
    return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
  }

  try {
    await db.collection("suporte").doc(id).update({
      resposta,
      respondidoEm: new Date()
    });

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
