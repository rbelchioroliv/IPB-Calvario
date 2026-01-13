import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, TextInput, ActivityIndicator, Modal, ScrollView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { API_TOKEN } from '@/constants/churchData'; 
import { db } from '@/services/firebaseConfig';     
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LIVROS_BIBLIA, CAPITULOS_POR_LIVRO, ABREVIACOES, VERSOES_BIBLIA } from '@/constants/books';

export default function BibleScreen() {
  const params = useLocalSearchParams();

  const [tab, setTab] = useState<'hinario' | 'biblia'>('biblia');
  
  // --- BÍBLIA ---
  const [versaoSelecionada, setVersaoSelecionada] = useState('nvi'); 
  const [livroSelecionado, setLivroSelecionado] = useState('Gênesis');
  const [capitulo, setCapitulo] = useState(1);
  const [versiculos, setVersiculos] = useState<any[]>([]);
  const [loadingBible, setLoadingBible] = useState(false);
  
  // Modais Bíblia
  const [modalLivroVisible, setModalLivroVisible] = useState(false);
  const [modalCapituloVisible, setModalCapituloVisible] = useState(false);
  const [modalVersaoVisible, setModalVersaoVisible] = useState(false);
  const [buscaLivro, setBuscaLivro] = useState('');
  const [livrosFiltrados, setLivrosFiltrados] = useState(LIVROS_BIBLIA);

  // --- HINÁRIO ---
  const [hinos, setHinos] = useState<any[]>([]); 
  const [hinosFiltrados, setHinosFiltrados] = useState<any[]>([]);
  const [buscaHino, setBuscaHino] = useState('');
  const [loadingHinos, setLoadingHinos] = useState(false);

  // Leitura Hino
  const [hinoLeitura, setHinoLeitura] = useState<any>(null);
  const [modalHinoVisible, setModalHinoVisible] = useState(false);

  // Efeito Navegação da Home
  useEffect(() => {
    if (params.livroAutomatico && params.capituloAutomatico) {
      const livro = Array.isArray(params.livroAutomatico) ? params.livroAutomatico[0] : params.livroAutomatico;
      const cap = Number(params.capituloAutomatico);
      setLivroSelecionado(livro);
      setCapitulo(cap);
      setTab('biblia'); 
    }
  }, [params]);

  // Filtro Livros
  useEffect(() => {
    if (buscaLivro.trim() === '') {
      setLivrosFiltrados(LIVROS_BIBLIA);
    } else {
      setLivrosFiltrados(LIVROS_BIBLIA.filter(l => l.toLowerCase().includes(buscaLivro.toLowerCase())));
    }
  }, [buscaLivro]);

  // Buscar API Bíblia
  const buscarBiblia = async () => {
    setLoadingBible(true);
    try {
      const abrev = ABREVIACOES[livroSelecionado] || 'gn';
      const url = `https://www.abibliadigital.com.br/api/verses/${versaoSelecionada}/${abrev}/${capitulo}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 403) {
        Alert.alert("Erro de Permissão", "Verifique o Token ou use a versão ACF.");
        setVersiculos([]);
        return;
      }

      const data = await response.json();
      if (!data || !data.verses) {
        setVersiculos([]);
      } else {
        setVersiculos(data.verses);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha na conexão.");
    } finally {
      setLoadingBible(false);
    }
  };

  useEffect(() => {
    if (tab === 'biblia') {
      buscarBiblia();
    }
  }, [livroSelecionado, capitulo, versaoSelecionada, tab]);

  // Carregar Hinário do Firebase
  useEffect(() => {
    const carregarHinos = async () => {
      setLoadingHinos(true);
      try {
        const q = query(collection(db, "hinos"), orderBy("numero")); 
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHinos(lista);
        setHinosFiltrados(lista);
      } catch (error) {
        console.log("Erro hinos:", error);
      } finally {
        setLoadingHinos(false);
      }
    };
    carregarHinos();
  }, []);

  // Filtro Hinário
  useEffect(() => {
    if (buscaHino.trim() === '') {
      setHinosFiltrados(hinos);
    } else {
      const termo = buscaHino.toLowerCase();
      
      const filtrados = hinos.filter(h => 
        h.titulo?.toLowerCase().includes(termo) || 
        h.numero?.toString().includes(termo) ||
        h.letra?.toLowerCase().includes(termo)
      );
      setHinosFiltrados(filtrados);
    }
  }, [buscaHino, hinos]);

  const renderVersiculo = (item: any) => (
    <View style={styles.verseContainer}>
      <Text style={styles.verseNumber}>{item.number}</Text>
      <Text style={styles.verseText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Palavra & Louvor</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabItem, tab === 'biblia' && styles.activeTab]} onPress={() => setTab('biblia')}>
          <Text style={[styles.tabText, tab === 'biblia' && styles.activeTabText]}>Bíblia Online</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'hinario' && styles.activeTab]} onPress={() => setTab('hinario')}>
          <Text style={[styles.tabText, tab === 'hinario' && styles.activeTabText]}>Hinário</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'biblia' ? (
          <View style={{ flex: 1 }}>
            <View style={styles.bibleControls}>
              <TouchableOpacity style={styles.versionButton} onPress={() => setModalVersaoVisible(true)}>
                <Text style={styles.versionLabel}>{versaoSelecionada.toUpperCase()}</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.selectorButton} onPress={() => { setBuscaLivro(''); setModalLivroVisible(true); }}>
                <Text style={styles.selectorLabel}>Livro</Text>
                <Text style={styles.selectorValue} numberOfLines={1}>{livroSelecionado}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.selectorButton, { flex: 0.4 }]} onPress={() => setModalCapituloVisible(true)}>
                <Text style={styles.selectorLabel}>Cap.</Text>
                <Text style={styles.selectorValue}>{capitulo}</Text>
              </TouchableOpacity>
            </View>

            {loadingBible ? (
              <ActivityIndicator size="large" color="#4a148c" style={{ marginTop: 50 }} />
            ) : (
              <ScrollView style={styles.bibleTextContainer}>
                <Text style={styles.bibleTitle}>{livroSelecionado} {capitulo}</Text>
                {versiculos.length > 0 ? (
                  versiculos.map((v, index) => <View key={index}>{renderVersiculo(v)}</View>)
                ) : (
                  <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Selecione um texto para ler.</Text>
                )}
                <View style={{height: 50}}/>
              </ScrollView>
            )}

            {/* Modais da Bíblia */}
             <Modal visible={modalVersaoVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContentSmall}>
                  <Text style={styles.modalTitle}>Escolha a Versão</Text>
                  {VERSOES_BIBLIA.map((v) => (
                     <TouchableOpacity key={v.sigla} style={styles.versionItem} onPress={() => { setVersaoSelecionada(v.sigla); setModalVersaoVisible(false); }}>
                       <Text style={[styles.versionItemText, versaoSelecionada === v.sigla && { fontWeight: 'bold', color: '#4a148c' }]}>{v.nome}</Text>
                     </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVersaoVisible(false)}><Text style={styles.closeButtonText}>Cancelar</Text></TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal visible={modalLivroVisible} animationType="slide" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}><Text style={styles.modalTitle}>Selecionar Livro</Text><TouchableOpacity onPress={() => setModalLivroVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
                  <View style={styles.searchBoxModal}><Ionicons name="search" size={20} color="#666" /><TextInput style={styles.searchInput} placeholder="Buscar..." value={buscaLivro} onChangeText={setBuscaLivro} /></View>
                  <FlatList data={livrosFiltrados} keyExtractor={item => item} renderItem={({ item }) => (
                      <TouchableOpacity style={styles.modalItem} onPress={() => { setLivroSelecionado(item); setCapitulo(1); setModalLivroVisible(false); }}>
                        <Text style={[styles.modalItemText, item === livroSelecionado && { color: '#4a148c', fontWeight: 'bold' }]}>{item}</Text>
                      </TouchableOpacity>
                    )} />
                </View>
              </View>
            </Modal>
            <Modal visible={modalCapituloVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}><Text style={styles.modalTitle}>Capítulo</Text><TouchableOpacity onPress={() => setModalCapituloVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
                  <ScrollView><View style={styles.gridContainer}>
                      {Array.from({ length: CAPITULOS_POR_LIVRO[livroSelecionado] || 50 }, (_, i) => i + 1).map((num) => (
                        <TouchableOpacity key={num} style={[styles.gridItem, num === capitulo && styles.gridItemActive]} onPress={() => { setCapitulo(num); setModalCapituloVisible(false); }}>
                          <Text style={[styles.gridText, num === capitulo && styles.gridTextActive]}>{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View></ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Busca Hinário */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Buscar hino..." value={buscaHino} onChangeText={setBuscaHino} />
              {buscaHino.length > 0 && <TouchableOpacity onPress={() => setBuscaHino('')}><Ionicons name="close-circle" size={20} color="#999" /></TouchableOpacity>}
            </View>
            
            {loadingHinos ? <ActivityIndicator size="large" color="#4a148c" style={{marginTop: 50}} /> : (
              <FlatList 
                data={hinosFiltrados} 
                keyExtractor={item => item.id || Math.random().toString()} 
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#999'}}>Nenhum hino encontrado.</Text>}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.hinoItem}
                    onPress={() => {
                      setHinoLeitura(item);
                      setModalHinoVisible(true);
                    }}
                  >
                    <View style={styles.hinoNumberCircle}><Text style={styles.hinoNumber}>{item.numero}</Text></View>
                    <View style={{flex: 1}}>
                        <Text style={styles.hinoTitle}>{item.titulo}</Text>
                        
                        
                        <Text numberOfLines={1} style={styles.hinoPreview}>
                            {item.letra ? item.letra.replace(/\n/g, ' ') : ''}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )} 
              />
            )}

            {/* Modal de Leitura do Hino */}
            <Modal visible={modalHinoVisible} animationType="slide" transparent={false} presentationStyle="pageSheet">
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                <View style={styles.hinoModalHeader}>
                  <TouchableOpacity onPress={() => setModalHinoVisible(false)} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={30} color="#4a148c" />
                  </TouchableOpacity>
                  <Text style={styles.hinoModalHeaderTitle}>Leitura do Hino</Text>
                  <View style={{width: 30}} /> 
                </View>

                {hinoLeitura && (
                  <ScrollView contentContainerStyle={styles.hinoModalContent}>
                    <View style={styles.hinoBadge}>
                       <Text style={styles.hinoBadgeText}>Nº {hinoLeitura.numero}</Text>
                    </View>
                    
                    <Text style={styles.hinoFullTitle}>{hinoLeitura.titulo}</Text>
                    
                    <View style={styles.divider} />
                    
                    
                    <Text style={styles.hinoFullLyrics}>{hinoLeitura.letra}</Text>
                    
                    <View style={{height: 100}} />
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

  // GERAL E ESTRUTURA
  container: { 
    flex: 1, 
    backgroundColor: '#f3e5f5' 
  },
  content: { 
    flex: 1, 
    padding: 10 
  },
  divider: { 
    width: 50, 
    height: 4, 
    backgroundColor: '#e1bee7', 
    borderRadius: 2, 
    marginBottom: 30 
  },

 
  // CABEÇALHO (HEADER)

  header: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e1bee7', 
    marginTop: 30 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4a148c', 
    textAlign: 'center' 
  },

  // ABAS (TABS)
  tabs: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    elevation: 2 
  },
  tabItem: { 
    flex: 1, 
    padding: 15, 
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent' 
  },
  activeTab: { 
    borderBottomColor: '#7b1fa2' 
  },
  tabText: { 
    fontWeight: 'bold', 
    color: '#999' 
  },
  activeTabText: { 
    color: '#7b1fa2' 
  },

  // COMPONENTES DE BUSCA
  searchBox: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 10, 
    alignItems: 'center', 
    marginBottom: 15, 
    elevation: 1 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 16, 
    color: '#333' 
  },

  // BÍBLIA: CONTROLES E TEXTO
  bibleControls: { 
    flexDirection: 'row', 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  versionButton: { 
    backgroundColor: '#4a148c', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginRight: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 2 
  },
  versionLabel: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14, 
    marginRight: 5 
  },
  selectorButton: { 
    flex: 1, 
    marginRight: 8, 
    backgroundColor: '#fff', 
    padding: 8, 
    borderRadius: 8, 
    elevation: 1, 
    justifyContent: 'center' 
  },
  selectorLabel: { 
    fontSize: 10, 
    color: '#888', 
    marginBottom: 2 
  },
  selectorValue: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#4a148c' 
  },
  bibleTextContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15, 
    elevation: 2 
  },
  bibleTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4a148c', 
    marginBottom: 20, 
    textAlign: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 10 
  },
  verseContainer: { 
    flexDirection: 'row', 
    marginBottom: 12 
  },
  verseNumber: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#7b1fa2', 
    width: 25, 
    marginTop: 4, 
    textAlign: 'right', 
    marginRight: 8 
  },
  verseText: { 
    fontSize: 18, 
    lineHeight: 28, 
    color: '#333', 
    flex: 1, 
    textAlign: 'justify' 
  },

  
  // HINÁRIO: LISTA
  hinoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 12, 
    elevation: 1 
  },
  hinoNumberCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 25, 
    backgroundColor: '#f3e5f5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  hinoNumber: { 
    fontWeight: 'bold', 
    color: '#4a148c', 
    fontSize: 16 
  },
  hinoTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#4a148c', 
    marginBottom: 4 
  },
  hinoPreview: { 
    color: '#666', 
    fontSize: 14 
  },

  // HINÁRIO: LEITURA (MODAL FULL SCREEN)
  hinoModalHeader: { 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  hinoModalHeaderTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#666' 
  },
  backButton: { 
    padding: 5 
  },
  hinoModalContent: { 
    padding: 30, 
    alignItems: 'center' 
  },
  hinoBadge: { 
    backgroundColor: '#4a148c', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginBottom: 20 
  },
  hinoBadgeText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  hinoFullTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  hinoFullLyrics: { 
    fontSize: 20, 
    color: '#333', 
    lineHeight: 34, 
    textAlign: 'center' 
  },

  
  // MODAIS (GERAL)
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '90%', 
    height: '80%', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20 
  },
  modalContentSmall: { 
    width: '80%', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4a148c', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  searchBoxModal: { 
    flexDirection: 'row', 
    backgroundColor: '#f0f0f0', 
    borderRadius: 10, 
    padding: 10, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  modalItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  modalItemText: { 
    fontSize: 18, 
    color: '#333' 
  },
  
  // Lista de Versões (Bíblia)
  versionItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  versionItemText: { 
    fontSize: 16, 
    color: '#333' 
  },
  
  // Botão Fechar Modal
  closeButton: { 
    marginTop: 15, 
    padding: 12, 
    backgroundColor: '#eee', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  closeButtonText: { 
    fontWeight: 'bold', 
    color: '#333' 
  },

 
  // GRADE DE CAPÍTULOS
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center' 
  },
  gridItem: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#f3e5f5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: 6 
  },
  gridItemActive: { 
    backgroundColor: '#4a148c' 
  },
  gridText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#4a148c' 
  },
  gridTextActive: { 
    color: '#fff' 
  },
});