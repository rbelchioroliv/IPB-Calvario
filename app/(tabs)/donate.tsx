import React, { useState, useCallback } from 'react'; // Adicionado useCallback
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Clipboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; // Adicionado useFocusEffect

// Firebase Imports
import { db } from '@/services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Contexts
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';

export default function DonateScreen() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [pixKey, setPixKey] = useState("Carregando...");
  const [bankInfo, setBankInfo] = useState("Carregando...");

  // USAR useFocusEffect PARA ATUALIZAR SEMPRE QUE A TELA APARECER
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Garante que não atualize se a tela fechar

      const fetchInfo = async () => {
        try {
          const docRef = doc(db, "config", "doacao");
          const docSnap = await getDoc(docRef);
          
          if (isActive && docSnap.exists()) {
            const data = docSnap.data();
            setPixKey(data.pix || "Chave não cadastrada");

            // Lógica de exibição (Texto pronto ou montado na hora)
            if (data.bank) {
              setBankInfo(data.bank);
            } 
            else if (data.bancoNome || data.agencia) {
              const banco = data.bancoNome || "Banco";
              const ag = data.agencia || "0000";
              const cc = data.conta || "00000-0";
              const titular = data.titular || "Igreja";
              setBankInfo(`Banco: ${banco}\nAg: ${ag} | CC: ${cc}\nTitular: ${titular}`);
            } 
            else {
              setBankInfo("Dados bancários não configurados");
            }
          } else if (isActive) {
            setPixKey("Chave PIX não configurada");
            setBankInfo("Dados bancários não configurados");
          }
        } catch (e) {
          console.error("Erro ao buscar dados:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchInfo();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const copyToClipboard = () => {
    Clipboard.setString(pixKey);
    Alert.alert("Copiado!", "A chave PIX foi copiada para a área de transferência.");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Contribuição</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart-circle" size={80} color={colors.accent} />
          <Text style={[styles.verse, { color: colors.text }]}>Sua generosidade ajuda a manter nossa igreja e missões.</Text>
          
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          
          {/* Seção PIX */}
          <View style={styles.cardHeader}>
            <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Dízimos e Ofertas (PIX)</Text>
          </View>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Chave PIX:</Text>
          <View style={[styles.pixBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Text style={[styles.pixKey, { color: colors.text }]} selectable>{pixKey}</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={20} color={colors.accent} />
              <Text style={[styles.copyText, { color: colors.accent }]}>Copiar</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Seção Banco */}
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Transferência Bancária</Text>
          </View>
          <Text style={[styles.bankInfo, { color: colors.text }]}>{bankInfo}</Text>
        </View>

        {/* Botão visível apenas para Admins */}
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/admin/edit_donate')}
          >
            <Ionicons name="settings-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Editar Dados (Admin)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, marginTop: 30, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  iconContainer: { alignItems: 'center', marginBottom: 30 },
  verse: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  verseRef: { fontSize: 14, marginTop: 5 },
  card: { borderRadius: 15, padding: 20, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  label: { marginBottom: 5, fontSize: 14 },
  pixBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  pixKey: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  copyText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  divider: { height: 1, marginVertical: 15 },
  bankInfo: { fontSize: 16, lineHeight: 26 },
  editButton: { flexDirection: 'row', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  editButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
});