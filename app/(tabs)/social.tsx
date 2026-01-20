import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TEMA
import { useTheme } from '@/context/ThemeContext';

export default function SocialScreen() {
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const SocialButton = ({ icon, title, url, color }: any) => (
    <TouchableOpacity 
      style={[styles.socialBtn, { backgroundColor: colors.card, shadowColor: colors.text }]} 
      onPress={() => openLink(url)}
    >
      <Ionicons name={icon} size={30} color={color} />
      <Text style={[styles.socialText, { color: colors.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Nossas Redes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/logo-igreja.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.churchName, { color: colors.primary }]}>IPB Calvário</Text>
          <Text style={[styles.slogan, { color: colors.textSecondary }]}>Conectados em Cristo</Text>
        </View>

        <SocialButton 
          icon="logo-instagram" 
          title="Instagram" 
          url="https://instagram.com/ipcalvariobotucatu" 
          color="#E1306C" 
        />
        <SocialButton 
          icon="logo-facebook" 
          title="Facebook" 
          url="https://facebook.com/ipcalvario" 
          color="#1877F2" 
        />
        {/* <SocialButton 
          icon="logo-youtube" 
          title="YouTube" 
          url="https://youtube.com/ipbcalvario" 
          color="#FF0000" 
        /> */}
        <SocialButton 
          icon="logo-whatsapp" 
          title="WhatsApp" 
          url="https://wa.me/5514991620440" 
          color="#25D366" 
        />
        <SocialButton 
          icon="location" 
          title="Como Chegar (Maps)" 
          url="https://maps.google.com/?q=Igreja+Presbiteriana+Calvario+Botucatu" 
          color={colors.primary} 
        />

        <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>Horários de Culto</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>Domingo: 09h (EBD) e 19h (Culto Solene)</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>Quinta: 20h (Estudo Bíblico)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, marginTop: 30, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  churchName: { fontSize: 22, fontWeight: 'bold' },
  slogan: { fontSize: 16 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  socialText: { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  infoCard: { padding: 20, borderRadius: 12, marginTop: 10, elevation: 2 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  infoText: { fontSize: 16, marginBottom: 5, textAlign: 'center' },
});