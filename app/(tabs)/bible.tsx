import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { HINARIO } from '@/constants/churchData';

export default function BibleScreen() {
  const [tab, setTab] = useState<'hinario' | 'biblia'>('hinario');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Palavra & Louvor</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabItem, tab === 'biblia' && styles.activeTab]} onPress={() => setTab('biblia')}>
          <Text style={[styles.tabText, tab === 'biblia' && styles.activeTabText]}>Bíblia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'hinario' && styles.activeTab]} onPress={() => setTab('hinario')}>
          <Text style={[styles.tabText, tab === 'hinario' && styles.activeTabText]}>Hinário</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'hinario' ? (
          <FlatList
            data={HINARIO}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.hinoItem}>
                <View style={styles.hinoNumberCircle}>
                  <Text style={styles.hinoNumber}>{item.numero}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.hinoTitle}>{item.titulo}</Text>
                  <Text numberOfLines={1} style={styles.hinoPreview}>{item.letra}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.bibliaContainer}>
             <Text style={styles.infoText}>Aqui entrará a API da Bíblia.</Text>
             <TouchableOpacity style={styles.readButton}>
               <Text style={styles.readButtonText}>Ler João 1</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' }, // Lilás claro
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1bee7', marginTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', textAlign: 'center' }, // Roxo escuro
  tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tabItem: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#7b1fa2' }, // Roxo médio
  tabText: { fontWeight: 'bold', color: '#999' },
  activeTabText: { color: '#7b1fa2' },
  content: { flex: 1, padding: 10 },
  hinoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 12 },
  hinoNumberCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  hinoNumber: { fontWeight: 'bold', color: '#4a148c' },
  hinoTitle: { fontWeight: 'bold', fontSize: 16, color: '#4a148c' },
  hinoPreview: { color: '#777' },
  bibliaContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { textAlign: 'center', color: '#666', marginBottom: 20 },
  readButton: { backgroundColor: '#7b1fa2', padding: 15, borderRadius: 8 },
  readButtonText: { color: '#fff', fontWeight: 'bold' }
});