import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, 
  RefreshControl, TouchableOpacity, TouchableWithoutFeedback, 
  Modal, TextInput, Alert, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// --- REANIMATED ---
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing,
} from 'react-native-reanimated';

// FIREBASE & SERVIÇOS
import { db } from '@/services/firebaseConfig';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, limit, where } from 'firebase/firestore'; 
import { API_TOKEN } from '@/constants/churchData';
import { useAdmin } from '@/context/AdminContext';
import { CacheService } from '@/services/CacheService';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/colors'; 

const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(width ** 2 + height ** 2);

export default function HomeScreen() {
  const router = useRouter();
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const { toggleTheme, isDark } = useTheme();

  // --- ESTADOS DE ANIMAÇÃO ---
  const [isAnimating, setIsAnimating] = useState(false);

  const [overlayTheme, setOverlayTheme] = useState<'light' | 'dark' | null>(null);
  
  // Refs para sincronizar o scroll
  const iconRef = useRef<View>(null);
  const baseScrollRef = useRef<ScrollView>(null);
  const overlayScrollRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);

  // Valores Animados
  const maskRadius = useSharedValue(0);
  const maskOpacity = useSharedValue(1);
  const maskCx = useSharedValue(0);
  const maskCy = useSharedValue(0);


  const handleScroll = (event: any) => {
    scrollOffsetY.current = event.nativeEvent.contentOffset.y;
  };

  const handleThemeAnimation = () => {
    if (isAnimating) return;


    iconRef.current?.measure((x, y, w, h, pageX, pageY) => {
      maskCx.value = pageX + w / 2;
      maskCy.value = pageY + h / 2;
      startAnimationLogic();
    });
  };

  const startAnimationLogic = () => {
    setIsAnimating(true);
    

    const targetTheme = isDark ? 'light' : 'dark';
    

    setOverlayTheme(targetTheme);
    maskOpacity.value = 1;
    maskRadius.value = 0;

   
    setTimeout(() => {
      if(overlayScrollRef.current) {
        overlayScrollRef.current.scrollTo({ y: scrollOffsetY.current, animated: false });
      }
    }, 0);

 
    maskRadius.value = withTiming(MAX_RADIUS, {
      duration: 650,
      easing: Easing.inOut(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(finishAnimation)();
      }
    });
  };

  const finishAnimation = () => {
   
    toggleTheme(); 

    
    setTimeout(() => {
      
      maskOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(cleanupAnimation)();
        }
      });
    }, 50);
  };

  const cleanupAnimation = () => {
    setIsAnimating(false);
    setOverlayTheme(null);
    maskRadius.value = 0;
    maskOpacity.value = 1;
  };

  // --- ESTILOS ANIMADOS ---
  const rMaskStyle = useAnimatedStyle(() => {
    const r = maskRadius.value;
    const cx = maskCx.value;
    const cy = maskCy.value;
    return {
      width: r * 2, height: r * 2, borderRadius: r,
      top: cy - r, left: cx - r,
      opacity: maskOpacity.value,
    };
  });

  const rInnerStyle = useAnimatedStyle(() => {
    const r = maskRadius.value;
    const cx = maskCx.value;
    const cy = maskCy.value;
    return {
      top: -(cy - r), left: -(cx - r),
      width: width, height: height,
    };
  });

  // --- DADOS E FUNÇÕES (Mantidos) ---
  const [avisos, setAvisos] = useState<any[]>([]);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [versiculoDoDia, setVersiculoDoDia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [selectedBirthday, setSelectedBirthday] = useState<any>(null);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const dataHojeObj = new Date();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomesMeses[dataHojeObj.getMonth()];
  const dataFormatadaHoje = dataHojeObj.toISOString().split('T')[0];

  const carregarVersiculoDoDia = async () => {
    try {
      const dataSalva = await AsyncStorage.getItem('@versiculo_data');
      const versiculoSalvoStr = await AsyncStorage.getItem('@versiculo_atual');
      if (dataSalva === dataFormatadaHoje && versiculoSalvoStr) {
        const v = JSON.parse(versiculoSalvoStr); if (v.livro) setVersiculoDoDia(v);
      } else {
        const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random', { method: 'GET', headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' } });
        const data = await response.json();
        if (data && !data.error) {
           const v = { texto: data.text, ref: `${data.book.name} ${data.chapter}:${data.number}`, livro: data.book.name, capitulo: data.chapter };
           setVersiculoDoDia(v); await AsyncStorage.setItem('@versiculo_data', dataFormatadaHoje); await AsyncStorage.setItem('@versiculo_atual', JSON.stringify(v));
        }
      }
    } catch (e) {}
  };

  const carregarDados = async () => {
    if (avisos.length === 0) setLoading(true);
    try {
      await carregarVersiculoDoDia();
      const avisosData = await CacheService.getSmart('home_avisos', async () => {
        const q = query(collection(db, "avisos"), orderBy("isPinned", "desc"), orderBy("criadoEm", "desc"), limit(10));
        const s = await getDocs(q); return s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      if (avisosData) setAvisos(avisosData);
      const niverData = await CacheService.getSmart('home_aniversariantes', async () => {
        const q = query(collection(db, "aniversariantes"), where("mes", "==", dataHojeObj.getMonth() + 1));
        const s = await getDocs(q); return s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      if (niverData) setAniversariantes(niverData.sort((a:any, b:any) => a.dia - b.dia));
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  
  useFocusEffect(useCallback(() => { carregarDados(); }, []));
  
  const onRefresh = useCallback(() => { 
    setRefreshing(true); 
    CacheService.clear('home_avisos'); 
    CacheService.clear('home_aniversariantes'); 
    carregarDados(); 
  }, []);

  const handleTogglePin = async (id: string, s: boolean) => { try { await updateDoc(doc(db, "avisos", id), { isPinned: !s }); CacheService.clear('home_avisos'); carregarDados(); } catch(e){ Alert.alert("Erro"); } };
  const handleDeleteAviso = (id: string) => { Alert.alert("Apagar?", "", [{ text: "Sim", onPress: async () => { await deleteDoc(doc(db, "avisos", id)); CacheService.clear('home_avisos'); carregarDados(); } }, { text: "Não" }]); };
  const handleLogoPress = () => { if (!isAdmin) { setClickCount(p => p+1); if(clickCount>=6) setShowLoginModal(true); setTimeout(()=>setClickCount(0),3000); }};
  const tentarLogin = () => { if(loginAdmin(senhaInput)) { setShowLoginModal(false); Alert.alert("Sucesso"); } else Alert.alert("Erro"); };
  const lerCapituloCompleto = () => { if (versiculoDoDia?.livro && versiculoDoDia?.capitulo) { router.push({ pathname: "/bible", params: { livroAutomatico: versiculoDoDia.livro, capituloAutomatico: versiculoDoDia.capitulo } }); } else { onRefresh(); } };
  const handleOpenBirthday = (p: any) => { setSelectedBirthday(p); setShowBirthdayModal(true); };
  const handleEditBirthday = () => { setShowBirthdayModal(false); if (selectedBirthday) router.push({ pathname: '/admin/add_niver', params: { editId: selectedBirthday.id } }); };
  const handleDeleteBirthdayFromModal = () => { Alert.alert("Excluir", `Remover?`, [{ text: "Cancelar" }, { text: "Excluir", style: 'destructive', onPress: async () => { setShowBirthdayModal(false); await deleteDoc(doc(db, "aniversariantes", selectedBirthday.id)); CacheService.clear('home_aniversariantes'); carregarDados(); }}]); };

  // --- RENDER CONTENT ---
  const renderContent = (themeMode: 'light' | 'dark', isOverlay = false) => {
    const c = Colors[themeMode];
    const isModeDark = themeMode === 'dark';

    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <StatusBar style={isModeDark ? 'light' : 'dark'} />

        <ScrollView 
      
          ref={isOverlay ? overlayScrollRef : baseScrollRef}
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 40 }}
        
          onScroll={!isOverlay ? handleScroll : undefined}
          scrollEventThrottle={16}
         
          scrollEnabled={!isOverlay && !isAnimating} 
         
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={c.primary} 
            />
          }
        >
          {/* Header */}
          <View style={[styles.headerContainer, { backgroundColor: c.primary }]}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerWelcome}>Seja bem-vindo à</Text>
                <Text style={styles.headerTitle}>IPB Calvário</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                
                {/* Ref apenas no botão da base */}
                <View ref={!isOverlay ? iconRef : undefined} collapsable={false}>
                  <TouchableOpacity onPress={handleThemeAnimation} style={styles.iconButton} disabled={isAnimating}>
                    <Ionicons name={isModeDark ? "sunny" : "moon"} size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <TouchableWithoutFeedback onPress={handleLogoPress}>
                  <Image source={require('@/assets/images/logo-igreja.png')} style={styles.logoSmall} resizeMode="contain" />
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>

          {/* Versículo */}
          <View style={[styles.verseCard, { backgroundColor: c.card, shadowColor: c.text }]}>
            <View style={styles.verseHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles" size={16} color={c.accent} />
                <Text style={[styles.verseLabel, { color: c.textSecondary }]}>Palavra do Dia</Text>
              </View>
              {versiculoDoDia && <TouchableOpacity onPress={lerCapituloCompleto}><Text style={[styles.readMoreLink, { color: c.primary }]}>Ler capítulo</Text></TouchableOpacity>}
            </View>
            {versiculoDoDia ? (
              <View style={{ marginTop: 10 }}>
                <Ionicons name="chatbox-ellipses" size={30} color={c.border} style={styles.quoteIcon} />
                <Text style={[styles.verseText, { color: c.text }]}>"{versiculoDoDia.texto}"</Text>
                <Text style={[styles.verseRef, { color: c.primary }]}>{versiculoDoDia.ref}</Text>
              </View>
            ) : <ActivityIndicator color={c.primary} style={{marginVertical:20}} />}
          </View>

          {/* Aniversariantes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Aniversariantes</Text>
              <Text style={[styles.sectionSubtitle, { color: c.primary }]}>{nomeMesAtual}</Text>
            </View>
            {aniversariantes.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: c.border }]}>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhum aniversariante neste mês.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
                {aniversariantes.map((p:any) => (
                  <TouchableOpacity key={p.id} style={styles.storyContainer} onPress={() => handleOpenBirthday(p)}>
                    <View style={[styles.storyCircle, { borderColor: c.primary, backgroundColor: c.card }]}>
                      <Text style={[styles.storyDay, { color: c.primary }]}>{p.dia}</Text>
                      <Text style={[styles.storyMonth, { color: c.textSecondary }]}>{nomeMesAtual.substring(0,3)}</Text>
                    </View>
                    <Text numberOfLines={1} style={[styles.storyName, { color: c.text }]}>{p.nome.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Avisos */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: c.text, paddingHorizontal: 20, marginBottom: 15 }]}>Mural de Avisos</Text>
            {avisos.length === 0 ? (
              <View style={[styles.emptyContainer, { marginHorizontal: 20 }]}>
                <Ionicons name="notifications-off-outline" size={40} color={c.textSecondary} />
                <Text style={[styles.emptyText, { color: c.textSecondary, marginTop: 10 }]}>Nenhum aviso no momento.</Text>
              </View>
            ) : (
              avisos.map((aviso) => (
                <View key={aviso.id} style={[styles.avisoCard, { backgroundColor: c.card, shadowColor: c.text, borderColor: aviso.isPinned ? c.pinBorder : c.border, borderWidth: 1 }]}>
                  <View style={styles.avisoHeaderRow}>
                    <View style={[styles.dateTag, { backgroundColor: isModeDark ? '#333' : '#f0f0f0' }]}>
                      <Ionicons name="calendar-outline" size={12} color={c.textSecondary} />
                      <Text style={[styles.dateTagText, { color: c.textSecondary }]}>{aviso.data}</Text>
                    </View>
                    {aviso.isPinned && <Ionicons name="push-outline" size={20} color={c.pinBorder} />}
                  </View>
                  <Text style={[styles.avisoTitle, { color: c.primary }]}>{aviso.titulo}</Text>
                  <Text style={[styles.avisoDesc, { color: c.text }]}>{aviso.descricao}</Text>
                  
                  {isAdmin && (
                    <View style={[styles.avisoFooterAdmin, { borderTopColor: c.border }]}>
                      <TouchableOpacity style={styles.adminActionBtn} onPress={() => handleTogglePin(aviso.id, aviso.isPinned)}>
                        <Ionicons name={aviso.isPinned ? "pin" : "pin-outline"} size={18} color={aviso.isPinned ? "#ff9800" : c.textSecondary} />
                        <Text style={{ fontSize: 12, color: c.textSecondary, marginLeft: 4 }}>{aviso.isPinned ? "Desfixar" : "Fixar"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adminActionBtn} onPress={() => router.push({ pathname: '/admin/add_aviso', params: { editId: aviso.id } })}>
                        <Ionicons name="create-outline" size={18} color={c.primary} />
                        <Text style={{ fontSize: 12, color: c.primary, marginLeft: 4 }}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adminActionBtn} onPress={() => handleDeleteAviso(aviso.id)}>
                        <Ionicons name="trash-outline" size={18} color="red" />
                        <Text style={{ fontSize: 12, color: "red", marginLeft: 4 }}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Admin Footer */}
          {isAdmin && (
            <View style={[styles.adminFooter, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.adminTitle, { color: c.text }]}>Painel Administrativo</Text>
              <View style={styles.adminButtons}>
                 <TouchableOpacity style={[styles.adminBtn, { borderColor: c.primary }]} onPress={() => router.push('/admin')}>
                   <Text style={{ color: c.primary, fontWeight:'bold' }}>Acessar Painel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.adminBtn, { borderColor: 'red' }]} onPress={logoutAdmin}>
                   <Text style={{ color: 'red', fontWeight:'bold' }}>Sair</Text>
                 </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading && avisos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors[isDark ? 'dark' : 'light'].background }}>
        <ActivityIndicator size="large" color={Colors[isDark ? 'dark' : 'light'].primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[isDark ? 'dark' : 'light'].background }}>
      
    
      <View style={StyleSheet.absoluteFill}>
        {renderContent(isDark ? 'dark' : 'light', false)}
      </View>

  
      {overlayTheme && (
        <Animated.View style={[styles.maskContainer, rMaskStyle]} pointerEvents="none">
          <Animated.View style={rInnerStyle}>
            {renderContent(overlayTheme, true)}
          </Animated.View>
        </Animated.View>
      )}
      
      {/* MODAIS */}
      <Modal visible={showBirthdayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[isDark ? 'dark' : 'light'].card }]}>
            {selectedBirthday && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={[styles.storyCircleLarge, { borderColor: Colors[isDark ? 'dark' : 'light'].primary, backgroundColor: Colors[isDark ? 'dark' : 'light'].background }]}>
                    <Text style={[styles.storyDayLarge, { color: Colors[isDark ? 'dark' : 'light'].primary }]}>{selectedBirthday.dia}</Text>
                    <Text style={[styles.storyMonthLarge, { color: Colors[isDark ? 'dark' : 'light'].textSecondary }]}>{nomeMesAtual}</Text>
                  </View>
                  <Text style={[styles.modalTitle, { color: Colors[isDark ? 'dark' : 'light'].text, marginTop: 10 }]}>{selectedBirthday.nome}</Text>
                  <Text style={[styles.modalSubtitle, { color: Colors[isDark ? 'dark' : 'light'].textSecondary }]}>🎉 Parabéns!</Text>
                </View>
                {isAdmin ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.modalBtnAction, { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }]} onPress={handleEditBirthday}>
                      <Ionicons name="create" size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtnAction, { backgroundColor: 'red' }]} onPress={handleDeleteBirthdayFromModal}>
                      <Ionicons name="trash" size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TouchableOpacity style={[styles.modalBtnClose, { backgroundColor: Colors[isDark ? 'dark' : 'light'].inputBg }]} onPress={() => setShowBirthdayModal(false)}>
                  <Text style={{ color: Colors[isDark ? 'dark' : 'light'].text, fontWeight: 'bold' }}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[isDark ? 'dark' : 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[isDark ? 'dark' : 'light'].text }]}>Área Restrita</Text>
            <Text style={[styles.modalSubtitle, { color: Colors[isDark ? 'dark' : 'light'].textSecondary }]}>Acesso exclusivo para liderança</Text>
            <TextInput placeholder="Senha Mestra" placeholderTextColor={Colors[isDark ? 'dark' : 'light'].textSecondary} secureTextEntry keyboardType="numeric" style={[styles.modalInput, { backgroundColor: Colors[isDark ? 'dark' : 'light'].inputBg, color: Colors[isDark ? 'dark' : 'light'].text, borderColor: Colors[isDark ? 'dark' : 'light'].border }]} value={senhaInput} onChangeText={setSenhaInput} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLoginModal(false)}>
                <Text style={{color: Colors[isDark ? 'dark' : 'light'].textSecondary}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnConfirm, { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }]} onPress={tentarLogin}>
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
  maskContainer: { position: 'absolute', overflow: 'hidden', zIndex: 999, elevation: 10 },
  headerContainer: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 60, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, zIndex: 2 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerWelcome: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  logoSmall: { width: 45, height: 45 },
  iconButton: { padding: 8, backgroundColor:'rgba(255,255,255,0.15)', borderRadius: 20 },
  verseCard: { marginTop: -40, marginHorizontal: 20, borderRadius: 20, padding: 20, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 25, zIndex: 10 },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  verseLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  readMoreLink: { fontSize: 12, fontWeight: 'bold' },
  quoteIcon: { position: 'absolute', top: -5, left: -5, opacity: 0.15 },
  verseText: { fontSize: 18, fontStyle:'italic', lineHeight: 26, marginVertical: 15, textAlign: 'center' },
  verseRef: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  sectionContainer: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 14, fontWeight: 'bold', textTransform:'uppercase' },
  storyContainer: { alignItems: 'center', width: 70, position: 'relative' },
  storyCircle: { width: 65, height: 65, borderRadius: 35, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 5, elevation: 2 },
  storyDay: { fontSize: 20, fontWeight: 'bold' },
  storyMonth: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },
  storyName: { fontSize: 12, textAlign: 'center' },
  emptyBox: { marginHorizontal: 20, padding: 20, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
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
  adminFooter: { marginHorizontal: 20, marginBottom: 20, padding: 15, borderRadius: 12, borderWidth: 1 },
  adminTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 10, textAlign:'center' },
  adminButtons: { flexDirection:'row', justifyContent:'center', gap: 15 },
  adminBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  modalInput: { borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16, textAlign: 'center', borderWidth: 1 },
  modalButtons: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  modalBtnCancel: { flex: 1, padding: 12, alignItems: 'center' },
  modalBtnConfirm: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  storyCircleLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  storyDayLarge: { fontSize: 32, fontWeight: 'bold' },
  storyMonthLarge: { fontSize: 16, textTransform: 'uppercase', fontWeight: 'bold' },
  modalBtnAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10 },
  modalBtnClose: { marginTop: 15, padding: 12, borderRadius: 10, alignItems: 'center' },
});