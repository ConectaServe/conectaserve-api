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

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "PATCH") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id, status } = req.query;

  if (!id || !status) {
    return res.status(400).json({ erro: "ID e status são obrigatórios" });
  }

  try {
    await db.collection("verificacoes").doc(id).update({
      status: status
    });

    res.status(200).json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
