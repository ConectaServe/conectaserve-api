// /api/excluirUsuario.js

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // 🔓 CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou seu domínio fixo
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Trata o preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ sucesso: false, erro: "Método não permitido" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ sucesso: false, erro: "ID não informado" });
  }

  try {
    await db.collection("usuarios").doc(id).delete();
    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
}
