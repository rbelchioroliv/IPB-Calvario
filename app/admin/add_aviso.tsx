import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function AddAviso() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [sobre, setSobre] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarAviso = async () => {
    if (!titulo || !sobre) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      // Salva na coleção "avisos"
      await addDoc(collection(db, "avisos"), {
        titulo: titulo,
        descricao: sobre,
        data: new Date().toLocaleDateString('pt-BR'), // Salva a data de hoje automaticamente
        criadoEm: new Date()
      });
      
      Alert.alert("Sucesso", "Aviso publicado no quadro!");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Aviso</Text>

      <Text style={styles.label}>Título do Aviso</Text>
      <TextInput style={styles.input} placeholder="Ex: Mudança de Horário" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Sobre o Aviso</Text>
      <TextInput 
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
        placeholder="Escreva a mensagem completa aqui..." 
        multiline 
        value={sobre} 
        onChangeText={setSobre} 
      />

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#bf360c' }]} onPress={salvarAviso} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>PUBLICAR AVISO</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#bf360c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});