import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ CORS headers para permitir qualquer origem (ou troque "*" por seu domínio exato)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Tratamento para requisições preflight (CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id, status } = req.query;

  if (!id || !status) {
    return res.status(400).json({ erro: "ID e status são obrigatórios" });
  }

  if (req.method === "PATCH") {
    try {
      // Atualiza o status no documento do usuário
      await db.collection("usuarios").doc(id).update({
        statusVerificacao: status
      });

      // Atualiza também o status na coleção verificacoes (se existir)
      const verDoc = db.collection("verificacoes").doc(id);
      const verSnap = await verDoc.get();

      if (verSnap.exists) {
        await verDoc.update({
          status: status
        });
      }

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  } else {
    return res.status(405).json({ erro: "Método não permitido" });
  }
}
