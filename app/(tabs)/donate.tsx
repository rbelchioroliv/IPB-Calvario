import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DonationScreen() {
  const pixKey = "00.000.000/0001-00"; 

  const copyToClipboard = () => {
    Alert.alert("Sucesso", "Chave PIX copiada (simulação)!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dízimos e Ofertas</Text>
        <Text style={styles.subtitle}>Contribua com a obra</Text>
      </View>

      <View style={styles.qrContainer}>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' }} 
          style={styles.qrCode} 
        />
        <Text style={styles.instruction}>Escaneie o QR Code ou copie a chave:</Text>
        
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.keyText}>{pixKey}</Text>
          <Ionicons name="copy-outline" size={20} color="#4a148c" />
        </TouchableOpacity>
        
        <Text style={styles.bankInfo}>
          Banco do Brasil{'\n'}
          Ag: 0000-0  CC: 00000-0{'\n'}
          IPB Calvário
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4a148c' }, // Roxo Escuro (Igual ao topo da Home)
  header: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#e1bee7', marginTop: 5 }, // Lilás claro
  qrContainer: { flex: 2.5, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, alignItems: 'center' },
  qrCode: { width: 200, height: 200, marginBottom: 20 },
  instruction: { textAlign: 'center', color: '#666', marginBottom: 20 },
  copyButton: { flexDirection: 'row', backgroundColor: '#f3e5f5', padding: 15, borderRadius: 10, width: '100%', justifyContent: 'space-between', alignItems: 'center' },
  keyText: { fontWeight: 'bold', fontSize: 16, color: '#4a148c' },
  bankInfo: { marginTop: 30, textAlign: 'center', color: '#888', lineHeight: 22 }
});