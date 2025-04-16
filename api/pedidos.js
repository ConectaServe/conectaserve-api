import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("pedidos").get();
    const pedidos = snapshot.docs.map(doc => doc.data());
    res.status(200).json(pedidos);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}
