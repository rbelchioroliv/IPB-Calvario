// app/admin/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#4a148c' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      animation: 'slide_from_right' 
    }}>
      <Stack.Screen name="index" options={{ title: 'Painel Administrativo' }} />
      <Stack.Screen name="add_evento" options={{ title: 'Novo Evento' }} />
      <Stack.Screen name="add_aviso" options={{ title: 'Novo Aviso' }} />
      <Stack.Screen name="add_niver" options={{ title: 'Novo Aniversariante' }} />
    </Stack>
  );
}