// context/AdminContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria o contexto com valores padrão
const AdminContext = createContext({
  isAdmin: false,
  loginAdmin: (senha: string) => false,
  logoutAdmin: () => {},
});

export const AdminProvider = ({ children }: any) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const SENHA_MESTRA = "1234"; // <--- SUA SENHA AQUI

  useEffect(() => {
    // Verifica se já estava logado antes ao abrir o app
    AsyncStorage.getItem('is_admin_user').then(val => {
      if (val === 'true') setIsAdmin(true);
    });
  }, []);

  const loginAdmin = (senha: string) => {
    if (senha === SENHA_MESTRA) {
      setIsAdmin(true);
      AsyncStorage.setItem('is_admin_user', 'true'); // Salva que é admin
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    AsyncStorage.removeItem('is_admin_user'); // Remove o login
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar fácil
export const useAdmin = () => useContext(AdminContext);