import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  const { id, status } = req.query;

  if (req.method === "PATCH") {
    try {
      await db.collection("usuarios").doc(id).update({
        statusVerificacao: status
      });

      res.status(200).json({ sucesso: true });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  } else {
    res.status(405).json({ erro: "Método não permitido" });
  }
}
