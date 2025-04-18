import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("usuarios").where("statusVerificacao", "!=", "").get();
      const lista = snapshot.docs
        .filter(doc => doc.data().statusVerificacao) // só quem tem status
        .map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            nome: d.nome || "-",
            cidade: d.cidade || "-",
            foto: d.foto || "",
            cnh: d.cnh || "",
            status: d.statusVerificacao || "em_analise"
          };
        });

      res.status(200).json(lista);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  } else {
    res.status(405).json({ erro: "Método não permitido" });
  }
}
