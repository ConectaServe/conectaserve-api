import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  try {
    const periodo = req.query.periodo || 'dia';

    const gerarChaveData = (timestamp, periodo) => {
      const dt = new Date(timestamp * 1000);
      switch (periodo) {
        case 'semana':
          const week = new Intl.DateTimeFormat('en', { week: 'numeric', year: 'numeric' }).format(dt);
          return week;
        case 'mes':
          return dt.toISOString().slice(0, 7); // yyyy-mm
        case 'ano':
          return dt.getFullYear().toString();
        default:
          return dt.toISOString().slice(0, 10); // yyyy-mm-dd
      }
    };

    const snapshot = await db.collection('usuarios').get();

    const agrupado = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const tipo = data.tipo;
      const createdAt = data.createdAt;

      if (!tipo || !createdAt || !createdAt._seconds) return;

      const chave = gerarChaveData(createdAt._seconds, periodo);
      if (!agrupado[chave]) {
        agrupado[chave] = { clientes: 0, prestadores: 0 };
      }

      if (tipo === 'cliente') agrupado[chave].clientes++;
      if (tipo === 'prestador') agrupado[chave].prestadores++;
    });

    const resultado = Object.entries(agrupado)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([data, valores]) => ({
        data,
        clientes: valores.clientes,
        prestadores: valores.prestadores
      }));

    res.status(200).json(resultado);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar usuários: ' + e.message });
  }
}
