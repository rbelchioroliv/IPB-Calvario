import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; // Adicionado doc e deleteDoc
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAdmin } from '@/context/AdminContext'; // Importado context de admin
import { useRouter } from 'expo-router'; // Importado router para edição

// Configuração do calendário para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';

// Definição do tipo do Evento
interface Evento {
  id: string;
  titulo: string;
  data: string;       // Formato texto vindo do admin (ex: "25/01")
  descricao: string;
  dataISO: string;    // Gerado automaticamente para o calendário (YYYY-MM-DD)
  criadoEm: any;
  horaInicio: string; 
  horaFim: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { isAdmin } = useAdmin(); // Puxa o estado de administrador

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(''); // Data clicada
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM')); // Mês visível

  // --- FUNÇÕES DE ADMIN ---

  const handleDeleteEvento = (id: string) => {
    Alert.alert(
      "Excluir Evento",
      "Tem certeza que deseja remover este evento da agenda?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "eventos", id));
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o evento.");
            }
          } 
        }
      ]
    );
  };

  // 1. Tenta converter o texto do admin "DD/MM" em "YYYY-MM-DD"
  const extrairDataParaCalendario = (textoData: string) => {
    try {
      const match = textoData.match(/(\d{1,2})\/(\d{1,2})/);
      if (match) {
        const dia = match[1].padStart(2, '0');
        const mes = match[2].padStart(2, '0');
        const ano = new Date().getFullYear();
        return `${ano}-${mes}-${dia}`;
      }
    } catch (e) { return undefined; }
    return undefined;
  };

  // 2. Busca eventos no Firebase
  useEffect(() => {
    const q = query(collection(db, "eventos"), orderBy("criadoEm", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Evento[] = [];
      snapshot.forEach((doc) => {
        const dataDoc = doc.data();
        lista.push({
          id: doc.id,
          titulo: dataDoc.titulo,
          descricao: dataDoc.descricao,
          data: dataDoc.data,
          dataISO: dataDoc.dataISO, // Puxa direto do Firebase
          horaInicio: dataDoc.horaInicio, // Puxa direto do Firebase
          horaFim: dataDoc.horaFim,       // Puxa direto do Firebase
          criadoEm: dataDoc.criadoEm
        } as Evento);
      });
      setEventos(lista);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Filtragem Inteligente (Mês ou Dia)
  const eventosFiltrados = useMemo(() => {
    if (selectedDate) {
      // Se clicou num dia, filtra apenas por esse dia
      return eventos.filter(e => e.dataISO === selectedDate);
    } else {
      // Se não, filtra todos os eventos do mês atual visível
      return eventos.filter(e => e.dataISO?.startsWith(currentMonth));
    }
  }, [selectedDate, currentMonth, eventos]);

  // 4. Marcação de pontos no calendário
  const markedDates = useMemo(() => {
    const marks: any = {};

    eventos.forEach(e => {
      if (e.dataISO) {
        marks[e.dataISO] = { marked: true, dotColor: '#4a148c' };
      }
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#4a148c'
      };
    }
    return marks;
  }, [eventos, selectedDate]);

  if (loading) return <ActivityIndicator size="large" color="#4a148c" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* CALENDÁRIO VISUAL */}
      <Calendar
        style={styles.calendar}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        onMonthChange={(month: any) => {
          setCurrentMonth(month.dateString.substring(0, 7));
          setSelectedDate(''); // Limpa filtro ao mudar mês
        }}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#ff9800',
          arrowColor: '#4a148c',
          selectedDayBackgroundColor: '#4a148c',
          dotColor: '#4a148c',
        }}
      />

      {/* CABEÇALHO DA LISTA */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {selectedDate
            ? `Eventos em ${selectedDate.split('-').reverse().join('/')}`
            : `Eventos de ${LocaleConfig.locales['pt-br'].monthNames[parseInt(currentMonth.split('-')[1]) - 1]}`}
        </Text>
        {selectedDate && (
          <TouchableOpacity onPress={() => setSelectedDate('')}>
            <Text style={styles.clearBtn}>Ver Mês Todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA DE EVENTOS */}
      <FlatList
        data={eventosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento para este período.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.dateBox}>
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardDate}>
                {item.data} • {item.horaInicio} às {item.horaFim}
              </Text>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc}>{item.descricao}</Text>
            </View>

            {/* BOTÕES DE ADMINISTRAÇÃO */}
            {isAdmin && (
              <View style={styles.adminActions}>
                <TouchableOpacity 
                  onPress={() => router.push({ pathname: '/admin/add_evento', params: { editId: item.id } })}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={22} color="#4a148c" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteEvento(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#4a148c' },
  clearBtn: { color: '#ff9800', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999', fontStyle: 'italic' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', elevation: 2 },
  dateBox: { backgroundColor: '#7b1fa2', width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardDate: { fontSize: 11, fontWeight: 'bold', color: '#7b1fa2', textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginVertical: 2 },
  cardDesc: { fontSize: 14, color: '#666' },

  // Estilos de Administração
  adminActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    gap: 10
  },
  actionBtn: {
    padding: 5
  },

  calendar: {
    marginTop: 40,        
    marginBottom: 10,        
    marginHorizontal: 10, 
    borderRadius: 15,     
    elevation: 4,         
    shadowColor: '#000',  
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 'auto',
    padding: 10,
  },
});