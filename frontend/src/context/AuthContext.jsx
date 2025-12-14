import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// URL del Login Core según el documento [cite: 16]
const CORE_LOGIN_URL = "https://core-frontend-2025-02.netlify.app"; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithToken = (token) => {
    try {
      // 1. Decodificar el token para obtener datos del usuario
      const decoded = jwtDecode(token);
      
      // 2. Verificar expiración (exp viene en segundos)
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.warn("El token ha expirado");
        redirectToCore();
        return;
      }

      // 3. Guardar usuario y token en el estado
      // Ajusta los campos según lo que traiga el JWT del Core (email, sub, id, role)
      setUser({
        ...decoded,
        token: token 
      });
      
      // Opcional: Guardar en localStorage para persistir si refresca la página
      localStorage.setItem('authToken', token);
      
      // Opcional: Limpiar la URL para que no se vea el token feo
      window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
      console.error("Token inválido", error);
      redirectToCore();
    } finally {
      setLoading(false);
    }
  };
  const goToCampus = () => {
    // Simplemente navegamos. El Core chequeará su propia sesión.
    window.location.href = CORE_LOGIN_URL;
  };

  // ✅ FUNCIÓN 2: CERRAR SESIÓN
  const logout = () => {
    // 1. Limpiamos estado local
    setUser(null);
    // 2. Limpiamos almacenamiento
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('lastOrder'); // Limpiamos órdenes pendientes por si acaso
    
    // 3. Redirigimos al Login del Core
    // No mandamos redirectUrl porque queremos que se quede en el login/logout
    window.location.href = `${CORE_LOGIN_URL}/login`; 
  };

  const redirectToCore = () => {
    // URL de retorno: Tu propia URL actual
    const currentUrl = window.location.origin; // Ej: https://uadestore.vercel.app
    // Construir URL de redirección según especificación [cite: 28, 29]
    window.location.href = `${CORE_LOGIN_URL}/?redirectUrl=${encodeURIComponent(currentUrl)}`;
  };


  useEffect(() => {
    // 1. Buscar token en la URL (query string) 
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('JWT');

    // 2. Buscar token en localStorage (por si recargó la página)
    const tokenFromStorage = localStorage.getItem('authToken');

    if (tokenFromUrl) {
      // Prioridad: Si viene de la URL, usamos ese (es un login fresco)
      loginWithToken(tokenFromUrl);
    } else if (tokenFromStorage) {
      // Si no hay en URL, intentamos recuperar la sesión anterior
      loginWithToken(tokenFromStorage);
    } else {
      // Si no hay token por ningún lado, mandamos al usuario al Core
      // IMPORTANTE: Solo redirigir si es una ruta protegida, o hacerlo aquí directamente.
      // Si tu tienda es pública y solo el checkout es privado, no redirijas automáticamente.
      console.log("No hay usuario, modo invitado o redirigir...");
      redirectToCore();
      //setLoading(false);
    }
  }, []);
    
  if (loading) {
        return <div className="p-10 text-center">Cargando autenticación...</div>;
    }
  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        logout,       // <--- Exponemos logout
        goToCampus,   // <--- Exponemos goToCampus
        redirectToCore // (tu función interna de redirección forzada)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
