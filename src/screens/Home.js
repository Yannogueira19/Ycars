import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const destaques = [
  {
    id: 'fiat',
    nome: 'Fiat',
    descricao: 'Fiat é uma marca italiana conhecida por carros econômicos e populares no Brasil.',
    origem: 'Itália',
    fundacao: '1899',
  },
  {
    id: 'volkswagen',
    nome: 'Volkswagen',
    descricao: 'Volkswagen é uma das maiores fabricantes do mundo, conhecida pela qualidade e inovação.',
    origem: 'Alemanha',
    fundacao: '1937',
  },
  {
    id: 'chevrolet',
    nome: 'Chevrolet',
    descricao: 'Chevrolet é uma marca americana famosa pela diversidade de modelos e robustez.',
    origem: 'Estados Unidos',
    fundacao: '1911',
  },
];

const Home = () => {
  const navigation = useNavigation();

  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [carro, setCarro] = useState(null);

  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get('https://parallelum.com.br/fipe/api/v1/carros/marcas')
      .then((res) => setMarcas(res.data))
      .catch(() => Alert.alert('Erro ao carregar marcas'));
  }, []);

  useEffect(() => {
    if (!marcaSelecionada) return;

    setModelos([]);
    setModeloSelecionado('');
    setAnos([]);
    setAnoSelecionado('');
    setCarro(null);

    axios
      .get(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos`)
      .then((res) => setModelos(res.data.modelos))
      .catch(() => Alert.alert('Erro ao carregar modelos'));
  }, [marcaSelecionada]);

  useEffect(() => {
    if (!modeloSelecionado) return;

    setAnos([]);
    setAnoSelecionado('');
    setCarro(null);

    axios
      .get(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos/${modeloSelecionado}/anos`
      )
      .then((res) => setAnos(res.data))
      .catch(() => Alert.alert('Erro ao carregar anos'));
  }, [modeloSelecionado]);

  const buscarPrecoFipe = async () => {
    if (!marcaSelecionada || !modeloSelecionado || !anoSelecionado) {
      Alert.alert('Selecione marca, modelo e ano');
      return;
    }

    setLoading(true);
    setCarro(null);

    try {
      const res = await axios.get(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos/${modeloSelecionado}/anos/${anoSelecionado}`
      );

      setCarro(res.data);
    } catch (error) {
      console.error('Erro ao buscar dados FIPE:', error.message);
      Alert.alert('Erro ao buscar dados da Tabela FIPE');
    } finally {
      setLoading(false);
    }
  };

  // renderDestaque DENTRO do componente para usar navigation normalmente
  const renderDestaque = ({ item }) => (
    <TouchableOpacity
      style={styles.destaqueCard}
      onPress={() => navigation.navigate('MarcaInfo', { marca: item })}
    >
      <Text style={styles.destaqueTexto}>{item.nome}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Consultar Tabela Fipe</Text>

       {!loading && (
  <View style={styles.cardHistoria}>
    <Text style={styles.historia}>
      A Tabela Fipe expressa preços médios para pagamento à vista, praticados na revenda de veículos para o consumidor final, pessoa física, no mercado nacional, servindo apenas como um parâmetro para negociações ou avaliações. Os preços efetivamente praticados variam em função da região, conservação, cor, acessórios ou qualquer outro fator que possa influenciar as condições de oferta e procura por um veículo específico.
    </Text>
  </View>
)}
     
      <Picker
        selectedValue={marcaSelecionada}
        onValueChange={setMarcaSelecionada}
        style={styles.picker}
      >
        <Picker.Item label="Selecione uma marca" value="" />
        {marcas.map((marca) => (
          <Picker.Item key={marca.codigo} label={marca.nome} value={marca.codigo} />
        ))}
      </Picker>

      {modelos.length > 0 && (
        <Picker
          selectedValue={modeloSelecionado}
          onValueChange={setModeloSelecionado}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um modelo" value="" />
          {modelos.map((modelo) => (
            <Picker.Item key={modelo.codigo} label={modelo.nome} value={modelo.codigo} />
          ))}
        </Picker>
      )}

      {anos.length > 0 && (
        <Picker
          selectedValue={anoSelecionado}
          onValueChange={setAnoSelecionado}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um ano" value="" />
          {anos.map((ano) => (
            <Picker.Item key={ano.codigo} label={ano.nome} value={ano.codigo} />
          ))}
        </Picker>
      )}

      <TouchableOpacity style={styles.botao} onPress={buscarPrecoFipe}>
        <Text style={styles.botaoTexto}>Buscar</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}

      {carro && (
        <View style={styles.card}>
          <Text style={styles.nome}>{carro.Modelo}</Text>
          <Text style={styles.preco}>Preço FIPE: {carro.Valor}</Text>
          <Text style={styles.detalhes}>Ano: {carro.AnoModelo}</Text>
          <Text style={styles.detalhes}>Combustível: {carro.Combustivel}</Text>
          <Text style={styles.detalhes}>Código Fipe: {carro.CodigoFipe}</Text>
        </View>
      )}
   <Text style={styles.subtitulo}>As Marcas mais procuradas</Text>
 <FlatList
        data={destaques}
        keyExtractor={(item) => item.id}
        renderItem={renderDestaque}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.destaqueContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // seus estilos aqui, como no seu código original...
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  botao: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    alignItems: 'center',
  },
  preco: {
    fontSize: 16,
    color: '#007b00',
    marginTop: 4,
  },
  detalhes: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  destaqueContainer: {
    paddingBottom: 10,
    paddingLeft: 4,
  },
  destaqueCard: {
    backgroundColor: '#fff',
    padding: 24,
    marginRight: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destaqueTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historia: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  cardHistoria: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 30,
  // Shadow iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  // Elevation Android
  elevation: 6,
},
historia: {
  fontSize: 16,
  textAlign: 'center',
  color: '#555',
},

});

export default Home;
