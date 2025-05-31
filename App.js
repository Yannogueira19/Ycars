// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { Alert, View } from 'react-native'; // Adicionar Alert e View
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView, // Importar para customizar o conteúdo do drawer
  DrawerItemList,          // Importar para renderizar os itens de tela padrão
  DrawerItem,              // Importar para adicionar um item de drawer customizado
} from '@react-navigation/drawer';

// Importe suas telas
import Login from './src/screens/Login';
import Registro from './src/screens/Registro';
import Home from './src/screens/Home';
import Perfil from './src/screens/Perfil';
import MarcaInfo from './src/screens/MarcaInfo';
import Favoritos from './src/screens/Favoritos';

// Importe a configuração do Firebase e a função de signOut
import { auth } from './src/Config/firebaseconfig'; //
import { signOut } from 'firebase/auth'; //

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const HomeFeaturesNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ConsultaFipe"
      component={Home}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MarcaInfo"
      component={MarcaInfo}
      options={{ title: 'Informações da Marca' }}
    />
  </Stack.Navigator>
);

// Componente de conteúdo customizado para o Drawer
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    try {
      await signOut(auth); //
      Alert.alert('Logout', 'Você saiu da sua conta.'); //
      // Navegar para a tela de Login e resetar o stack de navegação
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Garante que o usuário volte para a tela de Login
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout.'); //
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {/* Adiciona uma linha divisória visual */}
      <View
        style={{
          borderBottomColor: '#e0e0e0',
          borderBottomWidth: 1,
          marginVertical: 10,
          marginHorizontal: 16,
        }}
      />
      <DrawerItem
        label="Sair"
        onPress={handleLogout}
        // Você pode adicionar um ícone aqui se desejar, usando a prop `icon`
        // icon={({ color, size }) => ( /* Seu componente de ícone aqui */ )}
        labelStyle={{ fontWeight: 'bold', color: '#d9534f' }} // Estilo para o texto "Sair"
      />
    </DrawerContentScrollView>
  );
}

const AppDrawer = () => (
  <Drawer.Navigator
    initialRouteName="Início"
    drawerContent={(props) => <CustomDrawerContent {...props} />} // Usar o conteúdo customizado
    screenOptions={{
      // headerStyle: { backgroundColor: '#007bff' },
      // headerTintColor: '#fff',
    }}
  >
    <Drawer.Screen
      name="Início"
      component={HomeFeaturesNavigator}
      options={{ title: 'Home' }}
    />
    <Drawer.Screen
      name="Meus Favoritos"
      component={Favoritos}
      options={{ title: 'Meus Favoritos' }}
    />
    <Drawer.Screen
      name="Meu Perfil"
      component={Perfil}
      options={{ title: 'Meu Perfil' }}
    />
    {/* O item "Sair" não é uma Drawer.Screen, mas sim um DrawerItem dentro do CustomDrawerContent */}
  </Drawer.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={AppDrawer}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;