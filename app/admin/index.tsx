import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.subTitle}>O que você deseja gerenciar hoje?</Text>

        {/* BOTÃO: AVISOS */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/add_aviso')}>
          <View style={[styles.iconBox, { backgroundColor: '#bf360c' }]}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.menuText}>Novo Aviso</Text>
            <Text style={styles.menuDesc}>Publicar no quadro de avisos da home</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* BOTÃO: EVENTOS */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/add_evento')}>
          <View style={[styles.iconBox, { backgroundColor: '#4a148c' }]}>
            <Ionicons name="calendar-outline" size={24} color="#fff" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.menuText}>Novo Evento</Text>
            <Text style={styles.menuDesc}>Agendar cultos ou reuniões na agenda</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* BOTÃO: ANIVERSARIANTES */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/add_niver')}>
          <View style={[styles.iconBox, { backgroundColor: '#00796b' }]}>
            <Ionicons name="gift-outline" size={24} color="#fff" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.menuText}>Aniversariante</Text>
            <Text style={styles.menuDesc}>Cadastrar novo membro na lista do mês</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* NOVO BOTÃO: DADOS BANCÁRIOS */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/edit_donate')}>
          <View style={[styles.iconBox, { backgroundColor: '#ff9800' }]}>
            <Ionicons name="card-outline" size={24} color="#fff" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.menuText}>Dados Bancários e PIX</Text>
            <Text style={styles.menuDesc}>Alterar conta para dízimos e QR Code</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { marginTop: 40 }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={[styles.menuText, { color: '#666', marginLeft: 10 }]}>Voltar ao App</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4a148c', marginTop: 20 },
  subTitle: { fontSize: 16, color: '#666', marginBottom: 30 },

  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  textBox: { flex: 1 },
  menuText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  menuDesc: { fontSize: 13, color: '#999', marginTop: 2 }
});