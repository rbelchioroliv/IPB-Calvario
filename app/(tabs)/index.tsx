import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity, TouchableWithoutFeedback, Modal, TextInput, Alert, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { API_TOKEN } from '@/constants/churchData';
import { useRouter } from 'expo-router';

import { useAdmin } from '@/context/AdminContext';

export default function HomeScreen() {
  const router = useRouter();

  const [avisos, setAvisos] = useState<any[]>([]);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [versiculoDoDia, setVersiculoDoDia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dataHojeObj = new Date();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomesMeses[dataHojeObj.getMonth()];
  const dataFormatadaHoje = dataHojeObj.toISOString().split('T')[0];



  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  const handleLogoPress = () => {
    if (isAdmin) return;
    const novoCount = clickCount + 1;
    setClickCount(novoCount);
    if (novoCount >= 7) {
      setClickCount(0);
      setShowLoginModal(true);
    }
    setTimeout(() => setClickCount(0), 3000); // Reseta se demorar
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


  const carregarVersiculoDoDia = async () => {
    try {
      const dataSalva = await AsyncStorage.getItem('@versiculo_data');
      const versiculoSalvoStr = await AsyncStorage.getItem('@versiculo_atual');
      const historicoStr = await AsyncStorage.getItem('@versiculo_historico');

      let historico = historicoStr ? JSON.parse(historicoStr) : [];
      let usarSalvo = false;


      if (dataSalva === dataFormatadaHoje && versiculoSalvoStr) {
        const v = JSON.parse(versiculoSalvoStr);
        if (v.livro && v.capitulo) {
          setVersiculoDoDia(v);
          usarSalvo = true;
        }
      }

      if (usarSalvo) return;

      console.log("Buscando novo versículo completo...");

      let novoVersiculo = null;
      let tentativas = 0;

      while (!novoVersiculo && tentativas < 5) {

        const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' }
        });

        const data = await response.json();


        if (data.error) throw new Error("Erro API");

        const idVersiculo = `${data.book.abbrev.pt}-${data.chapter}-${data.number}`;

        if (!historico.includes(idVersiculo)) {
          novoVersiculo = data;
          historico.push(idVersiculo);
          if (historico.length > 500) historico.shift();
        }
        tentativas++;
      }

      if (!novoVersiculo) return;

      const versiculoFormatado = {
        texto: novoVersiculo.text,
        ref: `${novoVersiculo.book.name} ${novoVersiculo.chapter}:${novoVersiculo.number}`,
        livro: novoVersiculo.book.name,
        capitulo: novoVersiculo.chapter
      };

      setVersiculoDoDia(versiculoFormatado);
      await AsyncStorage.setItem('@versiculo_data', dataFormatadaHoje);
      await AsyncStorage.setItem('@versiculo_atual', JSON.stringify(versiculoFormatado));
      await AsyncStorage.setItem('@versiculo_historico', JSON.stringify(historico));

    } catch (error) {
      console.log("Erro versículo:", error);

      setVersiculoDoDia({
        texto: "Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus.",
        ref: "Isaías 41:10",
        livro: "Isaías",
        capitulo: 41
      });
    }
  };

  const carregarDados = async () => {
    try {
      await carregarVersiculoDoDia();

      const avisosRef = collection(db, "avisos");
      const avisosSnapshot = await getDocs(avisosRef);
      setAvisos(avisosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const niverRef = collection(db, "aniversariantes");
      const niverSnapshot = await getDocs(niverRef);
      const listaNiver = niverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const mesAtualNum = dataHojeObj.getMonth() + 1;
      setAniversariantes(listaNiver.filter(p => p.mes === mesAtualNum).sort((a, b) => a.dia - b.dia));

    } catch (error) {
      console.log("Erro geral:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregarDados(); }, []);

  const lerCapituloCompleto = () => {
    if (versiculoDoDia && versiculoDoDia.livro && versiculoDoDia.capitulo) {

      router.push('/bible');

      router.replace({
        pathname: "/bible",
        params: {
          livroAutomatico: versiculoDoDia.livro,
          capituloAutomatico: versiculoDoDia.capitulo
        }
      });
    } else {
      alert("Erro: Informações do capítulo não disponíveis. Atualize a tela.");
      onRefresh();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4a148c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>

        <TouchableWithoutFeedback onPress={handleLogoPress}>
          <Image source={require('@/assets/images/logo-igreja.png')} style={styles.logo} resizeMode="contain" />
        </TouchableWithoutFeedback>

        <Text style={styles.churchName}>IPB Calvário</Text>
        <Text style={styles.subTitle}>Seja bem-vindo!</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={20} color="#6a1b9a" />
          <Text style={styles.cardTitle}>Versículo do Dia</Text>
        </View>
        {versiculoDoDia ? (
          <>
            <Text style={styles.verseText}>"{versiculoDoDia.texto}"</Text>
            <Text style={styles.verseRef}>- {versiculoDoDia.ref}</Text>

            <TouchableOpacity style={styles.readMoreBtn} onPress={lerCapituloCompleto}>
              <Text style={styles.readMoreText}>Ler capítulo completo</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator color="#4a148c" />
        )}
      </View>

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

      <View style={styles.bdaySection}>
        <View style={styles.bdayHeader}>
          <Ionicons name="gift-outline" size={24} color="#4a148c" />
          <Text style={styles.sectionTitleBday}>Aniversariantes de {nomeMesAtual}</Text>
        </View>
        {aniversariantes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aniversariante encontrado.</Text>
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



      {isAdmin ? (
        <View style={{ margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#4a148c' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#4a148c', marginBottom: 10 }}>
            👮 Área Restrita (Admin)
          </Text>

          <TouchableOpacity
            style={{ backgroundColor: '#4a148c', padding: 12, borderRadius: 8, marginBottom: 10 }}
            onPress={() => router.push('/admin')} // <--- LEVA PARA O MENU NOVO
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              ACESSAR PAINEL DE CONTROLE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logoutAdmin} style={{ padding: 10 }}>
            <Text style={{ color: 'red', textAlign: 'center', fontSize: 12 }}>Sair do Modo Admin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Espaço vazio para quem não é admin */
        <View style={{ height: 20 }} />
      )}

      {/* --- O SEGREDO DO LOGO (MODAL) --- */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>🔒 Acesso da Liderança</Text>

            <TextInput
              placeholder="Digite a Senha Mestra"
              secureTextEntry
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20, fontSize: 16, textAlign: 'center' }}
              value={senhaInput}
              onChangeText={setSenhaInput}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button title="Cancelar" color="#999" onPress={() => setShowLoginModal(false)} />
              <Button title="Entrar" color="#4a148c" onPress={tentarLogin} />
            </View>
          </View>
        </View>
      </Modal>





      {/* <TouchableOpacity
        style={{ margin: 20, padding: 15, backgroundColor: '#FF8C00', borderRadius: 8 }}
        onPress={() => router.push('/upload_hinos')}
      >
        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>
          ⚠️ ADMIN: ENVIAR HINOS AGORA
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} /> */}

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
  readMoreBtn: { backgroundColor: '#7b1fa2', padding: 10, borderRadius: 8, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
  readMoreText: { color: '#fff', fontWeight: 'bold', marginRight: 5, fontSize: 12 },
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