import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getRemoteConfig, setLogLevel } from 'firebase/remote-config'; // Importação de setLogLevel

// Sua configuração do Firebase (Preenchida com seus dados)
const firebaseConfig = {
    apiKey: "AIzaSyAhIovJZjl_3lr7K-VVReu8YB6Ga1_MGl8", 
    authDomain: "cadastrofiap-50493.firebaseapp.com", // Padrão
    projectId: "cadastrofiap-50493", 
    storageBucket: "cadastrofiap-50493.firebasestorage.app", 
    messagingSenderId: "262702164991", 
    appId: "1:262702164991:android:93a9274e6ff9020e7f95ca", 
    databaseURL: "https://cadastrofiap-50493-default-rtdb.firebaseio.com", 
};

// 1. Inicializa o App se ainda não foi inicializado
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// 2. Inicializa e Exporta os Serviços
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// 3. Remote Config e CORREÇÃO DE LOG (Removido do useEffect)
export const remoteConfig = getRemoteConfig(app);

// --- CORREÇÃO DO ERRO INDEXEDDB: CHAMADA IMEDIATA ---
// Silencia o log de erro 'indexedDB' no console
setLogLevel(remoteConfig, 'silent'); 
// --- FIM DA CORREÇÃO ---


// Define o valor padrão local
remoteConfig.defaultConfig = {
    'cadastro_disponivel': true,
};

// O fetchAndActivate agora será feito dentro do CadastroAlunoScreen
