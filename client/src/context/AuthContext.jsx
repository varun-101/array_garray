import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// User shape reference (not TypeScript):
// {
//   id, githubId, username, name, email, avatar, githubUrl, lastLoginAt
// }

const AuthContext = createContext({
  user: null,
  accessToken: null,
  setAuth: (_auth) => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken && parsed?.user) {
          setAccessToken(parsed.accessToken);
          setUser(parsed.user);
        }
      }
    } catch {}
  }, []);

  const setAuth = (auth) => {
    if (auth && auth.accessToken && auth.user) {
      setAccessToken(auth.accessToken);
      setUser(auth.user);
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch {}
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    try {
      localStorage.removeItem('auth');
    } catch {}
  };

  const value = useMemo(() => ({ user, accessToken, setAuth, logout }), [user, accessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


