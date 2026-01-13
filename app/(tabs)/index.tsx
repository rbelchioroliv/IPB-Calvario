import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VERSICULO_DO_DIA } from '@/constants/churchData'; 
import { db } from '@/services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function HomeScreen() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dataHoje = new Date();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomesMeses[dataHoje.getMonth()];

  const carregarDados = async () => {
    try {
      // Buscar Avisos
      const avisosRef = collection(db, "avisos");
      const avisosSnapshot = await getDocs(avisosRef);
      const listaAvisos = avisosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvisos(listaAvisos);

      // Buscar Aniversariantes
      const niverRef = collection(db, "aniversariantes");
      const niverSnapshot = await getDocs(niverRef);
      const listaNiver = niverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Filtrar apenas do mês atual
      const mesAtualNum = dataHoje.getMonth() + 1;
      const filtrados = listaNiver
        .filter(p => p.mes === mesAtualNum)
        .sort((a, b) => a.dia - b.dia);
      
      setAniversariantes(filtrados);

    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDados();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4a148c" />
        <Text style={{marginTop: 10}}>Carregando informações...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo-igreja.png')} style={styles.logo} resizeMode="contain"/>
        <Text style={styles.churchName}>IPB Calvário</Text>
        <Text style={styles.subTitle}>Seja bem-vindo!</Text>
      </View>

      {/* Versículo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={20} color="#6a1b9a" />
          <Text style={styles.cardTitle}>Versículo do Dia</Text>
        </View>
        <Text style={styles.verseText}>"{VERSICULO_DO_DIA.texto}"</Text>
        <Text style={styles.verseRef}>- {VERSICULO_DO_DIA.ref}</Text>
      </View>

      {/* Quadro de Avisos (FIREBASE) */}
      <Text style={styles.sectionTitle}>Quadro de Avisos</Text>
      {avisos.length === 0 ? (
        <View style={styles.emptyContainer}>
           <Ionicons name="notifications-off-outline" size={40} color="#ccc" />
           <Text style={styles.emptyText}>Nenhum aviso cadastrado.</Text>
        </View>
      ) : (
        avisos.map((aviso) => (
          <View key={aviso.id} style={styles.avisoCard}>
            <Text style={styles.avisoDate}>{aviso.data}</Text>
            <Text style={styles.avisoTitle}>{aviso.titulo}</Text>
            <Text style={styles.avisoDesc}>{aviso.descricao}</Text>
          </View>
        ))
      )}

      {/* Aniversariantes (FIREBASE) */}
      <View style={styles.bdaySection}>
        <View style={styles.bdayHeader}>
          <Ionicons name="gift-outline" size={24} color="#4a148c" />
          <Text style={styles.sectionTitleBday}>Aniversariantes de {nomeMesAtual}</Text>
        </View>

        {aniversariantes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aniversariante encontrado neste mês.</Text>
        ) : (
          <View style={styles.bdayList}>
            {aniversariantes.map((pessoa) => (
              <View key={pessoa.id} style={styles.bdayItem}>
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
  header: { backgroundColor: '#4a148c', padding: 20, paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logo: { width: 100, height: 100, marginBottom: 5 },
  churchName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 2, marginTop: 5 },
  subTitle: { fontSize: 16, color: '#e1bee7', fontWeight: '600' },
  card: { backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 15, marginTop: -25, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { marginLeft: 10, fontWeight: 'bold', color: '#4a148c', fontSize: 16 },
  verseText: { fontStyle: 'italic', fontSize: 16, color: '#4a148c', lineHeight: 24 },
  verseRef: { textAlign: 'right', marginTop: 10, fontWeight: 'bold', color: '#8e24aa' },
  sectionTitle: { marginLeft: 15, fontSize: 20, fontWeight: 'bold', color: '#4a148c', marginBottom: 15, marginTop: 10 },
  avisoCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: '#8e24aa', elevation: 2 },
  avisoDate: { fontSize: 12, color: '#7b1fa2', fontWeight: 'bold' },
  avisoTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 5, color: '#4a148c' },
  avisoDesc: { color: '#4a148c', lineHeight: 20 },
  bdaySection: { marginTop: 20, marginHorizontal: 15 },
  bdayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitleBday: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', marginLeft: 10 },
  bdayList: { backgroundColor: '#fff', borderRadius: 15, padding: 10, elevation: 2 },
  bdayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bdayDateBox: { backgroundColor: '#f3e5f5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  bdayDay: { fontWeight: 'bold', color: '#4a148c', fontSize: 14 },
  bdayName: { flex: 1, fontSize: 16, color: '#333' },
  emptyText: { fontStyle: 'italic', color: '#888', marginLeft: 5 },
  emptyContainer: { alignItems: 'center', padding: 20 }
});