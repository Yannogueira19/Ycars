// src/screens/Home.js
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
import { auth, db } from '../Config/firebaseconfig';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const destaques = [
  {
    id: 'fiat',
    nome: 'Fiat',
    descricao: 'A Fiat, fundada em 1899 em Turim, Itália, é uma das marcas automotivas mais tradicionais do mundo. Chegou ao Brasil em 1976 e se destacou com modelos populares como Uno e Strada. Hoje, integra o grupo Stellantis e investe em inovação e mobilidade sustentável.',
    origem: 'Itália',
    fundacao: '1899',
    fundador: 'Giovanni Agnelli (1866–1945)',
    sedeAtual: 'Turim, Itália',
    ceo: 'Antonio Filosa'
  },
  {
    id: 'volkswagen',
    nome: 'Volkswagen',
    descricao: 'A Volkswagen é uma fabricante alemã de automóveis fundada em 1937. É conhecida por modelos icônicos como o Fusca e o Golf, e é uma das maiores montadoras do mundo, destacando-se pela qualidade, inovação e engenharia.',
    origem: 'Alemanha',
    fundacao: '1937',
    fundador: 'Deutsche Arbeitsfront',
    sedeAtual: 'Wolfsburg, Alemanha',
    ceo: 'Oliver Blume'
  },
  {
    id: 'chevrolet',
    nome: 'Chevrolet',
    descricao: 'A Chevrolet é uma fabricante de automóveis americana fundada em 1911. É uma das principais marcas da General Motors (GM) e é conhecida por modelos populares como o Camaro, Onix e Silverado. Destaca-se por sua ampla presença global e diversidade de veículos.',
    origem: 'Estados Unidos',
    fundacao: '1911',
    fundador: 'Louis Chevrolet e William C. Durant',
    sedeAtual: 'Detroit, Michigan, EUA',
    ceo: 'Mary Barra'
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

  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingCarro, setLoadingCarro] = useState(false);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavoriteCheck, setLoadingFavoriteCheck] = useState(false);
  const [loadingFavoriteToggle, setLoadingFavoriteToggle] = useState(false);

  useEffect(() => {
    setLoadingMarcas(true);
    axios
      .get('https://parallelum.com.br/fipe/api/v1/carros/marcas')
      .then((res) => setMarcas(res.data))
      .catch(() => Alert.alert('Erro', 'Erro ao carregar marcas'))
      .finally(() => setLoadingMarcas(false));
  }, []);

  useEffect(() => {
    if (!marcaSelecionada) {
        setModelos([]);
        setModeloSelecionado('');
        return;
    };
    setLoadingModelos(true);
    setModelos([]);
    setModeloSelecionado('');
    setAnos([]);
    setAnoSelecionado('');
    setCarro(null);
    setIsFavorited(false);
    axios
      .get(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos`)
      .then((res) => setModelos(res.data.modelos))
      .catch(() => Alert.alert('Erro', 'Erro ao carregar modelos'))
      .finally(() => setLoadingModelos(false));
  }, [marcaSelecionada]);

  useEffect(() => {
    if (!modeloSelecionado) {
        setAnos([]);
        setAnoSelecionado('');
        return;
    }
    setLoadingAnos(true);
    setAnos([]);
    setAnoSelecionado('');
    setCarro(null);
    setIsFavorited(false);
    axios
      .get(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos/${modeloSelecionado}/anos`
      )
      .then((res) => setAnos(res.data))
      .catch(() => Alert.alert('Erro', 'Erro ao carregar anos'))
      .finally(() => setLoadingAnos(false));
  }, [modeloSelecionado, marcaSelecionada]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (carro && auth.currentUser) {
        setLoadingFavoriteCheck(true);
        try {
          const userId = auth.currentUser.uid;
          const carId = String(carro.CodigoFipe).replace(/\W/g, '');
          const favRef = doc(db, 'users', userId, 'favorites', carId);
          const docSnap = await getDoc(favRef);
          setIsFavorited(docSnap.exists());
        } catch (error) {
          console.error("Erro ao checar favorito:", error);
        } finally {
          setLoadingFavoriteCheck(false);
        }
      } else {
        setIsFavorited(false);
      }
    };
    checkFavoriteStatus();
  }, [carro]);


  const buscarPrecoFipe = async () => {
    if (!marcaSelecionada || !modeloSelecionado || !anoSelecionado) {
      Alert.alert('Atenção', 'Selecione marca, modelo e ano.');
      return;
    }
    setLoadingCarro(true);
    setCarro(null);
    setIsFavorited(false);
    try {
      const res = await axios.get(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos/${modeloSelecionado}/anos/${anoSelecionado}`
      );
      setCarro(res.data);
    } catch (error) {
      console.error('Erro ao buscar dados FIPE:', error.message);
      Alert.alert('Erro', 'Erro ao buscar dados da Tabela FIPE.');
    } finally {
      setLoadingCarro(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!carro || !auth.currentUser) {
      Alert.alert('Erro', 'Nenhum carro selecionado ou usuário não logado.');
      return;
    }
    setLoadingFavoriteToggle(true);
    const userId = auth.currentUser.uid;
    const carId = String(carro.CodigoFipe).replace(/\W/g, '');
    const favRef = doc(db, 'users', userId, 'favorites', carId);
    try {
      if (isFavorited) {
        await deleteDoc(favRef);
        setIsFavorited(false);
        Alert.alert('Removido', `${carro.Modelo} removido dos favoritos.`);
      } else {
        await setDoc(favRef, { ...carro, favoritedAt: new Date().toISOString() });
        setIsFavorited(true);
        Alert.alert('Favoritado!', `${carro.Modelo} adicionado aos favoritos.`);
      }
    } catch (error) {
      console.error("Erro ao favoritar/desfavoritar:", error);
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos.');
    } finally {
      setLoadingFavoriteToggle(false);
    }
  };

  const renderDestaque = ({ item }) => (
    <TouchableOpacity
      style={styles.destaqueCard}
      onPress={() => navigation.navigate('MarcaInfo', { marca: item })}
    >
      <Text style={styles.destaqueTexto}>{item.nome}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Consultar Tabela Fipe</Text>
        <View style={styles.cardHistoria}>
            <Text style={styles.historia}>
            A Tabela Fipe expressa preços médios para pagamento à vista, praticados na revenda de veículos para o consumidor final, pessoa física, no mercado nacional, servindo apenas como um parâmetro para negociações ou avaliações. Os preços efetivamente praticados variam em função da região, conservação, cor, acessórios ou qualquer outro fator que possa influenciar as condições de oferta e procura por um veículo específico.
            </Text>
        </View>
     
      <View style={styles.pickerContainer}>
        {loadingMarcas && <ActivityIndicator style={styles.pickerLoading} size="small" color="#007bff" />}
        <Picker
            selectedValue={marcaSelecionada}
            onValueChange={(itemValue) => setMarcaSelecionada(itemValue)}
            style={styles.picker}
            enabled={!loadingMarcas}
        >
            <Picker.Item label="Selecione uma marca" value="" />
            {marcas.map((marca) => (
            <Picker.Item key={marca.codigo} label={marca.nome} value={marca.codigo} />
            ))}
        </Picker>
      </View>
      
      {marcaSelecionada && (
        <View style={styles.pickerContainer}>
          {loadingModelos && <ActivityIndicator style={styles.pickerLoading} size="small" color="#007bff" />}
          <Picker
            selectedValue={modeloSelecionado}
            onValueChange={(itemValue) => setModeloSelecionado(itemValue)}
            style={styles.picker}
            enabled={!loadingModelos && modelos.length > 0}
          >
            <Picker.Item label={modelos.length === 0 && !loadingModelos ? "Nenhum modelo encontrado" : "Selecione um modelo"} value="" />
            {modelos.map((modelo) => (
              <Picker.Item key={modelo.codigo} label={modelo.nome} value={modelo.codigo} />
            ))}
          </Picker>
        </View>
      )}

      {modeloSelecionado && (
        <View style={styles.pickerContainer}>
          {loadingAnos && <ActivityIndicator style={styles.pickerLoading} size="small" color="#007bff" />}
          <Picker
            selectedValue={anoSelecionado}
            onValueChange={(itemValue) => setAnoSelecionado(itemValue)}
            style={styles.picker}
            enabled={!loadingAnos && anos.length > 0}
          >
            <Picker.Item label={anos.length === 0 && !loadingAnos ? "Nenhum ano encontrado" : "Selecione um ano"} value="" />
            {anos.map((ano) => (
              <Picker.Item key={ano.codigo} label={ano.nome} value={ano.codigo} />
            ))}
          </Picker>
        </View>
      )}

      <TouchableOpacity style={[styles.botao, (loadingCarro || !anoSelecionado) && styles.botaoDesabilitado]} onPress={buscarPrecoFipe} disabled={loadingCarro || !anoSelecionado}>
        {loadingCarro ? (
            <ActivityIndicator size="small" color="#fff" />
        ) : (
            <Text style={styles.botaoTexto}>Buscar</Text>
        )}
      </TouchableOpacity>

      {carro && (
        <View style={styles.card}>
          <Text style={styles.nome}>{carro.Modelo}</Text>
          <Text style={styles.preco}>Preço FIPE: {carro.Valor}</Text>
          <Text style={styles.detalhes}>Ano: {carro.AnoModelo}</Text>
          <Text style={styles.detalhes}>Combustível: {carro.Combustivel}</Text>
          <Text style={styles.detalhes}>Código Fipe: {carro.CodigoFipe}</Text>
          
          {/* --- Ícone de Coração Clicável --- */}
          <TouchableOpacity
            style={styles.favoriteIconContainer} // Novo estilo para o container do ícone
            onPress={handleToggleFavorite}
            disabled={loadingFavoriteToggle || loadingFavoriteCheck} // Desabilita durante o carregamento
          >
            {loadingFavoriteToggle || loadingFavoriteCheck ? (
                <ActivityIndicator size="large" color="#007bff"/> // Indicador de carregamento
            ) : (
                <Text style={styles.heartIcon}>
                  {isFavorited ? '❤️' : '🤍'} {/* Apenas o ícone do coração */}
                </Text>
            )}
          </TouchableOpacity>
          {/* --- Fim do Ícone de Coração Clicável --- */}
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
  // ... (todos os seus estilos anteriores permanecem aqui) ...
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
  pickerContainer: {
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {},
  pickerLoading: {
    position: 'absolute',
    alignSelf: 'center',
  },
  botao: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  botaoDesabilitado: {
    backgroundColor: '#a0cfff',
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
    alignItems: 'center', // Mantém os itens do card centralizados, incluindo o coração
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  preco: {
    fontSize: 16,
    color: '#007b00',
    marginTop: 4,
    fontWeight: 'bold',
  },
  detalhes: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  cardHistoria: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  historia: {
    fontSize: 16,
    textAlign: 'justify',
    color: '#555',
    lineHeight: 24,
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
    // ... (outros estilos de destaqueCard)
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  destaqueTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- Novos estilos para o ícone de coração ---
  favoriteIconContainer: {
    marginTop: 15, // Espaçamento acima do ícone
    padding: 10,    // Área de toque ao redor do ícone
    // Se quiser posicionar o ícone no canto do card, você usaria position: 'absolute'
    // Por exemplo:
    // position: 'absolute',
    // top: 10,
    // right: 10,
    // zIndex: 1, // Para garantir que fique sobre outros elementos se necessário
  },
  heartIcon: {
    fontSize: 30, // Tamanho do ícone de coração (emoji)
    // As cores dos emojis ❤️ e 🤍 já são definidas.
    // Se usasse um ícone de fonte, poderia definir a cor aqui:
    // color: isFavorited ? 'red' : 'grey',
  },
  // --- Fim dos novos estilos ---

  // Estilo antigo do botão de favorito que não é mais necessário para o ícone:
  // favoriteButton: { ... },
  // favoriteButtonText: { ... },
});

export default Home;