// pages/api/atualizarStatusVerificacao.js
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ Cabeçalhos CORS permitidos
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Trata requisições de preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id, status } = req.query;

  if (req.method === "PATCH") {
    try {
      await db.collection("usuarios").doc(id).update({
        statusVerificacao: status
      });
      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  } else {
    return res.status(405).json({ erro: "Método não permitido" });
  }
}
