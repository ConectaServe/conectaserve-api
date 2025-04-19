import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // responde pré-flight
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuário não fornecido." });
  }

  try {
    await db.collection("usuarios").doc(id).update({ bloqueado: false });
    return res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao desbloquear usuário:", error);
    return res.status(500).json({ erro: "Erro interno ao desbloquear." });
  }
}
