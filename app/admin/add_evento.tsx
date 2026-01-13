import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function AddEvento() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [sobre, setSobre] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarEvento = async () => {
    if (!titulo || !data || !sobre) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      // Salva na coleção "eventos" do Firebase
      await addDoc(collection(db, "eventos"), {
        titulo: titulo,
        data: data,
        descricao: sobre,
        criadoEm: new Date()
      });
      
      Alert.alert("Sucesso", "Evento adicionado com sucesso!");
      router.back(); // Volta para o menu
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Evento</Text>

      <Text style={styles.label}>Título do Evento</Text>
      <TextInput style={styles.input} placeholder="Ex: Culto de Jovens" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Data (Texto)</Text>
      <TextInput style={styles.input} placeholder="Ex: 25/12 às 19h" value={data} onChangeText={setData} />

      <Text style={styles.label}>Sobre (Descrição)</Text>
      <TextInput 
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
        placeholder="Detalhes do evento..." 
        multiline 
        value={sobre} 
        onChangeText={setSobre} 
      />

      <TouchableOpacity style={styles.btn} onPress={salvarEvento} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR EVENTO</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4a148c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});