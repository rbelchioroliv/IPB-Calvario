import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, SafeAreaView, Button } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export default function AddEvento() {
  const router = useRouter();
  const { editId } = useLocalSearchParams(); 

  const [titulo, setTitulo] = useState('');
  const [sobre, setSobre] = useState('');
  const [loading, setLoading] = useState(false);

  // Campos de Data e Hora
  const [selectedDate, setSelectedDate] = useState(''); 
  const [horaInicio, setHoraInicio] = useState('');     
  const [horaFim, setHoraFim] = useState('');           
  const [showCalendar, setShowCalendar] = useState(false);

  // Carregar dados caso seja edição
  useEffect(() => {
    if (editId) {
      carregarDadosEdicao();
    }
  }, [editId]);

  const carregarDadosEdicao = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "eventos", editId as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitulo(data.titulo);
        setSobre(data.descricao);
        setSelectedDate(data.dataISO);
        setHoraInicio(data.horaInicio);
        setHoraFim(data.horaFim);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados do evento.");
    } finally {
      setLoading(false);
    }
  };

 
  const existeConflito = (hIn: string, hFim: string, agendaIn: string, agendaFim: string): boolean => {
    return hIn < agendaFim && hFim > agendaIn;
  };

  const salvarEvento = async () => {
    
    if (!titulo || !selectedDate || !horaInicio || !horaFim || !sobre) {
      Alert.alert("Erro", "Preencha todos os campos, incluindo data e horários!");
      return;
    }

   
    const regexHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHora.test(horaInicio) || !regexHora.test(horaFim)) {
      Alert.alert("Erro", "Use o formato de hora 00:00");
      return;
    }

    if (horaInicio >= horaFim) {
      Alert.alert("Erro", "O horário de início deve ser antes do término!");
      return;
    }

    setLoading(true);

    try {
    
      const q = query(
        collection(db, "eventos"),
        where("dataISO", "==", selectedDate)
      );

      const querySnapshot = await getDocs(q);
      let conflitoEncontrado = null;

      querySnapshot.forEach((docSnap) => {
        
        if (editId && docSnap.id === editId) return;

        const eventoExistente = docSnap.data();
        if (existeConflito(horaInicio, horaFim, eventoExistente.horaInicio, eventoExistente.horaFim)) {
          conflitoEncontrado = eventoExistente.titulo;
        }
      });

      if (conflitoEncontrado) {
        Alert.alert(
          "⚠️ Conflito de Agenda",
          `Já existe o evento "${conflitoEncontrado}" neste mesmo dia e horário. Escolha outro período.`
        );
        setLoading(false);
        return;
      }


      const dadosEvento = {
        titulo,
        descricao: sobre,
        dataISO: selectedDate,
        data: selectedDate.split('-').reverse().join('/'),
        horaInicio,
        horaFim,
        criadoEm: new Date()
      };

    
      if (editId) {
        await updateDoc(doc(db, "eventos", editId as string), dadosEvento);
        Alert.alert("Sucesso", "Evento atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "eventos"), dadosEvento);
        Alert.alert("Sucesso", "Evento agendado com sucesso!");
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
      <Text style={styles.title}>{editId ? "Editar Evento" : "Novo Evento"}</Text>

      <Text style={styles.label}>Título do Evento</Text>
      <TextInput style={styles.input} placeholder="Ex: Culto de Oração" value={titulo} onChangeText={setTitulo} />

      {/* SELEÇÃO DE DATA */}
      <Text style={styles.label}>Data</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowCalendar(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4a148c" />
        <Text style={styles.selectorText}>
          {selectedDate ? selectedDate.split('-').reverse().join('/') : "Selecionar Data"}
        </Text>
      </TouchableOpacity>

      {/* SELEÇÃO DE HORAS */}
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Início (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="19:00"
            keyboardType="numbers-and-punctuation"
            value={horaInicio}
            onChangeText={setHoraInicio}
            maxLength={5}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Término (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="21:00"
            keyboardType="numbers-and-punctuation"
            value={horaFim}
            onChangeText={setHoraFim}
            maxLength={5}
          />
        </View>
      </View>

      <Text style={styles.label}>Sobre o evento</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Detalhes..."
        multiline
        value={sobre}
        onChangeText={setSobre}
      />

      <TouchableOpacity style={styles.btn} onPress={salvarEvento} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{editId ? "SALVAR ALTERAÇÕES" : "VERIFICAR E SALVAR"}</Text>}
      </TouchableOpacity>

      {/* MODAL DO CALENDÁRIO */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.calendarCard}>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#4a148c' } }}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendar(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4a148c', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#4a148c' },
  selectorText: { marginLeft: 10, fontSize: 16, color: '#4a148c' },
  btn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 10 },
  closeBtn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center' }
});