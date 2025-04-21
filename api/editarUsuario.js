// /api/editarUsuario.js

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PATCH") return res.status(405).json({ sucesso: false, erro: "Método não permitido" });

  const { id } = req.query;
  const { nome, cpf, email, tipo, moedas } = req.body;

  if (!id) {
    return res.status(400).json({ sucesso: false, erro: "ID não informado" });
  }

  try {
    const updateData = {};

    if (nome !== undefined) updateData.nome = nome;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (email !== undefined) updateData.email = email;
    if (tipo !== undefined) updateData.tipo = tipo;

    // 👇 Corrige caso moedas venha como string ou undefined
    if (moedas !== undefined && !isNaN(moedas)) {
      updateData.moedas = parseInt(moedas);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ sucesso: false, erro: "Nenhum campo enviado." });
    }

    await db.collection("usuarios").doc(id).update(updateData);
    return res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error("Erro Firebase:", error);
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
}
