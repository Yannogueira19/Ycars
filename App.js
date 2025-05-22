import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Registro from './screens/Registro';

const Stack = createStackNavigator();

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
        options={{headerShown: false}}
        />
        {/* Adicione outras telas aqui, como 'Home' e 'Register' */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
