import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("suporte").orderBy("timestamp", "desc").get();
      const lista = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const docId = docSnap.id;

        let novaMensagem = false;

        const mensagensSnap = await db
          .collection("suporte")
          .doc(docId)
          .collection("mensagens")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();

        if (!mensagensSnap.empty) {
          const ultimaMsg = mensagensSnap.docs[0].data();
          if (ultimaMsg.tipo !== "admin") {
            novaMensagem = true;
          }
        }

        lista.push({
          id: docId,
          ...data,
          novaMensagem,
        });
      }

      return res.status(200).json(lista);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar mensagens", detalhe: error.message });
    }
  }

  if (req.method === "POST") {
    const { tipo, id, resposta, status } = req.body;

    if (tipo === "historico") {
      if (!id) return res.status(400).json({ erro: "ID ausente." });
      try {
        const snapshot = await db
          .collection("suporte")
          .doc(id)
          .collection("mensagens")
          .orderBy("timestamp", "asc")
          .get();

        const mensagens = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return res.status(200).json(mensagens);
      } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar histórico", detalhe: error.message });
      }
    }

    if (!id || !resposta || !resposta.trim()) {
      return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
    }

    try {
      const ref = db.collection("suporte").doc(id);

      await ref.collection("mensagens").add({
        resposta,
        tipo: "admin",
        timestamp: new Date(),
      });

      await ref.update({
        resposta,
        status: status || "aberto",
        encerrado: status === "encerrado",
        respondidoEm: new Date(),
        novaMensagem: false, // zera o alerta no painel
      });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  return res.status(405).json({ erro: "Método não permitido" });
}
