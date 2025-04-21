// /api/responderSuporte.js
...
const { id, userId, resposta, status } = req.body;

if ((!id && !userId) || !resposta || !resposta.trim()) {
  return res.status(400).json({ erro: "ID ou resposta ausente ou inválida" });
}

try {
  let docRef;

  if (id) {
    docRef = db.collection("suporte").doc(id);
  } else {
    // pega o último documento do userId
    const snapshot = await db
      .collection("suporte")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ erro: "Mensagem não encontrada para esse usuário." });
    }

    docRef = snapshot.docs[0].ref;
  }

  await docRef.update({
    resposta,
    status: status || "aberto",
    respondidoEm: new Date(),
  });

  return res.status(200).json({ sucesso: true });
} catch (e) {
  return res.status(500).json({ erro: e.message });
}
