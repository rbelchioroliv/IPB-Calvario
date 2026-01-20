// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Contextos
import { AdminProvider } from '@/context/AdminContext';
import { ThemeProvider } from '@/context/ThemeContext'; // <--- Import Novo

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Animação da Splash Screen (MANTIDA)
  const fadeAnim = useRef(new Animated.Value(0)).current;  
  const scaleAnim = useRef(new Animated.Value(0.8)).current; 

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, 
        duration: 3000, 
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, 
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAppIsReady(true);
    });
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <Animated.Image
          source={require('@/assets/images/logo-igreja.png')} 
          style={[
            styles.logo,
            {
              opacity: fadeAnim, 
              transform: [{ scale: scaleAnim }] 
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // --- AQUI ENVOLVEMOS COM O THEME PROVIDER ---
  return (
    <ThemeProvider>
      <AdminProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Telas principais (Abas) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          {/* Nova rota para o Painel Administrativo */}
          <Stack.Screen name="admin" options={{ headerShown: false }} />
        </Stack>
      </AdminProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#4a148c', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250, 
    height: 250,
  },
});