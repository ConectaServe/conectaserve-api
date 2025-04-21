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

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id, resposta, status } = req.body;

  if (!id || typeof resposta !== "string" || resposta.trim().length === 0) {
    return res.status(400).json({ erro: "ID ou resposta ausente/inválida." });
  }

  try {
    const ref = db.collection("suporte").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ erro: "Mensagem de suporte não encontrada." });
    }

    await ref.update({
      resposta: resposta.trim(),
      respondidoEm: new Date(),
      ...(status ? { status } : {}) // só atualiza status se vier
    });

    return res.status(200).json({ sucesso: true, mensagem: "Resposta registrada com sucesso." });

  } catch (error) {
    console.error("Erro ao atualizar suporte:", error);
    return res.status(500).json({ erro: "Erro interno ao atualizar suporte." });
  }
}
