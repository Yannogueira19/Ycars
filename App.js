import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from './src/screens/Login';
import Registro from './src/screens/Registro';
import Home from './src/screens/Home';      // ✅ nova tela
import Perfil from './src/screens/Perfil';  // ✅ manter
import MarcaInfo from './src/screens/MarcaInfo';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator()

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
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

const DrawerRoutes = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen name="Home" component={HomeStack} />
    <Drawer.Screen name="Perfil" component={Perfil} />
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
          component={DrawerRoutes}
          options={{ headerShown: false }}
        />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
