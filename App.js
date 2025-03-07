import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { MovieProvider } from './src/context/MovieContext';
import AppNavigator from './src/navigation/AppNavigator'; // Your navigation component

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <MovieProvider>
          <AppNavigator />
        </MovieProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
