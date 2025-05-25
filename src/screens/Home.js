import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { parseStringPromise } from 'xml2js';

const Home = () => {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [carro, setCarro] = useState(null);
  const [imagem, setImagem] = useState('');

  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');

  const [loading, setLoading] = useState(false);

  // Carregar marcas ao iniciar
  useEffect(() => {
    axios
      .get('https://parallelum.com.br/fipe/api/v1/carros/marcas')
      .then((res) => setMarcas(res.data))
      .catch(() => Alert.alert('Erro ao carregar marcas'));
  }, []);

  // Carregar modelos ao selecionar marca
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

  // Carregar anos ao selecionar modelo
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

  // Buscar imagem do carro
 const buscarImagem = async (termo) => {
  try {
    const res = await axios.get(
      `https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(termo)}`,
      { responseType: 'text' } // <-- isso evita o erro
    );

    const json = await parseStringPromise(res.data);
    const imagem = json.string._;

    if (!imagem || imagem.includes('no-image')) return '';

    return imagem;
  } catch (err) {
    console.error('Erro ao buscar imagem:', err.message);
    return '';
  }
};
 
const buscarPrecoFipe = async () => {
  if (!marcaSelecionada || !modeloSelecionado || !anoSelecionado) {
    Alert.alert('Selecione marca, modelo e ano');
    return;
  }

  setLoading(true);
  setCarro(null);
  setImagem('');

  try {
    const res = await axios.get(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos/${modeloSelecionado}/anos/${anoSelecionado}`
    );

   console.log('Dados retornados da FIPE:', res.data); // Veja se preço e nome estão vindo

    setCarro(res.data);

    const termoImagem = `${res.data.marca} ${res.data.modelo} ${res.data.anoModelo} car`;
    const img = await buscarImagem(termoImagem);

    console.log('🔍 Termo imagem:', termoImagem);
    console.log('🖼️ Imagem encontrada:', img);

    setImagem(img || '');
  } catch (error) {
    console.error('Erro ao buscar dados FIPE:', error.message);
    Alert.alert('Erro ao buscar dados da Tabela FIPE');
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Consulta Tabela FIPE</Text>

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
    {imagem ? (
      <Image source={{ uri: imagem }} style={styles.image} />
    ) : (
      <View style={[styles.image, styles.imagePlaceholder]}>
        <Text style={styles.placeholderText}>Imagem não encontrada</Text>
      </View>
    )}

    <Text style={styles.nome}>{carro.Modelo}</Text>
    <Text style={styles.preco}>Preço FIPE: {carro.Valor}</Text>
    <Text style={styles.detalhes}>Ano: {carro.AnoModelo}</Text>
    <Text style={styles.detalhes}>Combustível: {carro.Combustivel}</Text>
    <Text style={styles.detalhes}>Código Fipe: {carro.CodigoFipe}</Text>
  </View>
)}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  botao: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    fontWeight: 'bold',
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
  placeholderText: {
    color: '#888',
    fontSize: 14
  }
});

export default Home;
