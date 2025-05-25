import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../Config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const Perfil = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
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
      console.error(error);
      Alert.alert('Erro', 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logout', 'Você saiu da sua conta.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout.');
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil do Usuário</Text>
      <Text style={styles.label}>Nome: {userData?.name}</Text>
      <Text style={styles.label}>Email: {userData?.email}</Text>
      <Text style={styles.label}>Criado em: {new Date(userData?.createdAt).toLocaleString()}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Sair" color="#ff3b30" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default Perfil;
