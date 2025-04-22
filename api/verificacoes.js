import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("usuarios").get();
    const verificacoes = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.statusVerificacao) {
        const status = (data.statusVerificacao || "").toLowerCase().trim();

        // Aceita 'analise' ou 'em_analise' como equivalentes
        const statusPadronizado =
          status === "analise" || status === "em_analise"
            ? "em_analise"
            : status;

        verificacoes.push({
          id: doc.id,
          nome: data.nome || "",
          cpf: data.cpf || "",
          cidade: data.cidade || "",
          foto: (data.foto || "").trim(),
          cnh: (data.cnh || "").trim(),
          status: statusPadronizado
        });
      }
    });

    res.status(200).json(verificacoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
