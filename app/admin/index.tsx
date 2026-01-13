import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminMenu() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Painel Administrativo</Text>
      <Text style={styles.subTitle}>O que deseja adicionar hoje?</Text>

      {/* --- BOTÃO 1: EVENTOS --- */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/add_evento')}>
        <View style={[styles.iconBox, { backgroundColor: '#e1bee7' }]}>
          <Ionicons name="calendar" size={32} color="#4a148c" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Adicionar Eventos</Text>
          <Text style={styles.cardDesc}>Agenda, cultos especiais, congressos.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      {/* --- BOTÃO 2: AVISOS --- */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/add_aviso')}>
        <View style={[styles.iconBox, { backgroundColor: '#ffccbc' }]}>
          <Ionicons name="megaphone" size={32} color="#bf360c" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Adicionar Avisos</Text>
          <Text style={styles.cardDesc}>Comunicados gerais para a igreja.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      {/* --- BOTÃO 3: ANIVERSARIANTES --- */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/add_niver')}>
        <View style={[styles.iconBox, { backgroundColor: '#b3e5fc' }]}>
          <Ionicons name="gift" size={32} color="#01579b" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Adicionar Aniversariante</Text>
          <Text style={styles.cardDesc}>Cadastrar membro e data de nascimento.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 5 },
  subTitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 12, color: '#888', marginTop: 2 }
});