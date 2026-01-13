import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function AddNiver() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarNiver = async () => {
    if (!nome || !dia || !mes) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      // Salva na coleção "aniversariantes"
      // Convertemos dia e mes para número para poder ordenar depois
      await addDoc(collection(db, "aniversariantes"), {
        nome: nome,
        dia: parseInt(dia),
        mes: parseInt(mes)
      });
      
      Alert.alert("Sucesso", "Aniversariante cadastrado!");
      // Limpa os campos para adicionar outro se quiser
      setNome('');
      setDia('');
      setMes('');
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Aniversariante</Text>

      <Text style={styles.label}>Nome do Membro</Text>
      <TextInput style={styles.input} placeholder="Ex: Maria Silva" value={nome} onChangeText={setNome} />

      <View style={{flexDirection: 'row', gap: 15}}>
        <View style={{flex: 1}}>
            <Text style={styles.label}>Dia (Número)</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Ex: 15" 
                keyboardType="numeric" 
                value={dia} 
                onChangeText={setDia} 
                maxLength={2}
            />
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.label}>Mês (Número)</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Ex: 10" 
                keyboardType="numeric" 
                value={mes} 
                onChangeText={setMes} 
                maxLength={2}
            />
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#01579b' }]} onPress={salvarNiver} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CADASTRAR</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#01579b', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});