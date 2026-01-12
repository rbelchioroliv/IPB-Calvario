// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVISOS, VERSICULO_DO_DIA, ANIVERSARIANTES } from '@/constants/churchData';

export default function HomeScreen() {
  const dataHoje = new Date();
  const mesAtual = dataHoje.getMonth() + 1; 
  
  const aniversariantesDoMes = ANIVERSARIANTES.filter(p => p.mes === mesAtual).sort((a, b) => a.dia - b.dia);

  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomesMeses[dataHoje.getMonth()];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo-igreja.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.churchName}>IPB Calvário</Text>
        <Text style={styles.subTitle}>Seja bem-vindo!</Text>
      </View>

      {/* Versículo do Dia */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={20} color="#6a1b9a" />
          <Text style={styles.cardTitle}>Versículo do Dia</Text>
        </View>
        <Text style={styles.verseText}>"{VERSICULO_DO_DIA.texto}"</Text>
        <Text style={styles.verseRef}>- {VERSICULO_DO_DIA.ref}</Text>
      </View>

      {/* Quadro de Avisos */}
      <Text style={styles.sectionTitle}>Quadro de Avisos</Text>
      {AVISOS.map((aviso) => (
        <View key={aviso.id} style={styles.avisoCard}>
          <Text style={styles.avisoDate}>{aviso.data}</Text>
          <Text style={styles.avisoTitle}>{aviso.titulo}</Text>
          <Text style={styles.avisoDesc}>{aviso.descricao}</Text>
        </View>
      ))}

      {/* Aniversariantes */}
      <View style={styles.bdaySection}>
        <View style={styles.bdayHeader}>
          <Ionicons name="gift-outline" size={24} color="#4a148c" />
          <Text style={styles.sectionTitleBday}>Aniversariantes de {nomeMesAtual}</Text>
        </View>

        {aniversariantesDoMes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aniversariante cadastrado neste mês.</Text>
        ) : (
          <View style={styles.bdayList}>
            {aniversariantesDoMes.map((pessoa) => (
              <View key={pessoa.id} style={styles.bdayItem}>
                {/* Mudança aqui: Etiqueta "Dia X" */}
                <View style={styles.bdayDateBox}>
                  <Text style={styles.bdayDay}>Dia {pessoa.dia}</Text>
                </View>
                <Text style={styles.bdayName}>{pessoa.nome}</Text>
                <Ionicons name="happy-outline" size={18} color="#9c27b0" />
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  header: {
    backgroundColor: '#4a148c',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { width: 100, height: 100, marginBottom: 5 },
  churchName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 2, marginTop: 5 },
  subTitle: { fontSize: 16, color: '#e1bee7', fontWeight: '600' },
  
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    marginTop: -25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { marginLeft: 10, fontWeight: 'bold', color: '#4a148c', fontSize: 16 },
  verseText: { fontStyle: 'italic', fontSize: 16, color: '#4a148c', lineHeight: 24 },
  verseRef: { textAlign: 'right', marginTop: 10, fontWeight: 'bold', color: '#8e24aa' },
  
  sectionTitle: { marginLeft: 15, fontSize: 20, fontWeight: 'bold', color: '#4a148c', marginBottom: 15, marginTop: 10 },
  avisoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#8e24aa',
    elevation: 2,
  },
  avisoDate: { fontSize: 12, color: '#7b1fa2', fontWeight: 'bold' },
  avisoTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 5, color: '#4a148c' },
  avisoDesc: { color: '#4a148c', lineHeight: 20 },

 
  bdaySection: { marginTop: 20, marginHorizontal: 15 },
  bdayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitleBday: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', marginLeft: 10 },
  bdayList: { backgroundColor: '#fff', borderRadius: 15, padding: 10, elevation: 2 },
  bdayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
 
  bdayDateBox: { 
    backgroundColor: '#f3e5f5', 
    paddingHorizontal: 12, 
    paddingVertical: 5,   
    borderRadius: 8,       
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15 
  },
  bdayDay: { fontWeight: 'bold', color: '#4a148c', fontSize: 14 },
  
  bdayName: { flex: 1, fontSize: 16, color: '#333' },
  emptyText: { fontStyle: 'italic', color: '#888', marginLeft: 5 }
});