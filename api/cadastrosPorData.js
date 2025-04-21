// pages/api/cadastrosPorData.js
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
    const dadosAgrupados = {};

    snapshot.forEach(doc => {
      const { tipo, createdAt } = doc.data();
      if (createdAt && tipo) {
        const dataFormatada = new Date(createdAt._seconds * 1000).toISOString().split("T")[0];
        if (!dadosAgrupados[dataFormatada]) {
          dadosAgrupados[dataFormatada] = { clientes: 0, prestadores: 0 };
        }
        if (tipo === "cliente") dadosAgrupados[dataFormatada].clientes++;
        if (tipo === "prestador") dadosAgrupados[dataFormatada].prestadores++;
      }
    });

    const resultado = Object.entries(dadosAgrupados).map(([data, valores]) => ({
      data,
      ...valores
    }));

    res.status(200).json(resultado);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}
