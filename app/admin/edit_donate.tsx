import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { useRouter, Stack } from 'expo-router'; 
import { useTheme } from '@/context/ThemeContext';

export default function EditDonate() {
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estados dos campos
  const [chavePix, setChavePix] = useState('');
  const [titular, setTitular] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');

  useEffect(() => {
    carregarDadosAtuais();
  }, []);

  const handlePixChange = (text: string) => {
    if (/^[a-zA-Z]/.test(text)) {
      setChavePix(text);
      return;
    }
    let value = text.replace(/\D/g, ''); 
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setChavePix(value);
  };

  const carregarDadosAtuais = async () => {
    try {
      const docRef = doc(db, "config", "doacao");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setChavePix(data.pix || '');
        setTitular(data.titular || '');
        setBanco(data.bancoNome || '');
        setAgencia(data.agencia || '');
        setConta(data.conta || '');
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados atuais.");
    } finally {
      setFetching(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!chavePix || !banco || !titular) {
      Alert.alert("Atenção", "Chave PIX, Banco e Titular são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const textoFormatado = `Banco: ${banco}\nAg: ${agencia} | CC: ${conta}\nTitular: ${titular}`;

      await setDoc(doc(db, "config", "doacao"), {
        pix: chavePix,
        titular,
        bancoNome: banco,
        agencia,
        conta,
        bank: textoFormatado, 
        updatedAt: new Date()
      });

      Alert.alert("Sucesso", "Dados bancários atualizados!");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
   
      <Stack.Screen 
        options={{ 
          title: "Editar Dados", 
          headerStyle: { backgroundColor: colors.card }, 
          headerTintColor: colors.text, 
          headerTitleStyle: { fontWeight: 'bold' } 
        }} 
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: colors.primary }]}>Configurar Doações</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Chave PIX (CPF/CNPJ Automático)</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          value={chavePix} 
          onChangeText={handlePixChange} 
          placeholder="Digite CPF, CNPJ ou E-mail..." 
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address" 
          autoCapitalize="none"
        />

        <Text style={[styles.dividerTitle, { color: colors.primary, marginTop: 25 }]}>Dados Bancários</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Nome do Titular (Igreja)</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          value={titular} 
          onChangeText={setTitular} 
          placeholder="Igreja Presbiteriana..." 
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Banco</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          value={banco} 
          onChangeText={setBanco} 
          placeholder="Ex: Bradesco, NuBank" 
          placeholderTextColor={colors.textSecondary}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Agência</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              value={agencia} 
              onChangeText={setAgencia} 
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Conta</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              value={conta} 
              onChangeText={setConta} 
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={salvarConfiguracoes} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.textSecondary }]} onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  dividerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 5 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  btn: { padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center', borderWidth: 1, backgroundColor: 'transparent' },
  cancelText: { fontWeight: 'bold' }
});