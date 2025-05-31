// src/screens/Perfil.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { auth, db } from '../Config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native'; // Importar useFocusEffect

const Perfil = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    setLoading(true); // Garantir que o loading seja ativado ao recarregar
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          Alert.alert('Erro', 'Dados do usuário não encontrados.');
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error);
      Alert.alert('Erro', 'Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Usar useFocusEffect para recarregar os dados quando a tela ganhar foco
  // Isso é útil se os dados do perfil puderem ser alterados em outra parte do app
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logout', 'Você saiu da sua conta.');
      navigation.reset({ // Resetar o stack de navegação para a tela de Login
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}> {/* Usar um container específico ou o mesmo container se já centraliza */}
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!userData) { // Caso não haja dados do usuário após o carregamento
    return (
      <View style={styles.loadingContainer}>
        <Text>Não foi possível carregar os dados do usuário.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={loadUserData}>
            <Text style={styles.logoutText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: userData.profileImageUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} // Usar uma imagem de perfil do userData se existir
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        {userData?.createdAt && (
            <Text style={styles.createdAt}>
            Membro desde: {new Date(userData.createdAt).toLocaleDateString()}
            </Text>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Perfil;

const styles = StyleSheet.create({
  container: { // Este container é para o conteúdo da tela já carregada
    flex: 1,
    backgroundColor: '#eef2f5',
    justifyContent: 'center', // Centraliza o profileCard verticalmente
    alignItems: 'center', // Centraliza o profileCard horizontalmente
    padding: 20, // Corrigido de string para número
  },
  loadingContainer: { // Container para o estado de loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  profileCard: {
    backgroundColor: '#fff',
    width: '100%', // Ocupa a largura disponível respeitando o padding do container
    maxWidth: 400, // Largura máxima para o card
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#e0e0e0', // Cor de fundo caso a imagem demore a carregar
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});