// app/(tabs)/calendar.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { EVENTOS_CALENDARIO } from '@/constants/churchData';


LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); 

  
  const markedDates = EVENTOS_CALENDARIO.reduce((acc, evento) => {
    acc[evento.data] = { marked: true, dotColor: '#4a148c' };
    return acc;
  }, {} as any);

 
  const eventosDoMes = EVENTOS_CALENDARIO.filter(evento => 
    evento.data.startsWith(selectedMonth)
  ).sort((a, b) => a.data.localeCompare(b.data)); 


  const formatarDataLista = (dataString: string) => {
    const [ano, mes, dia] = dataString.split('-');
    const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const diaSemana = LocaleConfig.locales['pt-br'].dayNamesShort[date.getDay()];
    return `${dia}/${mes} - ${diaSemana}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda da Igreja</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#4a148c',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#4a148c',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#4a148c',
            selectedDotColor: '#ffffff',
            arrowColor: '#4a148c',
            monthTextColor: '#4a148c',
            indicatorColor: '#4a148c',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          markedDates={markedDates}
        
          onMonthChange={(month) => {
            setSelectedMonth(month.dateString.substring(0, 7));
          }}
          enableSwipeMonths={true}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Eventos em {selectedMonth.split('-').reverse().join('/')}</Text>
        
        {eventosDoMes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum evento agendado para este mês.</Text>
        ) : (
          <FlatList
            data={eventosDoMes}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{item.data.split('-')[2]}</Text>
                  <Text style={styles.monthText}>{LocaleConfig.locales['pt-br'].monthNamesShort[parseInt(item.data.split('-')[1]) - 1]}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.titulo}</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.eventTime}>{item.hora} • {item.tipo}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1bee7', marginTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4a148c', textAlign: 'center' },
  calendarContainer: { backgroundColor: '#fff', marginBottom: 10, elevation: 2 },
  listContainer: { flex: 1, padding: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#4a148c', marginBottom: 10, marginLeft: 5 },
  eventCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, padding: 15, alignItems: 'center', elevation: 2 },
  dateBox: { backgroundColor: '#f3e5f5', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center', width: 60, marginRight: 15 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#4a148c' },
  monthText: { fontSize: 12, color: '#7b1fa2', textTransform: 'uppercase' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  eventTime: { fontSize: 14, color: '#666', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});