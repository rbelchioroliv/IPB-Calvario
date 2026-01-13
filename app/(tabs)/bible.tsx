import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, TextInput, ActivityIndicator, Modal, ScrollView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HINARIO, API_TOKEN } from '@/constants/churchData'; // Importando o Token
import { LIVROS_BIBLIA, CAPITULOS_POR_LIVRO, ABREVIACOES, VERSOES_BIBLIA } from '@/constants/books';

export default function BibleScreen() {
  const [tab, setTab] = useState<'hinario' | 'biblia'>('biblia');
  
  // Define NVI como padrão (já que você quer usar as bloqueadas)
  const [versaoSelecionada, setVersaoSelecionada] = useState('nvi');
  
  const [livroSelecionado, setLivroSelecionado] = useState('João');
  const [capitulo, setCapitulo] = useState(3);
  const [versiculos, setVersiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modais
  const [modalLivroVisible, setModalLivroVisible] = useState(false);
  const [modalCapituloVisible, setModalCapituloVisible] = useState(false);
  const [modalVersaoVisible, setModalVersaoVisible] = useState(false);
  
  const [buscaLivro, setBuscaLivro] = useState('');
  const [livrosFiltrados, setLivrosFiltrados] = useState(LIVROS_BIBLIA);
  const [buscaHino, setBuscaHino] = useState('');
  const [hinosFiltrados, setHinosFiltrados] = useState(HINARIO);

  useEffect(() => {
    if (buscaLivro.trim() === '') {
      setLivrosFiltrados(LIVROS_BIBLIA);
    } else {
      setLivrosFiltrados(LIVROS_BIBLIA.filter(l => l.toLowerCase().includes(buscaLivro.toLowerCase())));
    }
  }, [buscaLivro]);

  // --- FUNÇÃO QUE ENVIA O TOKEN ---
  const buscarBiblia = async () => {
    setLoading(true);
    try {
      const abrev = ABREVIACOES[livroSelecionado] || 'gn';
      const url = `https://www.abibliadigital.com.br/api/verses/${versaoSelecionada}/${abrev}/${capitulo}`;
      
      console.log(`Buscando: ${url}`);
      console.log(`Token usado (primeiros 10 chars): ${API_TOKEN.substring(0, 10)}...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`, // Envia o Token aqui
          'Accept': 'application/json'
        }
      });
      
      // Se o token for rejeitado, a API retorna status 403
      if (response.status === 403) {
        Alert.alert("Acesso Negado (403)", "O Token no arquivo churchData.ts está incorreto ou não foi encontrado no servidor.");
        setVersiculos([]);
        return;
      }

      const data = await response.json();

      if (!data || !data.verses) {
        Alert.alert("Aviso", "Texto não encontrado.");
        setVersiculos([]);
      } else {
        setVersiculos(data.verses);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha na conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'biblia') {
      buscarBiblia();
    }
  }, [livroSelecionado, capitulo, versaoSelecionada, tab]);

  // Filtros Hinário
  useEffect(() => {
    if (buscaHino.trim() === '') {
      setHinosFiltrados(HINARIO);
    } else {
      const filtrados = HINARIO.filter(h => 
        h.titulo.toLowerCase().includes(buscaHino.toLowerCase()) || 
        h.numero.includes(buscaHino) || 
        h.letra.toLowerCase().includes(buscaHino.toLowerCase())
      );
      setHinosFiltrados(filtrados);
    }
  }, [buscaHino]);

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

              <TouchableOpacity style={styles.selectorButton} onPress={() => {
                setBuscaLivro('');
                setModalLivroVisible(true);
              }}>
                <Text style={styles.selectorLabel}>Livro</Text>
                <Text style={styles.selectorValue} numberOfLines={1}>{livroSelecionado}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.selectorButton, { flex: 0.4 }]} onPress={() => setModalCapituloVisible(true)}>
                <Text style={styles.selectorLabel}>Cap.</Text>
                <Text style={styles.selectorValue}>{capitulo}</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#4a148c" style={{ marginTop: 50 }} />
            ) : (
              <ScrollView style={styles.bibleTextContainer}>
                <Text style={styles.bibleTitle}>{livroSelecionado} {capitulo}</Text>
                
                {versiculos.length > 0 ? (
                  versiculos.map((v, index) => (
                    <View key={index}>
                      {renderVersiculo(v)}
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                    Selecione um texto para ler.
                  </Text>
                )}
                <View style={{height: 50}}/>
              </ScrollView>
            )}

            {/* Modais (Versão, Livro, Capítulo) */}
            <Modal visible={modalVersaoVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContentSmall}>
                  <Text style={styles.modalTitle}>Escolha a Versão</Text>
                  {VERSOES_BIBLIA.map((v) => (
                     <TouchableOpacity 
                       key={v.sigla} 
                       style={styles.versionItem}
                       onPress={() => {
                         setVersaoSelecionada(v.sigla);
                         setModalVersaoVisible(false);
                       }}
                     >
                       <Text style={[styles.versionItemText, versaoSelecionada === v.sigla && { fontWeight: 'bold', color: '#4a148c' }]}>
                         {v.nome} ({v.sigla.toUpperCase()})
                       </Text>
                       {versaoSelecionada === v.sigla && <Ionicons name="checkmark" size={18} color="#4a148c" />}
                     </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVersaoVisible(false)}>
                    <Text style={styles.closeButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal visible={modalLivroVisible} animationType="slide" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Selecionar Livro</Text>
                    <TouchableOpacity onPress={() => setModalLivroVisible(false)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.searchBoxModal}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput 
                      style={styles.searchInput}
                      placeholder="Buscar livro..."
                      value={buscaLivro}
                      onChangeText={setBuscaLivro}
                    />
                  </View>
                  <FlatList 
                    data={livrosFiltrados}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.modalItem}
                        onPress={() => {
                          setLivroSelecionado(item);
                          setCapitulo(1);
                          setModalLivroVisible(false);
                        }}
                      >
                        <Text style={[styles.modalItemText, item === livroSelecionado && { color: '#4a148c', fontWeight: 'bold' }]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <Modal visible={modalCapituloVisible} animationType="fade" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Capítulo de {livroSelecionado}</Text>
                    <TouchableOpacity onPress={() => setModalCapituloVisible(false)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    <View style={styles.gridContainer}>
                      {Array.from({ length: CAPITULOS_POR_LIVRO[livroSelecionado] || 50 }, (_, i) => i + 1).map((num) => (
                        <TouchableOpacity 
                          key={num} 
                          style={[styles.gridItem, num === capitulo && styles.gridItemActive]}
                          onPress={() => {
                            setCapitulo(num);
                            setModalCapituloVisible(false);
                          }}
                        >
                          <Text style={[styles.gridText, num === capitulo && styles.gridTextActive]}>{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Buscar hino..."
                value={buscaHino}
                onChangeText={setBuscaHino}
              />
              {buscaHino.length > 0 && (
                <TouchableOpacity onPress={() => setBuscaHino('')}>
                   <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={hinosFiltrados}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.hinoItem}>
                  <View style={styles.hinoNumberCircle}>
                    <Text style={styles.hinoNumber}>{item.numero}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.hinoTitle}>{item.titulo}</Text>
                    <Text numberOfLines={2} style={styles.hinoPreview}>{item.letra}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1bee7', marginTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tabItem: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#7b1fa2' },
  tabText: { fontWeight: 'bold', color: '#999' },
  activeTabText: { color: '#7b1fa2' },
  content: { flex: 1, padding: 10 },
  bibleControls: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  versionButton: { backgroundColor: '#4a148c', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginRight: 8, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  versionLabel: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginRight: 5 },
  selectorButton: { flex: 1, marginRight: 8, backgroundColor: '#fff', padding: 8, borderRadius: 8, elevation: 1, justifyContent: 'center' },
  selectorLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  selectorValue: { fontSize: 14, fontWeight: 'bold', color: '#4a148c' },
  bibleTextContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 2 },
  bibleTitle: { fontSize: 22, fontWeight: 'bold', color: '#4a148c', marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  verseContainer: { flexDirection: 'row', marginBottom: 12 },
  verseNumber: { fontSize: 12, fontWeight: 'bold', color: '#7b1fa2', width: 25, marginTop: 4, textAlign: 'right', marginRight: 8 },
  verseText: { fontSize: 18, lineHeight: 28, color: '#333', flex: 1, textAlign: 'justify' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  modalContentSmall: { width: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', textAlign: 'center', marginBottom: 10 },
  searchBoxModal: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 15 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 18, color: '#333' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  gridItem: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', margin: 6 },
  gridItemActive: { backgroundColor: '#4a148c' },
  gridText: { fontSize: 16, fontWeight: 'bold', color: '#4a148c' },
  gridTextActive: { color: '#fff' },
  versionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  versionItemText: { fontSize: 16, color: '#333' },
  closeButton: { marginTop: 15, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeButtonText: { fontWeight: 'bold', color: '#333' },
  searchBox: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 15, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  hinoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 12, elevation: 1 },
  hinoNumberCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  hinoNumber: { fontWeight: 'bold', color: '#4a148c', fontSize: 16 },
  hinoTitle: { fontWeight: 'bold', fontSize: 16, color: '#4a148c', marginBottom: 4 },
  hinoPreview: { color: '#666', fontSize: 14 }
});