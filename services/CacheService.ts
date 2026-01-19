import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const CacheService = {
  // Tenta buscar online primeiro. Se der certo, salva/atualiza o cache.
  // Se estiver sem net ou der erro, busca do cache salvo.
  getSmart: async (key: string, onlineFetcher: () => Promise<any>) => {
    const netState = await NetInfo.fetch();
    const isOnline = netState.isConnected && netState.isInternetReachable;

    if (isOnline) {
      try {
        console.log(`[CacheService] Online: Buscando novos dados para ${key}...`);
        const data = await onlineFetcher();
        await AsyncStorage.setItem(key, JSON.stringify(data)); // Salva/Sobrescreve o cache
        return data;
      } catch (error) {
        console.warn(`[CacheService] Erro ao buscar online. Tentando cache...`, error);
        return await CacheService.getFromDisk(key);
      }
    } else {
      console.log(`[CacheService] Offline: Lendo do cache para ${key}...`);
      return await CacheService.getFromDisk(key);
    }
  },

  getFromDisk: async (key: string) => {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
};