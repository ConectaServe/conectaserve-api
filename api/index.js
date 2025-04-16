const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db.collection('usuarios').get();
    const data = usuarios.docs.map(doc => doc.data());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await db.collection('pedidos').get();
    const data = pedidos.docs.map(doc => doc.data());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("API ConectaServe rodando na porta 3000");
});
