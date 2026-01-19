import { db } from '@/services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importa sua lista
import { LISTA_HINOS_OFFLINE } from '../constants/lista_hinos';

export default function UploadHinosScreen() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(`Lista carregada: ${LISTA_HINOS_OFFLINE.length} hinos.`);

  const enviarHinosSeguro = async () => {
    if (loading) return;
    setLoading(true);
    setLog([]);
    setStatus("Verificando dados e enviando...");

    try {
      const dados = LISTA_HINOS_OFFLINE;
      let sucesso = 0;
      let erros = 0;

      for (const hino of dados) {
        // --- PROTEÇÃO CONTRA ERROS ---
    
        const baseNumber = hino.number ?? hino.numeroOrdenacao ?? hino.numero;
        const baseTitle = hino.title ?? hino.titulo ?? "Sem Título";
        const baseText = hino.text ?? hino.letra ?? "";

        
        if (baseNumber === undefined || baseNumber === null) {
            console.warn("Item ignorado (sem número):", hino);
            setLog(prev => [`⚠️ Item ignorado: sem número.`, ...prev]);
            continue;
        }
      

        try {
         
          let customId = String(baseNumber);
          let displayNum = String(baseNumber);
          let tituloFinal = String(baseTitle);

         
          const match = tituloFinal.match(/HNC\s*\d+\s*\((.+?)\)/);

          if (match) {
            const sufixo = match[1]; 
            
          
            const sufixoLimpo = sufixo.replace(/[^a-zA-Z0-9]/g, '');

            if (isNaN(Number(sufixoLimpo))) {
                // Se for letra (A, B): ID vira 400A
                customId = `${baseNumber}${sufixoLimpo}`; 
                displayNum = `${baseNumber}${sufixoLimpo}`;
            } else {
                // Se for número (2, 3): ID vira 400-2
                customId = `${baseNumber}-${sufixoLimpo}`;
                displayNum = `${baseNumber}.${sufixoLimpo}`;
            }
          }

          // Envia para o Firebase
          await setDoc(doc(db, "hinos", customId), {
            numero: parseInt(baseNumber.toString()), 
            display: displayNum,                     
            titulo: tituloFinal,                     
            letra: baseText,
            search_id: customId.toLowerCase()
          });

          sucesso++;
          
        
          if (customId !== String(baseNumber)) {
             setLog(prev => [`✨ Hino Variação: ${customId} salvo!`, ...prev]);
          } else if (sucesso % 50 === 0) {
             setLog(prev => [`⬆️ Processando hino ${baseNumber}...`, ...prev]);
          }

        } catch (error: any) {
          erros++;
          console.error(`Erro ao gravar hino ${baseNumber}:`, error);
          setLog(prev => [`❌ Falha no hino ${baseNumber}: ${error.message}`, ...prev]);
        }
      }

      setStatus("Concluído!");
      Alert.alert("Processo Finalizado", `Sucesso: ${sucesso}\nErros: ${erros}`);

    } catch (error: any) {
      setStatus("Erro Geral");
      Alert.alert("Erro Fatal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Blindado</Text>
      <Text style={styles.subtitle}>
        Lendo {LISTA_HINOS_OFFLINE.length} registros
      </Text>

      {loading && <ActivityIndicator size="large" color="#4a148c" style={{ margin: 20 }} />}
      <Text style={styles.statusText}>{status}</Text>

      <TouchableOpacity 
        style={[styles.btn, loading && styles.btnDisabled]} 
        onPress={enviarHinosSeguro}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "ENVIANDO..." : "ENVIAR AGORA"}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.logBox}>
        {log.map((item, index) => <Text key={index} style={styles.logItem}>{item}</Text>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f3e5f5' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#4a148c', marginTop: 40 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  statusText: { textAlign: 'center', fontWeight: 'bold', marginBottom: 15, color: '#333' },
  btn: { backgroundColor: '#4a148c', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#999' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  logBox: { flex: 1, marginTop: 20, backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  logItem: { fontSize: 12, marginBottom: 4, color: '#333' }
});