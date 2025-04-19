// /api/editarUsuario.js

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
  // 🔓 CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou "https://conectaserve.com.br"
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Trata a requisição OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Apenas método PATCH é permitido aqui
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
      tipo
    });

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
}
