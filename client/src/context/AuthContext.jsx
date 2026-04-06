import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";

const AUTH_STORAGE_KEY = "vajra_auth";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return {
        token: "",
        user: null,
        interests: null,
      };
    }

    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || "",
      user: parsed.user || null,
      interests: parsed.interests || null,
    };
  } catch {
    return {
      token: "",
      user: null,
      interests: null,
    };
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(readStoredAuth);

  const persistAuth = useCallback((nextState) => {
    setAuthState(nextState);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
  }, []);

  const login = useCallback(
    ({ token, identity }) => {
      const next = {
        token,
        user: identity,
        interests: authState.interests || null,
      };

      persistAuth(next);
    },
    [authState.interests, persistAuth],
  );

  const register = useCallback(
    ({ token, identity }) => {
      const next = {
        token,
        user: identity,
        interests: null,
      };

      persistAuth(next);
    },
    [persistAuth],
  );

  const saveInterests = useCallback(
    (interests) => {
      const next = {
        ...authState,
        interests,
      };

      persistAuth(next);
    },
    [authState, persistAuth],
  );

  const logout = useCallback(() => {
    const cleared = {
      token: "",
      user: null,
      interests: null,
    };

    persistAuth(cleared);
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      interests: authState.interests,
      isAuthenticated: Boolean(authState.token),
      hasCompletedInterests: Boolean(authState.interests),
      login,
      register,
      saveInterests,
      logout,
    }),
    [authState, login, logout, register, saveInterests],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
