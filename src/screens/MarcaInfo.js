import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MarcaInfo = ({ route }) => {
  const { marca } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{marca.nome}</Text>
      <Text style={styles.descricao}>{marca.descricao}</Text>
      <Text style={styles.info}>Origem: {marca.origem}</Text>
      <Text style={styles.info}>Fundação: {marca.fundacao}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
  descricao: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  info: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
});

export default MarcaInfo;
