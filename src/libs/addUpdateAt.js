const admin = require('firebase-admin');

// Substitua pelo caminho do seu arquivo de credenciais do Firebase
const serviceAccount = require('');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTimestamps() {
  const snapshot = await db.collection('iphones').get();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const updates = [];
  snapshot.forEach(doc => {
    if (!doc.get('updateAt')) {
      updates.push(doc.ref.update({ updateAt: now }));
    }
  });
  await Promise.all(updates);
  console.log('updateAt adicionado nos documentos que não tinham o campo.');
}

addTimestamps().then(() => process.exit());