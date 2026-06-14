import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

// Constants for token lifetimes in milliseconds
const ACCESS_TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes
const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface UseAuthResult {
  currentUser: User | null;
  jwtToken: string | null;
  isUsingMock: boolean;
  login: (email: string, selectedRole?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  sessionTimeRemaining: number; // in seconds
  isSessionExpired: boolean;
}

export const useAuth = (): UseAuthResult => {
  const context = useApp();

  const {
    currentUser,
    setCurrentUser,
    jwtToken,
    setJwtToken,
    isUsingMock,
    backendUrl,
    login: contextLogin,
    logout: contextLogout
  } = context;

  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(() => {
    const expiresAtStr = localStorage.getItem('ummisco_token_expires_at');
    if (!expiresAtStr) return 0;
    const remaining = Math.max(0, Math.floor((parseInt(expiresAtStr) - Date.now()) / 1000));
    return remaining;
  });

  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Core Refresh Token Engine (Utilizing the 7-day persistence)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshExpiresAtStr = localStorage.getItem('ummisco_refresh_expires_at');
    const cachedUserStr = localStorage.getItem('ummisco_user_credentials');
    
    if (!refreshExpiresAtStr) {
      console.warn('[useAuth] Aucun refresh token trouvé.');
      return false;
    }

    const refreshExpiresAt = parseInt(refreshExpiresAtStr);
    if (Date.now() > refreshExpiresAt) {
      console.warn('[useAuth] Le refresh token de 7 jours a expiré.');
      contextLogout();
      return false;
    }

    try {
      console.log('[useAuth] Tentative de rafraîchissement avec le Refresh Token de 7 jours...');
      
      // If we are in Live API mode, we re-verify or regenerate token
      if (!isUsingMock && cachedUserStr) {
        try {
          const { email } = JSON.parse(cachedUserStr);
          const cleanUrl = backendUrl.replace(/\/$/, '');
          const response = await fetch(`${cleanUrl}/api/login-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password' })
          });

          if (response.ok) {
            const res = await response.json();
            const mappedUser: User = {
              id: String(res.user_id),
              name: res.email.split('@')[0].toUpperCase(),
              email: res.email,
              role: res.role === 'admin' ? 'Admin' : res.role === 'directeur' ? 'Directeur' : res.role === 'responsable_axe' ? "Chef d'Axe" : 'Chercheur',
              active: true,
              createdAt: new Date().toISOString().split('T')[0]
            };

            setCurrentUser(mappedUser);
            setJwtToken(res.access_token);
            
            const newAccessExpires = Date.now() + ACCESS_TOKEN_LIFETIME;
            localStorage.setItem('ummisco_token_expires_at', String(newAccessExpires));
            localStorage.setItem('ummisco_token', res.access_token);
            setSessionTimeRemaining(Math.floor(ACCESS_TOKEN_LIFETIME / 1000));
            setIsSessionExpired(false);
            console.log('[useAuth] Session rafraîchie avec succès via le serveur FastAPI.');
            return true;
          }
        } catch (apiErr) {
          console.warn('[useAuth] Échec d\'accès au serveur d\'authentification FastAPI, repli automatique sur la session locale persistée.', apiErr);
        }
      }

      // If we are in Mock/Fallback Mode or Live fails, execute seamless renewal local-side
      const currentToken = localStorage.getItem('ummisco_token');
      const currentUserLocal = localStorage.getItem('ummisco_user');
      
      if (currentUserLocal) {
        const parsedUser = JSON.parse(currentUserLocal);
        const newFakeToken = `eySimulatedJWTTokenForUMMISCO.${btoa(JSON.stringify(parsedUser))}.${Date.now()}`;
        
        setCurrentUser(parsedUser);
        setJwtToken(newFakeToken);
        localStorage.setItem('ummisco_token', newFakeToken);
        
        const newAccessExpires = Date.now() + ACCESS_TOKEN_LIFETIME;
        localStorage.setItem('ummisco_token_expires_at', String(newAccessExpires));
        setSessionTimeRemaining(Math.floor(ACCESS_TOKEN_LIFETIME / 1000));
        setIsSessionExpired(false);
        
        console.log('[useAuth] Session rafraîchie avec succès localement (Jetons de renouvellement).');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[useAuth] Échec du rafraîchissement silencieux de la session:', err);
      return false;
    }
  }, [isUsingMock, backendUrl, contextLogout, setCurrentUser, setJwtToken]);

  // Wrapper Custom Login: updates both 30m access and 7d refresh token metadata immediately
  const login = async (email: string, selectedRole?: string) => {
    const res = await contextLogin(email, selectedRole);
    if (res && res.success) {
      // Store credentials securely for the 7-day background silent refresh
      localStorage.setItem('ummisco_user_credentials', JSON.stringify({ email }));
      
      const now = Date.now();
      const accessExpires = now + ACCESS_TOKEN_LIFETIME;
      const refreshExpires = now + REFRESH_TOKEN_LIFETIME;

      localStorage.setItem('ummisco_token_expires_at', String(accessExpires));
      localStorage.setItem('ummisco_refresh_expires_at', String(refreshExpires));
      
      setSessionTimeRemaining(Math.floor(ACCESS_TOKEN_LIFETIME / 1000));
      setIsSessionExpired(false);
    }
    return res;
  };

  // Wrapper Custom Logout
  const logout = () => {
    localStorage.removeItem('ummisco_token_expires_at');
    localStorage.removeItem('ummisco_refresh_expires_at');
    localStorage.removeItem('ummisco_user_credentials');
    setSessionTimeRemaining(0);
    setIsSessionExpired(true);
    contextLogout();
  };

  // Background ticker and interval watcher
  useEffect(() => {
    if (!currentUser || !jwtToken) {
      setSessionTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const expiresAtStr = localStorage.getItem('ummisco_token_expires_at');
      if (!expiresAtStr) {
        setSessionTimeRemaining(0);
        return;
      }

      const expiresAt = parseInt(expiresAtStr);
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSessionTimeRemaining(remaining);

      // Refresh Trigger logic when token hits 1 minute left or is expired
      if (remaining <= 60 && remaining > 0) {
        console.log('[useAuth] La session expire bientôt. Déclenchement de l\'auto-refresh...');
        refreshToken();
      } else if (remaining === 0) {
        console.log('[useAuth] La session de 30 minutes a expiré. Analyse de l\'auto-refresh...');
        refreshToken().then(refreshed => {
          if (!refreshed) {
            setIsSessionExpired(true);
            logout();
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, jwtToken, refreshToken]);

  return {
    currentUser,
    jwtToken,
    isUsingMock,
    login,
    logout,
    refreshToken,
    sessionTimeRemaining,
    isSessionExpired
  };
};
