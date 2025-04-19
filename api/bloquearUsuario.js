import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ erro: "ID não fornecido" });
  }

  try {
    await db.collection("usuarios").doc(id).update({ bloqueado: true });
    return res.status(200).json({ sucesso: true });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
