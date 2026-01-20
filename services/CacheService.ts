import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const CacheService = {
  
  getSmart: async (key: string, onlineFetcher: () => Promise<any>) => {
    const cacheKey = `@cache_${key}`;
    
    try {
     
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected && netState.isInternetReachable;

    
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (cachedString) {
        const cachedData = JSON.parse(cachedString);
        
        if (!isOnline) {
          console.log(`[Cache] Offline: Usando dados locais para ${key}`);
          return cachedData;
        }
      }

     
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

    
      if (cachedString) {
        return JSON.parse(cachedString);
      }

      return null;
    } catch (error) {
      console.error(`[Cache Error] ${key}:`, error);
      return null;
    }
  },

 
  getFromDisk: async (key: string) => {
    try {
      const json = await AsyncStorage.getItem(`@cache_${key}`);
      return json != null ? JSON.parse(json) : null;
    } catch (e) {
      return null;
    }
  },


  clear: async (key: string) => {
    try {
      await AsyncStorage.removeItem(`@cache_${key}`);
      console.log(`[Cache] Limpo: ${key}`);
    } catch (e) {
      console.error("Erro ao limpar cache", e);
    }
  }
};