import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddNiver() {
  const router = useRouter();
  const { editId } = useLocalSearchParams(); 

  const [nome, setNome] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (editId) {
      carregarDadosEdicao();
    }
  }, [editId]);

  const carregarDadosEdicao = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "aniversariantes", editId as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNome(data.nome);
        setDia(data.dia.toString());
        setMes(data.mes.toString());
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar aniversariante.");
    } finally {
      setLoading(false);
    }
  };

  const salvarNiver = async () => {
    if (!nome || !dia || !mes) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    const diaNum = parseInt(dia);
    const mesNum = parseInt(mes);

    if (isNaN(diaNum) || diaNum < 1 || diaNum > 31 || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      Alert.alert("Erro", "Data ou mês inválidos!");
      return;
    }

    setLoading(true);
    try {
      const dados = {
        nome: nome,
        dia: diaNum,
        mes: mesNum,
        criadoEm: new Date()
      };

      if (editId) {
        
        await updateDoc(doc(db, "aniversariantes", editId as string), dados);
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      } else {
        
        await addDoc(collection(db, "aniversariantes"), dados);
        Alert.alert("Sucesso", "Aniversariante cadastrado!");
      }

      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{editId ? "Editar Aniversariante" : "Novo Aniversariante"}</Text>

      <Text style={styles.label}>Nome Completo</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: João Silva" 
        value={nome} 
        onChangeText={setNome} 
      />

      <View style={{ flexDirection: 'row', gap: 15, marginTop: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Dia (1-31)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 25" 
            keyboardType="numeric"
            maxLength={2}
            value={dia} 
            onChangeText={setDia} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Mês (1-12)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 12" 
            keyboardType="numeric"
            maxLength={2}
            value={mes} 
            onChangeText={setMes} 
          />
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={salvarNiver} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{editId ? "ATUALIZAR DADOS" : "CADASTRAR"}</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4a148c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});