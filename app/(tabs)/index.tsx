// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVISOS, VERSICULO_DO_DIA } from '@/constants/churchData';

export default function HomeScreen() {
  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/instagramdaigreja');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho Roxo com Logotipo */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo-igreja.png')} // Caminho para o seu logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subTitle}>Seja bem-vindo!</Text>
      </View>

      {/* Versículo do Dia */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={20} color="#6a1b9a" /> {/* Roxo escuro */}
          <Text style={styles.cardTitle}>Versículo do Dia</Text>
        </View>
        <Text style={styles.verseText}>"{VERSICULO_DO_DIA.texto}"</Text>
        <Text style={styles.verseRef}>- {VERSICULO_DO_DIA.ref}</Text>
      </View>

      {/* Botão Instagram (Cor Roxa Vibrante) */}
      <TouchableOpacity style={styles.instaButton} onPress={openInstagram}>
        <Ionicons name="logo-instagram" size={24} color="#fff" />
        <Text style={styles.instaButtonText}>Ver Instagram da Igreja</Text>
      </TouchableOpacity>

      {/* Quadro de Avisos */}
      <Text style={styles.sectionTitle}>Quadro de Avisos</Text>
      {AVISOS.map((aviso) => (
        <View key={aviso.id} style={styles.avisoCard}>
          <Text style={styles.avisoDate}>{aviso.data}</Text>
          <Text style={styles.avisoTitle}>{aviso.titulo}</Text>
          <Text style={styles.avisoDesc}>{aviso.descricao}</Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' }, // Fundo lilás bem claro
  header: {
    backgroundColor: '#4a148c', // Roxo escuro do fundo do logo
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center', // Centraliza o logo e o texto
    borderBottomLeftRadius: 30, // Borda arredondada
    borderBottomRightRadius: 30, // Borda arredondada
  },
  logo: {
    width: 120, // Largura do logo
    height: 120, // Altura do logo
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    color: '#e1bee7', // Lilás claro
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    marginTop: -25, // Sobe o card para cima do cabeçalho
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { marginLeft: 10, fontWeight: 'bold', color: '#4a148c', fontSize: 16 },
  verseText: { fontStyle: 'italic', fontSize: 16, color: '#4a148c', lineHeight: 24 },
  verseRef: { textAlign: 'right', marginTop: 10, fontWeight: 'bold', color: '#8e24aa' },
  instaButton: {
    backgroundColor: '#8e24aa', // Roxo médio vibrante
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  instaButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  sectionTitle: { marginLeft: 15, fontSize: 20, fontWeight: 'bold', color: '#4a148c', marginBottom: 15 },
  avisoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#8e24aa', // Roxo médio
    elevation: 2,
  },
  avisoDate: { fontSize: 12, color: '#7b1fa2', fontWeight: 'bold' },
  avisoTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 5, color: '#4a148c' },
  avisoDesc: { color: '#4a148c', lineHeight: 20 }
});