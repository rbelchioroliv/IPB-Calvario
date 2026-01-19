import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebaseConfig';
// Trocamos onSnapshot por getDocs para usar com o CacheService
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore'; 
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'expo-router';

// Import do Serviço de Cache
import { CacheService } from '@/services/CacheService';

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
  data: string;
  descricao: string;
  dataISO: string;
  criadoEm: any;
  horaInicio: string; 
  horaFim: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { isAdmin } = useAdmin();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Novo estado para o pull-to-refresh
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // --- FUNÇÃO DE CARGA COM CACHE ---
  const carregarEventos = async () => {
    // Só exibe o loading de tela cheia se não for um refresh manual
    if (!refreshing) setLoading(true);

    try {
      // Busca Inteligente: Tenta Online (e salva) > Falha > Usa Offline
      const dados = await CacheService.getSmart('agenda_eventos', async () => {
        const q = query(collection(db, "eventos"), orderBy("criadoEm", "desc"));
        const snapshot = await getDocs(q);
        
        // Mapeia os dados dentro do fetcher para salvar limpo no cache
        return snapshot.docs.map((doc) => {
          const dataDoc = doc.data();
          return {
            id: doc.id,
            titulo: dataDoc.titulo,
            descricao: dataDoc.descricao,
            data: dataDoc.data,
            dataISO: dataDoc.dataISO,
            horaInicio: dataDoc.horaInicio,
            horaFim: dataDoc.horaFim,
            criadoEm: dataDoc.criadoEm
          } as Evento;
        });
      });

      if (dados) {
        setEventos(dados);
      }
    } catch (error) {
      console.log("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carrega ao iniciar
  useEffect(() => {
    carregarEventos();
  }, []);

  // Função para o Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarEventos();
  }, []);

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
              // Após excluir, recarrega a lista para atualizar o cache e a UI
              carregarEventos();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o evento.");
            }
          } 
        }
      ]
    );
  };

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

  // 3. Filtragem Inteligente (Mês ou Dia)
  const eventosFiltrados = useMemo(() => {
    if (selectedDate) {
      return eventos.filter(e => e.dataISO === selectedDate);
    } else {
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

  if (loading && !refreshing) return <ActivityIndicator size="large" color="#4a148c" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* CALENDÁRIO VISUAL */}
      <Calendar
        style={styles.calendar}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        onMonthChange={(month: any) => {
          setCurrentMonth(month.dateString.substring(0, 7));
          setSelectedDate(''); 
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
        // Adicionado o controle de atualização manual
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a148c']} />
        }
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