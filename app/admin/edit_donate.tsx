import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditDonate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estados dos campos
  const [chavePix, setChavePix] = useState('');
  const [titular, setTitular] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // Link da imagem do QR Code

  useEffect(() => {
    carregarDadosAtuais();
  }, []);

  const carregarDadosAtuais = async () => {
    try {
      const docRef = doc(db, "configuracoes", "doacoes");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setChavePix(data.chavePix || '');
        setTitular(data.titular || '');
        setBanco(data.banco || '');
        setAgencia(data.agencia || '');
        setConta(data.conta || '');
        setQrCodeUrl(data.qrCodeUrl || '');
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados atuais.");
    } finally {
      setFetching(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!chavePix || !titular || !banco) {
      Alert.alert("Erro", "Chave PIX, Titular e Banco são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "configuracoes", "doacoes"), {
        chavePix,
        titular,
        banco,
        agencia,
        conta,
        qrCodeUrl,
        ultimaAtualizacao: new Date()
      });

      Alert.alert("Sucesso", "Dados bancários atualizados!");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <View style={styles.center}><ActivityIndicator size="large" color="#4a148c" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Configurar Doações</Text>

        <Text style={styles.label}>Chave PIX</Text>
        <TextInput style={styles.input} value={chavePix} onChangeText={setChavePix} placeholder="CPF, E-mail ou Chave Aleatória" />

        <Text style={styles.label}>Nome do Titular</Text>
        <TextInput style={styles.input} value={titular} onChangeText={setTitular} placeholder="Igreja Presbiteriana..." />

        <Text style={styles.label}>Banco</Text>
        <TextInput style={styles.input} value={banco} onChangeText={setBanco} placeholder="Ex: Bradesco, NuBank" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Agência</Text>
            <TextInput style={styles.input} value={agencia} onChangeText={setAgencia} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Conta</Text>
            <TextInput style={styles.input} value={conta} onChangeText={setConta} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>URL da Imagem do QR Code</Text>
        <TextInput 
          style={styles.input} 
          value={qrCodeUrl} 
          onChangeText={setQrCodeUrl} 
          placeholder="https://link-da-imagem.com/qrcode.png" 
        />
        <Text style={styles.hint}>Dica: Você pode hospedar a imagem em um site como ImgBB e colar o link direto aqui.</Text>

        <TouchableOpacity style={styles.btn} onPress={salvarConfiguracoes} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ATUALIZAR DADOS</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4a148c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hint: { fontSize: 11, color: '#999', marginTop: 5, fontStyle: 'italic' }
});