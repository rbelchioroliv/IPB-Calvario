import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { db } from '@/services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

export default function DonateScreen() {
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta mudanças em tempo real
    const unsubscribe = onSnapshot(doc(db, "configuracoes", "doacoes"), (snapshot) => {
      if (snapshot.exists()) {
        setDados(snapshot.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const copiarPix = async () => {
    if (dados?.chavePix) {
      await Clipboard.setStringAsync(dados.chavePix);
      Alert.alert("Copiado!", "Chave PIX copiada para a área de transferência.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4a148c" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dízimos e Ofertas</Text>
        <Text style={styles.subtitle}>Sua generosidade ajuda a manter nossa igreja e missões.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dados Bancários</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>{dados?.banco || "Não configurado"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Titular:</Text>
          <Text style={styles.value}>{dados?.titular}</Text>
        </View>

        {dados?.agencia && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Agência:</Text>
            <Text style={styles.value}>{dados?.agencia}</Text>
          </View>
        )}

        {dados?.conta && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Conta:</Text>
            <Text style={styles.value}>{dados?.conta}</Text>
          </View>
        )}

        <View style={styles.pixContainer}>
          <Text style={[styles.label, { textAlign: 'center', marginBottom: 5 }]}>Chave PIX:</Text>
          <Text style={styles.pixKey}>{dados?.chavePix}</Text>
          
          <TouchableOpacity style={styles.copyBtn} onPress={copiarPix}>
            <Ionicons name="copy-outline" size={20} color="#fff" />
            <Text style={styles.copyBtnText}>COPIAR CHAVE PIX</Text>
          </TouchableOpacity>
        </View>

        {dados?.qrCodeUrl ? (
          <View style={styles.qrContainer}>
            <Text style={styles.label}>Aponte a câmera para doar:</Text>
            <Image 
              source={{ uri: dados.qrCodeUrl }} 
              style={styles.qrCode} 
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text style={styles.noQrText}>QR Code não disponível.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4a148c', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#e1bee7', textAlign: 'center', marginTop: 10 },
  card: { backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 20, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#4a148c', marginBottom: 15, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#666' },
  value: { color: '#333' },
  pixContainer: { marginTop: 20, padding: 15, backgroundColor: '#f3e5f5', borderRadius: 10 },
  pixKey: { fontSize: 16, fontWeight: 'bold', color: '#4a148c', textAlign: 'center', marginBottom: 10 },
  copyBtn: { backgroundColor: '#4a148c', flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  copyBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  qrContainer: { alignItems: 'center', marginTop: 20 },
  qrCode: { width: 200, height: 200, marginTop: 10 },
  noQrText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});