import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const CacheService = {
  // Busca dados: Tenta Cache Primeiro -> Se falhar ou for velho, tenta Online -> Salva Cache
  getSmart: async (key: string, onlineFetcher: () => Promise<any>) => {
    const cacheKey = `@cache_${key}`;
    
    try {
      // 1. Verifica conexão
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected && netState.isInternetReachable;

      // 2. Tenta pegar do cache
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (cachedString) {
        const cachedData = JSON.parse(cachedString);
        // Se estiver offline, retorna o cache independente da idade
        if (!isOnline) {
          console.log(`[Cache] Offline: Usando dados locais para ${key}`);
          return cachedData;
        }
      }

      // 3. Se estiver online, tenta buscar dados novos
      if (isOnline) {
        try {
          const onlineData = await onlineFetcher();
          // Salva no cache para a próxima vez
          await AsyncStorage.setItem(cacheKey, JSON.stringify(onlineData));
          return onlineData;
        } catch (err) {
          console.warn(`[Cache] Falha ao buscar online ${key}, tentando fallback cache.`);
        }
      }

      // 4. Fallback: Se a busca online falhou, retorna o cache antigo se existir
      if (cachedString) {
        return JSON.parse(cachedString);
      }

      return null;
    } catch (error) {
      console.error(`[Cache Error] ${key}:`, error);
      return null;
    }
  },

  // Apenas recupera do disco (sem tentar internet)
  getFromDisk: async (key: string) => {
    try {
      const json = await AsyncStorage.getItem(`@cache_${key}`);
      return json != null ? JSON.parse(json) : null;
    } catch (e) {
      return null;
    }
  },

  // --- NOVA FUNÇÃO QUE FALTAVA ---
  // Limpa uma chave específica para forçar recarregamento
  clear: async (key: string) => {
    try {
      await AsyncStorage.removeItem(`@cache_${key}`);
      console.log(`[Cache] Limpo: ${key}`);
    } catch (e) {
      console.error("Erro ao limpar cache", e);
    }
  }
};