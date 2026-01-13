// app/(tabs)/social.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INSTAGRAM_POSTS } from '@/constants/churchData';

export default function SocialScreen() {
  const [postsAtuais, setPostsAtuais] = useState<typeof INSTAGRAM_POSTS>([]);

  useEffect(() => {
    const atualizarPosts = () => {
      
      if (INSTAGRAM_POSTS.length <= 3) {
        setPostsAtuais(INSTAGRAM_POSTS);
        return;
      }

      const horaAtual = new Date().getHours();
      const indiceGrupo = horaAtual % 3; 
      const inicio = indiceGrupo * 3;
      
      const fim = Math.min(inicio + 3, INSTAGRAM_POSTS.length);
      
      const postsSelecionados = INSTAGRAM_POSTS.slice(inicio, fim);
      
    
      setPostsAtuais(postsSelecionados.length > 0 ? postsSelecionados : INSTAGRAM_POSTS.slice(0, 3));
    };

    atualizarPosts();
  }, []);

  const openInstagramProfile = () => {
    Linking.openURL('https://www.instagram.com/ipcalvariobotucatu/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nossas Redes</Text>
        <Text style={styles.subtitle}>Fique por dentro do que acontece</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instaBadge}>
          <Ionicons name="logo-instagram" size={20} color="#C13584" />
          <Text style={styles.badgeText}>@ipcalvariobotucatu</Text>
        </View>

        <Text style={styles.infoText}>
          Destaques da Igreja
        </Text>

        {postsAtuais.map((item) => (
          <View key={item.id} style={styles.postCard}>
      
            <Image source={item.img} style={styles.postImage} />
            
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{item.caption}</Text>
              <View style={styles.actions}>
                <Ionicons name="heart-outline" size={24} color="#333" style={{marginRight: 10}} />
                <Ionicons name="chatbubble-outline" size={24} color="#333" />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={openInstagramProfile}>
          <Text style={styles.buttonText}>Ver todos os posts no Instagram</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 5 }}/>
        </TouchableOpacity>
      </View>
      <View style={{height: 20}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1bee7', marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4a148c', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7b1fa2', textAlign: 'center' },
  content: { padding: 15 },
  instaBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 10, elevation: 1 },
  badgeText: { fontWeight: 'bold', color: '#C13584', marginLeft: 8 },
  infoText: { textAlign: 'center', color: '#888', marginBottom: 20, fontSize: 12, fontStyle: 'italic' },
  postCard: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  postImage: { width: '100%', height: 300, resizeMode: 'cover' },
  captionContainer: { padding: 15 },
  caption: { fontSize: 14, color: '#333', marginBottom: 10, lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: 5 },
  button: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});