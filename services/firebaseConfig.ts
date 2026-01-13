
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CONFIGURAÇÃO FIREBASE:
const firebaseConfig = {
  apiKey: "AIzaSyDnuGTiGAHqUN8YMVuhc3GMOIfO-NTpwfk",
  authDomain: "ipb-calvario-app.firebaseapp.com",
  projectId: "ipb-calvario-app",
  storageBucket: "ipb-calvario-app.firebasestorage.app",
  messagingSenderId: "841095868850",
  appId: "1:841095868850:web:1bdb03f9c6024233ba74ab"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Banco de Dados
export const db = getFirestore(app);