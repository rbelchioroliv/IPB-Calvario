import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddAviso() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();

  const [titulo, setTitulo] = useState('');
  const [sobre, setSobre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) carregarDados();
  }, [editId]);

  const carregarDados = async () => {
    const d = await getDoc(doc(db, "avisos", editId as string));
    if (d.exists()) {
      setTitulo(d.data().titulo);
      setSobre(d.data().descricao);
    }
  };

  const salvarAviso = async () => {
    if (!titulo || !sobre) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      const dados = {
        titulo: titulo,
        descricao: sobre,
        data: new Date().toLocaleDateString('pt-BR'),
        criadoEm: new Date(),
        isPinned: false 
      };

      if (editId) {
        await updateDoc(doc(db, "avisos", editId as string), dados);
        Alert.alert("Sucesso", "Aviso atualizado!");
      } else {
        await addDoc(collection(db, "avisos"), dados);
        Alert.alert("Sucesso", "Aviso publicado!");
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
      <Text style={styles.title}>{editId ? "Editar Aviso" : "Novo Aviso"}</Text>

      <Text style={styles.label}>Título do Aviso</Text>
      <TextInput style={styles.input} placeholder="Ex: Mudança de Horário" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Sobre o Aviso</Text>
      <TextInput 
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
        placeholder="Escreva a mensagem..." 
        multiline 
        value={sobre} 
        onChangeText={setSobre} 
      />

      <TouchableOpacity style={styles.btn} onPress={salvarAviso} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR AVISO</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#bf360c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  btn: { backgroundColor: '#bf360c', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});