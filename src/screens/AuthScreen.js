import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../services/firebaseConfig'; 

const AuthScreen = ({ onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Erro de Validação", "Preencha email e senha.");
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                
                await signInWithEmailAndPassword(auth, email, password);
                Alert.alert("Sucesso", "Login realizado com sucesso!");
                onAuthSuccess(); 
            } else {
                
                await createUserWithEmailAndPassword(auth, email, password);
                
               
                Alert.alert("Sucesso", "Conta criada! Prossiga com o Cadastro de Aluno."); 
                onAuthSuccess(); 
            }
        } catch (error) {
            let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";

            if (error.code === 'auth/invalid-credential') {
                 errorMessage = 'Login falhou. Credenciais inválidas ou usuário não cadastrado.';
            } else if (error.code === 'auth/email-already-in-use') {
                
                errorMessage = 'Este email já está cadastrado. Faça o login na aba ao lado.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O email é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                 errorMessage = 'Usuário não encontrado ou senha incorreta.';
            }

            Alert.alert(isLogin ? "Erro no Login" : "Erro no Cadastro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>{isLogin ? 'Login FIAP' : 'Cadastrar Usuário'}</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />
                
                <Button
                    title={isLoading ? "Aguarde..." : (isLogin ? "Logar" : "Cadastrar Usuário")}
                    onPress={handleAuth}
                    disabled={isLoading}
                />
                <View style={{ height: 10 }} /> 
                <Button
                    title={isLogin ? "Mudar para Cadastro" : "Mudar para Login"}
                    onPress={toggleAuthMode}
                    color="#ff0000ff"
                    disabled={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        fontSize: 16,
    },
});

export default AuthScreen;

