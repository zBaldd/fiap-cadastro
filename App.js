import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
// SDK Web do Firebase - Importações limpas
import { onAuthStateChanged } from 'firebase/auth';
import { ref as dbRef, onValue } from 'firebase/database'; 

// Importa as instâncias configuradas (que contêm o 'auth' e o 'database')
import { auth, database } from './src/services/firebaseConfig';

// Importação das Telas: Garantindo que são 'export default'
// O erro de "Element type is invalid" é quase sempre corrigido garantindo 
// que estes componentes sejam o export default em seus respectivos arquivos.
import AuthScreen from './src/screens/AuthScreen';
import CadastroAlunoScreen from './src/screens/CadastroAlunoScreen';
import PerfilAlunoScreen from './src/screens/PerfilAlunoScreen'; 

export default function App() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    // null = carregando, false = não tem dados, true = tem dados
    const [hasAlunoData, setHasAlunoData] = useState(null); 

    // --- 1. Listener de Autenticação ---
    useEffect(() => {
        // Reinicia a verificação dos dados do aluno a cada troca de usuário
        const subscriber = onAuthStateChanged(auth, userState => {
            setUser(userState);
            setHasAlunoData(null); // Reinicia a verificação de dados ao trocar de usuário
            if (initializing) setInitializing(false);
        });
        return subscriber;
    }, []);

    // --- 2. Listener de Dados do Aluno (Decisão de Navegação) ---
    useEffect(() => {
        if (!user) {
            setHasAlunoData(false);
            return;
        }

        // Garante que o estado comece em null para mostrar o loading
        setHasAlunoData(null); 

        const alunoReference = dbRef(database, `alunos/${user.uid}`);
        
        // Verifica se existe um nó de dados para este usuário no Realtime DB
        const unsubscribe = onValue(alunoReference, (snapshot) => {
            // Se o snapshot existir (true), o aluno já cadastrou os dados
            setHasAlunoData(snapshot.exists()); 
        });

        // Limpa o listener ao sair ou trocar de usuário
        return () => unsubscribe(); 
    }, [user]); // Roda sempre que o estado do usuário muda

    // --- 3. Telas de Carregamento ---
    if (initializing || (user && hasAlunoData === null)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003366" />
                <Text style={styles.loadingText}>Carregando dados de perfil...</Text>
            </View>
        );
    }

    // --- 4. Renderização Principal ---
    if (!user) {
        // Usuário não autenticado: Mostra Login/Cadastro
        return <AuthScreen onAuthSuccess={() => setUser(auth.currentUser)} />;
    }

    // Usuário autenticado (Logado ou Recém-Cadastrado)
    if (hasAlunoData) {
        // Aluno JÁ TEM cadastro de dados: Vai para a tela de Perfil
        return <PerfilAlunoScreen onGoToCadastro={() => setHasAlunoData(false)} />;
    } else {
        // Aluno NÃO TEM cadastro de dados: Deve preencher
        // Passa a função para que o CadastroAlunosScreen avise que terminou o cadastro
        return <CadastroAlunoScreen onCadastroSuccess={() => setHasAlunoData(true)} />;
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    }
});

