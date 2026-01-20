import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext'; // <--- Import do Tema

export default function TabLayout() {
  // Pegando as cores do tema atual (Dark ou Light)
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        // Cores Dinâmicas
        tabBarActiveTintColor: colors.primary,       // Cor do ícone ativo
        tabBarInactiveTintColor: colors.textSecondary, // Cor do ícone inativo
        headerShown: false,
        tabBarStyle: { 
          paddingBottom: 5, 
          height: 60, 
          backgroundColor: colors.card,      // Fundo da barra (muda conforme o tema)
          borderTopColor: colors.border,     // Borda suave no topo
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bíblia',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Doar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'logo-instagram' : 'logo-instagram'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}