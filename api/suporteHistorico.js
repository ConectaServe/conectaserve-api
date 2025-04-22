import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ CORS headers obrigatórios (antes de qualquer retorno)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Suporte a preflight request (CORS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ❌ Só aceita método GET
  if (req.method !== "GET") {
    res.status(405).json({ erro: "Método não permitido" });
    return;
  }

  const { id } = req.query;

  if (!id) {
    res.status(400).json({ erro: "ID ausente." });
    return;
  }

  try {
    const snapshot = await db
      .collection("suporte")
      .doc(id)
      .collection("mensagens")
      .orderBy("timestamp", "asc")
      .get();

    const mensagens = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(mensagens);
  } catch (error) {
    console.error("❌ Erro no suporteHistorico.js:", error);
    res.status(500).json({ erro: error.message });
  }
}
