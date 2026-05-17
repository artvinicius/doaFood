import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen               from '../screens/LoginScreen';
import CadastroScreen            from '../screens/CadastroScreen';
import CatalogoScreen            from '../screens/CatalogoScreen';
import DetalheScreen             from '../screens/DetalheScreen';
import PerfilScreen              from '../screens/PerfilScreen';
import PontosColetaScreen        from '../screens/PontosColetaScreen';
import EditarPerfilScreen        from '../screens/EditarPerfilScreen';
import TermosScreen              from '../screens/TermosScreen';
import AdminDashboardScreen      from '../screens/AdminDashboardScreen';
import AdminUsuariosScreen       from '../screens/AdminUsuariosScreen';
import AdminCriarUsuarioScreen   from '../screens/AdminCriarUsuarioScreen';
import OngCadastrarPontoScreen   from '../screens/OngCadastrarPontoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Login"           component={LoginScreen}        />
        <Stack.Screen name="Cadastro"        component={CadastroScreen}     />
        <Stack.Screen name="Catalogo"        component={CatalogoScreen}     />
        <Stack.Screen
          name="DoadorDetalhe"
          component={DetalheScreen}
          initialParams={{ tipo: 'doador' }}
        />
        <Stack.Screen
          name="ReceptorDetalhe"
          component={DetalheScreen}
          initialParams={{ tipo: 'receptor' }}
        />
        <Stack.Screen
          name="ONGDetalhe"
          component={DetalheScreen}
          initialParams={{ tipo: 'ong' }}
        />
        <Stack.Screen name="Perfil"              component={PerfilScreen}            />
        <Stack.Screen name="PontosColeta"        component={PontosColetaScreen}      />
        <Stack.Screen name="EditarPerfil"        component={EditarPerfilScreen}      />
        <Stack.Screen name="Termos"              component={TermosScreen}            />
        <Stack.Screen name="AdminDashboard"      component={AdminDashboardScreen}    />
        <Stack.Screen name="AdminUsuarios"       component={AdminUsuariosScreen}     />
        <Stack.Screen name="AdminCriarUsuario"   component={AdminCriarUsuarioScreen} />
        <Stack.Screen name="OngCadastrarPonto"   component={OngCadastrarPontoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
