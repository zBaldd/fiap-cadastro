import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Button } from 'react-native';
import { ref as dbRef, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from '../services/firebaseConfig';

const PerfilAlunoScreen = ({ onGoToCadastro }) => {
    const [alunoData, setAlunoData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        // Referência no Realtime Database para buscar os dados do aluno
        const alunoReference = dbRef(database, `alunos/${userId}`);
        
    
        const unsubscribe = onValue(alunoReference, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setAlunoData(data);
            } else {
                setAlunoData(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar dados do aluno:", error);
            setIsLoading(false);
        });

        
        return () => unsubscribe();
    }, [userId]);

    const handleLogout = () => {
        signOut(auth);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003366" />
                <Text style={styles.subtitle}>Carregando perfil...</Text>
            </View>
        );
    }
    
    
    if (!alunoData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.title}>Perfil Não Encontrado</Text>
                <Text style={styles.subtitle}>Parece que você ainda não completou seu cadastro de aluno.</Text>
                <Button title="Completar Cadastro Agora" onPress={onGoToCadastro} color="#0066cc" />
                <View style={{ height: 20 }} />
                <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Perfil do Aluno FIAP</Text>
                <Text style={styles.subHeader}>Logado como: {auth.currentUser?.email}</Text>

                <View style={styles.card}>
                    <DetailRow label="Nome Completo" value={`${alunoData.nome} ${alunoData.sobrenome}`} />
                    <DetailRow label="Matrícula" value={alunoData.matricula} />
                    <DetailRow label="Curso" value={alunoData.curso} />
                    <DetailRow label="Idade" value={alunoData.idade} />
                    <DetailRow label="Estágio" value={alunoData.estagio} />
                    <DetailRow label="Celular" value={alunoData.celular} />
                    <DetailRow label="E-mail de Cadastro" value={alunoData.email} />
                </View>

                <View style={{ height: 30 }} />
                <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
            </ScrollView>
        </SafeAreaView>
    );
};

// Componente auxiliar para exibir detalhes
const DetailRow = ({ label, value }) => (
    <View style={rowStyles.row}>
        <Text style={rowStyles.label}>{label}:</Text>
        <Text style={rowStyles.value}>{value}</Text>
    </View>
);

const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        maxWidth: '60%',
        textAlign: 'right',
    }
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f0f0f0',
    },
    container: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#003366',
    },
    subHeader: {
        fontSize: 14,
        color: '#999',
        marginBottom: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
});

export default PerfilAlunoScreen;