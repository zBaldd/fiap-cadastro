import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { ref as dbRef, set } from 'firebase/database';
import { getValue, fetchAndActivate, setLogLevel } from 'firebase/remote-config'; 
import { signOut } from 'firebase/auth'; 
import { auth, database, remoteConfig } from '../services/firebaseConfig'; 

const CadastroAlunoScreen = ({ onCadastroSuccess }) => { 
    
    const [nome, setNome] = useState('');
    const [sobrenome, setSobsobrenome] = useState('');
    const [idade, setIdade] = useState('');
    const [matricula, setMatricula] = useState('');
    const [curso, setCurso] = useState('');
    const [estagio, setEstagio] = useState('');
    const [celular, setCelular] = useState('');
    const [imageUri, setImageUri] = useState(null);
    
    const [isCadastroAvailable, setIsCadastroAvailable] = useState(true); 
    const [isLoading, setIsLoading] = useState(false);

  
    const userEmail = auth.currentUser?.email || 'N/A';
    const userId = auth.currentUser?.uid;

   
    useEffect(() => {
        const checkAvailability = async () => {
            
            
            try {
            
                setLogLevel(remoteConfig, 'silent'); 
            } catch (logError) {
               
            }

            try {
               
                remoteConfig.settings.fetchTimeoutMillis = 5000;
                
                
                await fetchAndActivate(remoteConfig);
                
                const available = getValue(remoteConfig, 'cadastro_disponivel').asBoolean();
                setIsCadastroAvailable(available);

                if (!available) {
                    Alert.alert("Aviso", "O cadastro de alunos está temporariamente indisponível (Remote Config).");
                }
            } catch (error) {
                
                console.warn("Remote Config falhou na busca. Usando valor padrão local. (Erro IndexedDB esperado)", error);
            }
        };
        checkAvailability();
    }, []);

   
    const pickImage = async (useCamera) => {
        let result;
        let permissionResult;

        // Solicita permissão da Câmera ou Galeria
        if (useCamera) {
            permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permissão Necessária", "É preciso permissão para usar a câmera.");
                return;
            }
            // Abre a Câmera
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });
        } else {
            permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permissão Necessária", "É preciso permissão para acessar a galeria.");
                return;
            }
            // Abre a Galeria
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });
        }

        if (!result.canceled) {
            setImageUri(result.assets[0].uri); 
        }
    };

   
    const handleCadastro = async () => {
        if (isLoading) return;
        
        
        if (!nome || !matricula || !imageUri) {
            Alert.alert("Erro", "Preencha Nome, Matrícula e selecione uma Foto.");
            return;
        }

        if (!isCadastroAvailable) {
             Alert.alert("Aviso", "O cadastro está indisponível (Remote Config).");
             return;
        }
        
        setIsLoading(true);
        
        try {
           
            const photoURL = imageUri; 

            
            const alunoData = {
                uid: userId,
                nome,
                sobrenome,
                idade: parseInt(idade) || 0,
                matricula,
                curso,
                email: userEmail,
                estagio,
                celular,
                
                photoURL: photoURL, 
                dataCadastro: new Date().toISOString(),
            };

            //  Salvar no Realtime Database (Requisito principal)
            const alunoReference = dbRef(database, `alunos/${userId}`);
            await set(alunoReference, alunoData);

            Alert.alert("Sucesso!", "Aluno cadastrado e dados salvos!"); 
            
           
            if (onCadastroSuccess) {
                onCadastroSuccess(); 
            }

        } catch (error) {
            console.error("Erro no Cadastro:", error);
            Alert.alert("Erro", `Falha ao cadastrar aluno. Verifique as Regras de Segurança.`); 
        } finally {
            setIsLoading(false);
        }
    };
    
    // Função para fazer logout
    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Cadastro de Aluno FIAP</Text>
                <Text style={styles.subtitle}>Complete seu perfil para acessar o sistema.</Text>

                {isLoading && <ActivityIndicator size="large" color="#003366" style={{marginBottom: 20}} />}

                {/* --- Campos de Input (Requisito) --- */}
                <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Sobrenome" value={sobrenome} onChangeText={setSobsobrenome} style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Matrícula" value={matricula} onChangeText={setMatricula} keyboardType="numeric" style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Curso" value={curso} onChangeText={setCurso} style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Estágio (Sim/Não)" value={estagio} onChangeText={setEstagio} style={styles.input} editable={!isLoading} />
                <TextInput placeholder="Celular" value={celular} onChangeText={setCelular} keyboardType="phone-pad" style={styles.input} editable={!isLoading} />

                {/* --- Área de Foto (Requisito) --- */}
                <View style={styles.photoContainer}>
                    <Text style={styles.photoLabel}>Adicionar Foto do Usuário (Local):</Text>
                    {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
                    <View style={styles.buttonRow}>
                        <Button title="Câmera" onPress={() => pickImage(true)} disabled={isLoading} color="#0066cc" />
                        <View style={{ width: 10 }} />
                        <Button title="Galeria" onPress={() => pickImage(false)} disabled={isLoading} color="#0066cc" />
                    </View>
                </View>

                {/* --- Botão de Cadastro e Logout --- */}
                <View style={{ height: 20 }} />
                <Button
                    title={isLoading ? "Salvando..." : "Salvar Cadastro e Acessar Perfil"}
                    onPress={handleCadastro}
                    disabled={isLoading || !isCadastroAvailable} 
                    color="#003366"
                />
                <View style={{ height: 20 }} />
                 <Button
                    title="Logout"
                    onPress={handleLogout}
                    color="#e74c3c"
                />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    scrollContainer: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#003366',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        fontSize: 16,
    },
    photoContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    photoLabel: {
        marginBottom: 10,
        fontWeight: '600',
        color: '#333',
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
        backgroundColor: '#eee',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    }
});

export default CadastroAlunoScreen;
