import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, Modal, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import { CacheService } from '@/services/CacheService';
import { LISTA_HINOS_OFFLINE } from '@/constants/lista_hinos'; 
import { BIBLIA_NVI } from '@/constants/biblia_nvi'; 
import { API_TOKEN } from '@/constants/churchData';
import { LIVROS_BIBLIA, CAPITULOS_POR_LIVRO, ABREVIACOES, VERSOES_BIBLIA } from '@/constants/books';

// IMPORT DO TEMA
import { useTheme } from '@/context/ThemeContext';

export default function BibleScreen() {
  const router = useRouter();
  const { livroAutomatico, capituloAutomatico } = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const [tab, setTab] = useState<'hinario' | 'biblia'>('biblia');
  const [isOnline, setIsOnline] = useState(true);

  // Estados Bíblia
  const [versaoSelecionada, setVersaoSelecionada] = useState('nvi');
  const [livroSelecionado, setLivroSelecionado] = useState('Gênesis');
  const [capitulo, setCapitulo] = useState(1);
  const [versiculos, setVersiculos] = useState<any[]>([]);
  const [loadingBible, setLoadingBible] = useState(false);

  // Modais
  const [modalLivroVisible, setModalLivroVisible] = useState(false);
  const [modalCapituloVisible, setModalCapituloVisible] = useState(false);
  const [modalVersaoVisible, setModalVersaoVisible] = useState(false);
  const [buscaLivro, setBuscaLivro] = useState('');
  const [livrosFiltrados, setLivrosFiltrados] = useState(LIVROS_BIBLIA);

  // Estados Hinário
  const [hinos, setHinos] = useState<any[]>([]);
  const [hinosFiltrados, setHinosFiltrados] = useState<any[]>([]);
  const [buscaHino, setBuscaHino] = useState('');
  const [loadingHinos, setLoadingHinos] = useState(false);
  const [hinoLeitura, setHinoLeitura] = useState<any>(null);
  const [modalHinoVisible, setModalHinoVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const conectado = !!state.isConnected && !!state.isInternetReachable;
      setIsOnline(conectado);
      if (!conectado) setVersaoSelecionada('nvi'); 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (livroAutomatico && capituloAutomatico) {
      const livroRaw = Array.isArray(livroAutomatico) ? livroAutomatico[0] : livroAutomatico;
      const capRaw = Array.isArray(capituloAutomatico) ? capituloAutomatico[0] : capituloAutomatico;
      if (typeof livroRaw === 'string') { setLivroSelecionado(livroRaw); setTab('biblia'); }
      if (capRaw && !isNaN(Number(capRaw))) setCapitulo(Number(capRaw));
      router.setParams({ livroAutomatico: undefined, capituloAutomatico: undefined });
    }
  }, [livroAutomatico, capituloAutomatico]);

  useEffect(() => {
    if (buscaLivro.trim() === '') setLivrosFiltrados(LIVROS_BIBLIA);
    else setLivrosFiltrados(LIVROS_BIBLIA.filter(l => l.toLowerCase().includes(buscaLivro.toLowerCase())));
  }, [buscaLivro]);

  const buscarBiblia = async () => {
    setLoadingBible(true);
    const abrev = ABREVIACOES[livroSelecionado] || 'gn';
    try {
      if (isOnline) {
        const url = `https://www.abibliadigital.com.br/api/verses/${versaoSelecionada}/${abrev}/${capitulo}`;
        const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' } });
        if (response.status === 403) throw new Error("Erro Permissão API");
        const data = await response.json();
        setVersiculos(data && data.verses ? data.verses : []);
      } else {
        const livroEncontrado = BIBLIA_NVI.find((l: any) => l.abbrev === abrev);
        if (livroEncontrado && livroEncontrado.chapters[capitulo - 1]) {
          setVersiculos(livroEncontrado.chapters[capitulo - 1].map((texto: string, index: number) => ({ number: index + 1, text: texto })));
        } else {
          setVersiculos([]);
        }
      }
    } catch (error) {
      setVersiculos([]);
    } finally {
      setLoadingBible(false);
    }
  };

  useEffect(() => { if (tab === 'biblia') buscarBiblia(); }, [livroSelecionado, capitulo, versaoSelecionada, tab, isOnline]);

  useEffect(() => {
    const carregarHinos = async () => {
      setLoadingHinos(true);
      if (LISTA_HINOS_OFFLINE && LISTA_HINOS_OFFLINE.length > 0) {
        const listaFormatada = LISTA_HINOS_OFFLINE.map(h => ({ id: h.id, numero: h.numeroOrdenacao, titulo: h.title, letra: h.text }));
        const listaOrdenada = listaFormatada.sort((a, b) => a.numero - b.numero);
        setHinos(listaOrdenada);
        setHinosFiltrados(listaOrdenada);
      }
      setLoadingHinos(false);
    };
    carregarHinos();
  }, []);

  useEffect(() => {
    if (buscaHino.trim() === '') setHinosFiltrados(hinos);
    else setHinosFiltrados(hinos.filter(h => h.titulo?.toLowerCase().includes(buscaHino.toLowerCase()) || h.numero?.toString().includes(buscaHino.toLowerCase()) || h.letra?.toLowerCase().includes(buscaHino.toLowerCase())));
  }, [buscaHino, hinos]);

  const renderVersiculo = (item: any) => (
    <View style={styles.verseContainer}>
      <Text style={[styles.verseNumber, { color: colors.accent }]}>{item.number}</Text>
      <Text style={[styles.verseText, { color: colors.text }]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Palavra & Louvor</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.tabItem, tab === 'biblia' && { borderBottomColor: colors.accent }]} onPress={() => setTab('biblia')}>
          <Text style={[styles.tabText, { color: tab === 'biblia' ? colors.accent : colors.textSecondary }]}>Bíblia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'hinario' && { borderBottomColor: colors.accent }]} onPress={() => setTab('hinario')}>
          <Text style={[styles.tabText, { color: tab === 'hinario' ? colors.accent : colors.textSecondary }]}>Hinário</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'biblia' ? (
          <View style={{ flex: 1 }}>
            {!isOnline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={14} color="#fff" />
                <Text style={styles.offlineText}>Modo Offline (NVI)</Text>
              </View>
            )}

            <View style={styles.bibleControls}>
              <TouchableOpacity style={[styles.versionButton, { backgroundColor: isOnline ? colors.primary : colors.textSecondary }]} onPress={() => isOnline && setModalVersaoVisible(true)} disabled={!isOnline}>
                <Text style={styles.versionLabel}>{isOnline ? versaoSelecionada.toUpperCase() : 'NVI'}</Text>
                {isOnline && <Ionicons name="chevron-down" size={12} color="#fff" />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.selectorButton, { backgroundColor: colors.card }]} onPress={() => { setBuscaLivro(''); setModalLivroVisible(true); }}>
                <Text style={styles.selectorLabel}>Livro</Text>
                <Text style={[styles.selectorValue, { color: colors.primary }]} numberOfLines={1}>{livroSelecionado}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.selectorButton, { backgroundColor: colors.card, flex: 0.4 }]} onPress={() => setModalCapituloVisible(true)}>
                <Text style={styles.selectorLabel}>Cap.</Text>
                <Text style={[styles.selectorValue, { color: colors.primary }]}>{capitulo}</Text>
              </TouchableOpacity>
            </View>

            {loadingBible ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
              <ScrollView style={[styles.bibleTextContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.bibleTitle, { color: colors.primary, borderBottomColor: colors.border }]}>{livroSelecionado} {capitulo}</Text>
                {versiculos.length > 0 ? (
                  versiculos.map((v, index) => <View key={index}>{renderVersiculo(v)}</View>)
                ) : (
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>Texto não encontrado.</Text>
                )}
                <View style={{ height: 50 }} />
              </ScrollView>
            )}

            <Modal visible={modalVersaoVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContentSmall, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.primary }]}>Escolha a Versão</Text>
                  {VERSOES_BIBLIA.map((v) => (
                    <TouchableOpacity key={v.sigla} style={[styles.versionItem, { borderBottomColor: colors.border }]} onPress={() => { setVersaoSelecionada(v.sigla); setModalVersaoVisible(false); }}>
                      <Text style={[styles.versionItemText, { color: colors.text, fontWeight: versaoSelecionada === v.sigla ? 'bold' : 'normal' }]}>{v.nome}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.border }]} onPress={() => setModalVersaoVisible(false)}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancelar</Text></TouchableOpacity>
                </View>
              </View>
            </Modal>
            
            <Modal visible={modalLivroVisible} animationType="slide" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.primary }]}>Selecionar Livro</Text><TouchableOpacity onPress={() => setModalLivroVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
                  <View style={[styles.searchBoxModal, { backgroundColor: colors.inputBg }]}><Ionicons name="search" size={20} color={colors.textSecondary} /><TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Buscar..." placeholderTextColor={colors.textSecondary} value={buscaLivro} onChangeText={setBuscaLivro} /></View>
                  <FlatList data={livrosFiltrados} keyExtractor={item => item} renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setLivroSelecionado(item); setCapitulo(1); setModalLivroVisible(false); }}>
                      <Text style={[styles.modalItemText, { color: item === livroSelecionado ? colors.primary : colors.text }]}>{item}</Text>
                    </TouchableOpacity>
                  )} />
                </View>
              </View>
            </Modal>

            <Modal visible={modalCapituloVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.primary }]}>Capítulo</Text><TouchableOpacity onPress={() => setModalCapituloVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
                  <ScrollView><View style={styles.gridContainer}>
                    {Array.from({ length: CAPITULOS_POR_LIVRO[livroSelecionado] || 50 }, (_, i) => i + 1).map((num) => (
                      <TouchableOpacity key={num} style={[styles.gridItem, { backgroundColor: num === capitulo ? colors.primary : (isDark ? colors.border : '#f3e5f5') }]} onPress={() => { setCapitulo(num); setModalCapituloVisible(false); }}>
                        <Text style={[styles.gridText, { color: num === capitulo ? '#fff' : colors.primary }]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View></ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Buscar hino..." placeholderTextColor={colors.textSecondary} value={buscaHino} onChangeText={setBuscaHino} />
              {buscaHino.length > 0 && <TouchableOpacity onPress={() => setBuscaHino('')}><Ionicons name="close-circle" size={20} color={colors.textSecondary} /></TouchableOpacity>}
            </View>

            {loadingHinos ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} /> : (
              <FlatList
                data={hinosFiltrados}
                keyExtractor={(item, index) => String(index)}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: colors.textSecondary }}>Nenhum hino encontrado.</Text>}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.hinoItem, { backgroundColor: colors.card }]} onPress={() => { setHinoLeitura(item); setModalHinoVisible(true); }}>
                    <View style={[styles.hinoNumberCircle, { backgroundColor: isDark ? colors.background : '#f3e5f5' }]}><Text style={[styles.hinoNumber, { color: colors.primary }]}>{item.numero}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.hinoTitle, { color: colors.primary }]}>{item.titulo}</Text>
                      <Text numberOfLines={1} style={[styles.hinoPreview, { color: colors.textSecondary }]}>{item.letra ? item.letra.replace(/\n/g, ' ') : ''}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                  </TouchableOpacity>
                )}
              />
            )}

            <Modal visible={modalHinoVisible} animationType="slide" transparent={false} presentationStyle="pageSheet">
              <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={[styles.hinoModalHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setModalHinoVisible(false)} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={30} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.hinoModalHeaderTitle, { color: colors.textSecondary }]}>Leitura do Hino</Text>
                  <View style={{ width: 30 }} />
                </View>
                {hinoLeitura && (
                  <ScrollView contentContainerStyle={styles.hinoModalContent}>
                    <View style={[styles.hinoBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.hinoBadgeText}>Nº {hinoLeitura.numero}</Text>
                    </View>
                    <Text style={[styles.hinoFullTitle, { color: colors.text }]}>{hinoLeitura.titulo}</Text>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.hinoFullLyrics, { color: colors.text }]}>{hinoLeitura.letra}</Text>
                    <View style={{ height: 100 }} />
                  </ScrollView>
                )}
              </SafeAreaView>
            </Modal>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 10 },
  header: { padding: 20, borderBottomWidth: 1, marginTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  offlineBanner: { backgroundColor: '#666', padding: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginBottom: 10 },
  offlineText: { color: '#fff', fontSize: 12, marginLeft: 5, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', elevation: 2 },
  tabItem: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 15, elevation: 1 },
  searchBoxModal: { flexDirection: 'row', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  bibleControls: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  versionButton: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginRight: 8, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  versionLabel: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginRight: 5 },
  selectorButton: { flex: 1, marginRight: 8, padding: 8, borderRadius: 8, elevation: 1, justifyContent: 'center' },
  selectorLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  selectorValue: { fontSize: 14, fontWeight: 'bold' },
  bibleTextContainer: { flex: 1, borderRadius: 10, padding: 15, elevation: 2 },
  bibleTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, paddingBottom: 10 },
  verseContainer: { flexDirection: 'row', marginBottom: 12 },
  verseNumber: { fontSize: 12, fontWeight: 'bold', width: 25, marginTop: 4, textAlign: 'right', marginRight: 8 },
  verseText: { fontSize: 18, lineHeight: 28, flex: 1, textAlign: 'justify' },
  hinoItem: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 12, elevation: 1 },
  hinoNumberCircle: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  hinoNumber: { fontWeight: 'bold', fontSize: 16 },
  hinoTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  hinoPreview: { fontSize: 14 },
  hinoModalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  hinoModalHeaderTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },
  hinoModalContent: { padding: 30, alignItems: 'center' },
  hinoBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
  hinoBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hinoFullTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  hinoFullLyrics: { fontSize: 20, lineHeight: 34, textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: '80%', borderRadius: 15, padding: 20 },
  modalContentSmall: { width: '80%', borderRadius: 15, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1 },
  modalItemText: { fontSize: 18 },
  versionItem: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  versionItemText: { fontSize: 16 },
  closeButton: { marginTop: 15, padding: 12, borderRadius: 8, alignItems: 'center' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  gridItem: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', margin: 6 },
  gridText: { fontSize: 16, fontWeight: 'bold' },
  divider: { width: 50, height: 4, borderRadius: 2, marginBottom: 30 },
});