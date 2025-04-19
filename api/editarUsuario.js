// pages/api/editarUsuario.js
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ sucesso: false, erro: "Método não permitido" });
  }

  const { id } = req.query;
  const { nome, cpf, email, tipo } = req.body;

  if (!id || !nome || !cpf || !email || !tipo) {
    return res.status(400).json({ sucesso: false, erro: "Dados incompletos" });
  }

  try {
    await db.collection("usuarios").doc(id).update({
      nome,
      cpf,
      email,
      tipo,
    });

    res.status(200).json({ sucesso: true });
  } catch (e) {
    res.status(500).json({ sucesso: false, erro: e.message });
  }
}
