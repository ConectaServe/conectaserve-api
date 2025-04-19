import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const snapshot = await db.collection("usuarios").get();
    const usuarios = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || "",
        cpf: data.cpf || "",
        email: data.email || "",
        tipo: data.tipo || "",
        bloqueado: data.bloqueado === true // <-- aqui está a correção
      };
    });

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}
