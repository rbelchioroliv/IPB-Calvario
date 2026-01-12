// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Valores iniciais para a animação
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Começa transparente (Opacidade 0)
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Começa um pouco menor (Escala 0.8)

  useEffect(() => {
    // Inicia a animação assim que o app abre
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Vai para opacidade total
        duration: 3000, // Demora 3 segundos (carregamento lento e elegante)
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Cresce para o tamanho original
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Quando a animação termina, libera o app
      setAppIsReady(true);
    });
  }, []);

  // SE o app ainda não estiver pronto, mostra a tela de carregamento (Splash)
  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <Animated.Image
          source={require('@/assets/images/logo-igreja.png')} // Certifique-se que o nome do arquivo está igual
          style={[
            styles.logo,
            {
              opacity: fadeAnim, // Aplica o efeito de transparência
              transform: [{ scale: scaleAnim }] // Aplica o efeito de crescimento
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // SE já carregou, mostra o App normal
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#4a148c', // Fundo Roxo Escuro (Mesmo do cabeçalho)
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250, // Tamanho do logo na abertura
    height: 250,
  },
});