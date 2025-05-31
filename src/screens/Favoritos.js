// src/screens/Favoritos.js
// src/screens/Favoritos.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../Config/firebaseconfig';
import { collection, query, doc, deleteDoc, getDocsFromServer } from 'firebase/firestore';

const Favoritos = () => {
  const [favoritedCars, setFavoritedCars] = useState([]);
  const [loading, setLoading] = useState(true); // Loading principal da lista
  const [refreshing, setRefreshing] = useState(false);
  const [unfavoritingCarId, setUnfavoritingCarId] = useState(null); // ID do carro sendo removido

  const fetchFavorites = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const q = query(favoritesRef);

      try {
        const querySnapshot = await getDocsFromServer(q);
        const cars = [];
        querySnapshot.forEach((doc) => {
          cars.push({ id: doc.id, ...doc.data() });
        });
        setFavoritedCars(cars);
      } catch (error) {
        console.error("Erro ao buscar favoritos: ", error);
        Alert.alert('Erro', 'Não foi possível carregar os favoritos.');
      } finally {
        if (showLoadingIndicator) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    } else {
      setFavoritedCars([]);
      if (showLoadingIndicator) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleUnfavorite = async (carId, carModelo) => {
    if (!auth.currentUser || unfavoritingCarId === carId) return; // Evita cliques múltiplos

    Alert.alert(
      "Confirmar Remoção",
      `Tem certeza que deseja remover ${carModelo} dos favoritos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setUnfavoritingCarId(carId); // Define o carro que está sendo removido
            const userId = auth.currentUser.uid;
            const favRef = doc(db, 'users', userId, 'favorites', carId);
            try {
              await deleteDoc(favRef);
              setFavoritedCars(prevCars => prevCars.filter(car => car.id !== carId));
              // Alert.alert('Removido', `${carModelo} removido dos favoritos.`); // Opcional, pode ser redundante
            } catch (error) {
              console.error("Erro ao remover favorito: ", error);
              Alert.alert('Erro', 'Não foi possível remover o favorito.');
            } finally {
              setUnfavoritingCarId(null); // Limpa o ID após a operação
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites(false);
  }, [fetchFavorites]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      </View>
    );
  }

  if (favoritedCars.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Você ainda não tem carros favoritos. 🚗</Text>
        <Text style={styles.emptySubText}>Volte para a tela inicial e adicione alguns!</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isUnfavoriting = unfavoritingCarId === item.id;
    return (
      <View style={styles.card}>
        <Text style={styles.nome}>{item.Modelo}</Text>
        <Text style={styles.preco}>Valor: {item.Valor}</Text>
        <Text style={styles.detalhes}>Ano: {item.AnoModelo}</Text>
        <Text style={styles.detalhes}>Combustível: {item.Combustivel}</Text>
        <Text style={styles.detalhes}>Código Fipe: {item.CodigoFipe}</Text>
        <TouchableOpacity
          style={[styles.unfavoriteButton, isUnfavoriting && styles.buttonDisabled]}
          onPress={() => handleUnfavorite(item.id, item.Modelo)}
          disabled={isUnfavoriting}
        >
          {isUnfavoriting ? (
            <ActivityIndicator size="small" color="#cc0000" />
          ) : (
            <Text style={styles.unfavoriteButtonText}>💔 Remover</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={favoritedCars}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={favoritedCars.length === 0 ? styles.centered : styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]}/>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  listContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  preco: {
    fontSize: 16,
    color: '#007b00',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  detalhes: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  unfavoriteButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffdddd',
    borderColor: '#ff5555',
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minWidth: 100, // Garante um tamanho mínimo para o botão
    alignItems: 'center', // Centraliza o ActivityIndicator
    justifyContent: 'center', // Centraliza o ActivityIndicator
  },
  unfavoriteButtonText: {
    color: '#cc0000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#ffe5e5', // Cor mais clara quando desabilitado
  },
});

export default Favoritos;