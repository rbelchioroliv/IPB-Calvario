import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, 
  RefreshControl, TouchableOpacity, TouchableWithoutFeedback, 
  Modal, TextInput, Alert, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

// FIREBASE & SERVIÇOS
import { db } from '@/services/firebaseConfig';
import { 
  collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, 
  limit, where 
} from 'firebase/firestore'; 

// CONSTANTES E CONTEXTOS
import { API_TOKEN } from '@/constants/churchData';
import { useAdmin } from '@/context/AdminContext';
import { CacheService } from '@/services/CacheService';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const { colors, toggleTheme, isDark } = useTheme();

  // Estados de Dados
  const [avisos, setAvisos] = useState<any[]>([]);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [versiculoDoDia, setVersiculoDoDia] = useState<any>(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados Admin (Login Secreto)
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  // Estados do Modal de Aniversariante
  const [selectedBirthday, setSelectedBirthday] = useState<any>(null);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

  // Datas
  const dataHojeObj = new Date();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomesMeses[dataHojeObj.getMonth()];
  const dataFormatadaHoje = dataHojeObj.toISOString().split('T')[0];

  // --- CARREGAMENTO DE DADOS ---
  const carregarVersiculoDoDia = async () => {
    try {
      const dataSalva = await AsyncStorage.getItem('@versiculo_data');
      const versiculoSalvoStr = await AsyncStorage.getItem('@versiculo_atual');
      
      if (dataSalva === dataFormatadaHoje && versiculoSalvoStr) {
        const v = JSON.parse(versiculoSalvoStr);
        if (v.livro && v.capitulo) {
          setVersiculoDoDia(v);
          return;
        }
      }

      const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' }
      });
      const data = await response.json();
      
      if (data && !data.error) {
        const versiculoFormatado = {
          texto: data.text,
          ref: `${data.book.name} ${data.chapter}:${data.number}`,
          livro: data.book.name,
          capitulo: data.chapter
        };
        setVersiculoDoDia(versiculoFormatado);
        await AsyncStorage.setItem('@versiculo_data', dataFormatadaHoje);
        await AsyncStorage.setItem('@versiculo_atual', JSON.stringify(versiculoFormatado));
      }
    } catch (error) {
      setVersiculoDoDia({
        texto: "Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus.",
        ref: "Isaías 41:10",
        livro: "Isaías",
        capitulo: 41
      });
    }
  };

  const carregarDados = async () => {
    if (avisos.length === 0) setLoading(true);
    
    try {
      await carregarVersiculoDoDia();

      const avisosData = await CacheService.getSmart('home_avisos', async () => {
        const qAvisos = query(collection(db, "avisos"), orderBy("isPinned", "desc"), orderBy("criadoEm", "desc"), limit(10));
        const snapshot = await getDocs(qAvisos);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      if (avisosData) setAvisos(avisosData);

      const niverData = await CacheService.getSmart('home_aniversariantes', async () => {
        const mesAtualNum = dataHojeObj.getMonth() + 1;
        const qNiver = query(collection(db, "aniversariantes"), where("mes", "==", mesAtualNum));
        const snapshot = await getDocs(qNiver);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        return lista.sort((a, b) => a.dia - b.dia);
      });
      if (niverData) setAniversariantes(niverData);

    } catch (error) {
      console.log("Erro geral carregamento:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const onRefresh = useCallback(() => { 
    setRefreshing(true); 
    CacheService.clear('home_avisos');
    CacheService.clear('home_aniversariantes');
    carregarDados(); 
  }, []);

  // --- FUNÇÕES ADMIN ---
  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "avisos", id), { isPinned: !currentStatus });
      CacheService.clear('home_avisos'); 
      carregarDados();
    } catch (e) { Alert.alert("Erro", "Falha ao fixar aviso."); }
  };

  const handleDeleteAviso = (id: string) => {
    Alert.alert("Excluir", "Apagar aviso?", [
      { text: "Não" }, 
      { text: "Sim", style: 'destructive', onPress: async () => { 
        await deleteDoc(doc(db, "avisos", id)); 
        CacheService.clear('home_avisos'); 
        carregarDados(); 
      }}
    ]);
  };

  // Funções do Modal de Aniversariante
  const handleOpenBirthday = (pessoa: any) => {
    setSelectedBirthday(pessoa);
    setShowBirthdayModal(true);
  };

  const handleEditBirthday = () => {
    setShowBirthdayModal(false);
    if (selectedBirthday) {
      router.push({ pathname: '/admin/add_niver', params: { editId: selectedBirthday.id } });
    }
  };

  const handleDeleteBirthdayFromModal = () => {
    Alert.alert("Excluir", `Remover ${selectedBirthday.nome} da lista?`, [
      { text: "Cancelar" },
      { 
        text: "Excluir", 
        style: 'destructive', 
        onPress: async () => { 
          setShowBirthdayModal(false);
          await deleteDoc(doc(db, "aniversariantes", selectedBirthday.id)); 
          CacheService.clear('home_aniversariantes'); 
          carregarDados(); 
        } 
      }
    ]);
  };

  const handleLogoPress = () => {
    if (isAdmin) return;
    const novoCount = clickCount + 1;
    setClickCount(novoCount);
    if (novoCount >= 7) {
      setClickCount(0);
      setShowLoginModal(true);
    }
    setTimeout(() => setClickCount(0), 3000);
  };

  const tentarLogin = () => {
    if (loginAdmin(senhaInput)) {
      setShowLoginModal(false);
      Alert.alert("Sucesso", "Painel liberado!");
    } else {
      Alert.alert("Erro", "Senha incorreta.");
      setClickCount(0);
    }
  };

  const lerCapituloCompleto = () => {
    if (versiculoDoDia?.livro && versiculoDoDia?.capitulo) {
      router.push({ pathname: "/bible", params: { livroAutomatico: versiculoDoDia.livro, capituloAutomatico: versiculoDoDia.capitulo } });
    } else {
      onRefresh();
    }
  };

  if (loading && avisos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {/* === HEADER === */}
        <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerWelcome}>Seja bem-vindo à</Text>
              <Text style={styles.headerTitle}>IPB Calvário</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                <Ionicons name={isDark ? "sunny" : "moon"} size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableWithoutFeedback onPress={handleLogoPress}>
                <Image source={require('@/assets/images/logo-igreja.png')} style={styles.logoSmall} resizeMode="contain" />
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>

        {/* === CARD FLUTUANTE (VERSÍCULO) === */}
        <View style={[styles.verseCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <View style={styles.verseHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={[styles.verseLabel, { color: colors.textSecondary }]}>Palavra do Dia</Text>
            </View>
            {versiculoDoDia && (
              <TouchableOpacity onPress={lerCapituloCompleto}>
                <Text style={[styles.readMoreLink, { color: colors.primary }]}>Ler capítulo</Text>
              </TouchableOpacity>
            )}
          </View>

          {versiculoDoDia ? (
            <View style={{ marginTop: 10 }}>
              {/* ÍCONE CORRIGIDO AQUI */}
              <Ionicons name="chatbox-ellipses" size={30} color={colors.border} style={styles.quoteIcon} />
              <Text style={[styles.verseText, { color: colors.text }]}>"{versiculoDoDia.texto}"</Text>
              <Text style={[styles.verseRef, { color: colors.primary }]}>{versiculoDoDia.ref}</Text>
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          )}
        </View>

        {/* === ANIVERSARIANTES (Carrossel Interativo) === */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Aniversariantes</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.primary }]}>{nomeMesAtual}</Text>
          </View>

          {aniversariantes.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum aniversariante neste mês.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
              {aniversariantes.map((pessoa) => (
                <TouchableOpacity 
                  key={pessoa.id} 
                  style={styles.storyContainer}
                  onPress={() => handleOpenBirthday(pessoa)}
                >
                  <View style={[styles.storyCircle, { borderColor: colors.primary, backgroundColor: colors.card }]}>
                    <Text style={[styles.storyDay, { color: colors.primary }]}>{pessoa.dia}</Text>
                    <Text style={[styles.storyMonth, { color: colors.textSecondary }]}>{nomeMesAtual.substring(0,3)}</Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.storyName, { color: colors.text }]}>
                    {pessoa.nome.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* === MURAL DE AVISOS === */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20, marginBottom: 15 }]}>Mural de Avisos</Text>

          {avisos.length === 0 ? (
            <View style={[styles.emptyContainer, { marginHorizontal: 20 }]}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 10 }]}>Nenhum aviso no momento.</Text>
            </View>
          ) : (
            avisos.map((aviso) => (
              <View 
                key={aviso.id} 
                style={[
                  styles.avisoCard, 
                  { 
                    backgroundColor: colors.card,
                    shadowColor: colors.text,
                    borderColor: aviso.isPinned ? colors.pinBorder : colors.border,
                    borderWidth: 1
                  }
                ]}
              >
                <View style={styles.avisoHeaderRow}>
                  <View style={[styles.dateTag, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.dateTagText, { color: colors.textSecondary }]}>{aviso.data}</Text>
                  </View>
                  {aviso.isPinned && (
                    <Ionicons name="push-outline" size={20} color={colors.pinBorder} />
                  )}
                </View>

                <Text style={[styles.avisoTitle, { color: colors.primary }]}>{aviso.titulo}</Text>
                <Text style={[styles.avisoDesc, { color: colors.text }]}>{aviso.descricao}</Text>

                {isAdmin && (
                  <View style={[styles.avisoFooterAdmin, { borderTopColor: colors.border }]}>
                    <TouchableOpacity 
                      style={styles.adminActionBtn} 
                      onPress={() => handleTogglePin(aviso.id, aviso.isPinned)}
                    >
                      <Ionicons name={aviso.isPinned ? "pin" : "pin-outline"} size={18} color={aviso.isPinned ? "#ff9800" : colors.textSecondary} />
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>
                        {aviso.isPinned ? "Desfixar" : "Fixar"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.adminActionBtn} 
                      onPress={() => router.push({ pathname: '/admin/add_aviso', params: { editId: aviso.id } })}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                      <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4 }}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.adminActionBtn} 
                      onPress={() => handleDeleteAviso(aviso.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="red" />
                      <Text style={{ fontSize: 12, color: "red", marginLeft: 4 }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* === ÁREA ADMIN (Rodapé) === */}
        {isAdmin && (
          <View style={[styles.adminFooter, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.adminTitle, { color: colors.text }]}>Painel Administrativo</Text>
            <View style={styles.adminButtons}>
               <TouchableOpacity style={[styles.adminBtn, { borderColor: colors.primary }]} onPress={() => router.push('/admin')}>
                 <Text style={{ color: colors.primary, fontWeight:'bold' }}>Acessar Painel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.adminBtn, { borderColor: 'red' }]} onPress={logoutAdmin}>
                 <Text style={{ color: 'red', fontWeight:'bold' }}>Sair</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* === MODAL DETALHES ANIVERSARIANTE === */}
      <Modal visible={showBirthdayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedBirthday && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={[styles.storyCircleLarge, { borderColor: colors.primary, backgroundColor: colors.background }]}>
                    <Text style={[styles.storyDayLarge, { color: colors.primary }]}>{selectedBirthday.dia}</Text>
                    <Text style={[styles.storyMonthLarge, { color: colors.textSecondary }]}>{nomeMesAtual}</Text>
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.text, marginTop: 10 }]}>{selectedBirthday.nome}</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>🎉 Parabéns!</Text>
                </View>

                {isAdmin ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.modalBtnAction, { backgroundColor: colors.primary }]} onPress={handleEditBirthday}>
                      <Ionicons name="create" size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtnAction, { backgroundColor: 'red' }]} onPress={handleDeleteBirthdayFromModal}>
                      <Ionicons name="trash" size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity 
                  style={[styles.modalBtnClose, { backgroundColor: colors.inputBg }]} 
                  onPress={() => setShowBirthdayModal(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* === MODAL LOGIN ADMIN === */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Área Restrita</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Acesso exclusivo para liderança</Text>
            <TextInput
              placeholder="Senha Mestra"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              keyboardType="numeric"
              style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={senhaInput}
              onChangeText={setSenhaInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLoginModal(false)}>
                <Text style={{color: colors.textSecondary}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnConfirm, { backgroundColor: colors.primary }]} onPress={tentarLogin}>
                <Text style={{color: '#fff', fontWeight:'bold'}}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // HEADER
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerWelcome: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  logoSmall: { width: 45, height: 45 },
  iconButton: { padding: 8, backgroundColor:'rgba(255,255,255,0.15)', borderRadius: 20 },

  // CARD FLUTUANTE
  verseCard: {
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 25,
    zIndex: 10,
  },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  verseLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  readMoreLink: { fontSize: 12, fontWeight: 'bold' },
  quoteIcon: { position: 'absolute', top: -5, left: -5, opacity: 0.15 },
  verseText: { fontSize: 18, fontStyle:'italic', lineHeight: 26, marginVertical: 15, textAlign: 'center' },
  verseRef: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },

  // SEÇÕES
  sectionContainer: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 14, fontWeight: 'bold', textTransform:'uppercase' },

  // ANIVERSARIANTES (Lista)
  storyContainer: { alignItems: 'center', width: 70, position: 'relative' },
  storyCircle: { 
    width: 65, height: 65, borderRadius: 35, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 5, elevation: 2 
  },
  storyDay: { fontSize: 20, fontWeight: 'bold' },
  storyMonth: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },
  storyName: { fontSize: 12, textAlign: 'center' },
  emptyBox: { marginHorizontal: 20, padding: 20, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },

  // AVISOS
  avisoCard: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 20, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  avisoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  dateTagText: { fontSize: 11, fontWeight: 'bold' },
  avisoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, lineHeight: 24 },
  avisoDesc: { fontSize: 15, lineHeight: 22 },
  avisoFooterAdmin: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  adminActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { fontStyle: 'italic' },

  // ADMIN FOOTER
  adminFooter: { marginHorizontal: 20, marginBottom: 20, padding: 15, borderRadius: 12, borderWidth: 1 },
  adminTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 10, textAlign:'center' },
  adminButtons: { flexDirection:'row', justifyContent:'center', gap: 15 },
  adminBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },

  // MODAL (Login e Birthday)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  modalInput: { borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16, textAlign: 'center', borderWidth: 1 },
  modalButtons: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  modalBtnCancel: { flex: 1, padding: 12, alignItems: 'center' },
  modalBtnConfirm: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  
  // Estilos específicos Modal Birthday
  storyCircleLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  storyDayLarge: { fontSize: 32, fontWeight: 'bold' },
  storyMonthLarge: { fontSize: 16, textTransform: 'uppercase', fontWeight: 'bold' },
  modalBtnAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10 },
  modalBtnClose: { marginTop: 15, padding: 12, borderRadius: 10, alignItems: 'center' },
});