import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebaseConfig';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore'; 
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAdmin } from '@/context/AdminContext'; 
import { useRouter } from 'expo-router'; 

import { CacheService } from '@/services/CacheService';

import { useTheme } from '@/context/ThemeContext';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';

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
  const { colors, isDark } = useTheme();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM')); 

  const carregarEventos = async () => {
    if (!refreshing) setLoading(true);

    try {
      const dadosEventos = await CacheService.getSmart('agenda_eventos', async () => {
        const q = query(collection(db, "eventos"), orderBy("criadoEm", "desc"));
        const snapshot = await getDocs(q);
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

      if (dadosEventos) setEventos(dadosEventos);
    } catch (error) {
      console.log("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregarEventos(); }, []);

  const handleDeleteEvento = (id: string) => {
    Alert.alert("Excluir Evento", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
          try { await deleteDoc(doc(db, "eventos", id)); carregarEventos(); } 
          catch (error) { Alert.alert("Erro", "Não foi possível excluir."); }
      }}
    ]);
  };

  const eventosFiltrados = useMemo(() => {
    if (selectedDate) return eventos.filter(e => e.dataISO === selectedDate);
    return eventos.filter(e => e.dataISO?.startsWith(currentMonth));
  }, [selectedDate, currentMonth, eventos]);

  const markedDates = useMemo(() => {
    const marks: any = {};
    eventos.forEach(e => {
      if (e.dataISO) marks[e.dataISO] = { marked: true, dotColor: colors.primary };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: colors.primary };
    }
    return marks;
  }, [eventos, selectedDate, colors]);

  if (loading && !refreshing) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Calendar
        // AQUI ESTÁ O SEGREDO: 'key' força o componente a recriar quando o tema muda
        key={isDark ? 'dark' : 'light'} 
        
        style={[styles.calendar, { backgroundColor: colors.card, shadowColor: colors.text }]}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        onMonthChange={(month: any) => { setCurrentMonth(month.dateString.substring(0, 7)); setSelectedDate(''); }}
        markedDates={markedDates}
        theme={{
          calendarBackground: colors.card,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.accent,
          dayTextColor: colors.text,
          textDisabledColor: isDark ? '#444' : '#d9e1e8',
          dotColor: colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: colors.primary,
          monthTextColor: colors.primary,
          indicatorColor: colors.primary,
        }}
      />

      <View style={[styles.listHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.listTitle, { color: colors.primary }]}>
          {selectedDate
            ? `Eventos em ${selectedDate.split('-').reverse().join('/')}`
            : `Eventos de ${LocaleConfig.locales['pt-br'].monthNames[parseInt(currentMonth.split('-')[1]) - 1]}`}
        </Text>
        {selectedDate && (
          <TouchableOpacity onPress={() => setSelectedDate('')}>
            <Text style={[styles.clearBtn, { color: colors.accent }]}>Ver Mês Todo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={eventosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum evento para este período.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <View style={[styles.dateBox, { backgroundColor: colors.accent }]}>
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardDate, { color: colors.accent }]}>
                {item.data} • {item.horaInicio} às {item.horaFim}
              </Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titulo}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.descricao}</Text>
            </View>

            {isAdmin && (
              <View style={styles.adminActions}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/admin/add_evento', params: { editId: item.id } })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvento(item.id)} style={styles.actionBtn}>
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
  container: { flex: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', borderBottomWidth: 1 },
  listTitle: { fontSize: 16, fontWeight: 'bold' },
  clearBtn: { fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', elevation: 2 },
  dateBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardDate: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginVertical: 2 },
  cardDesc: { fontSize: 14 },
  adminActions: { justifyContent: 'center', alignItems: 'center', paddingLeft: 10, gap: 10 },
  actionBtn: { padding: 5 },
  calendar: { marginTop: 40, marginBottom: 10, marginHorizontal: 10, borderRadius: 15, elevation: 4, shadowOpacity: 0.1, shadowRadius: 5, height: 'auto', padding: 10 },
});