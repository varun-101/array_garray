import React from 'react';

export interface AuthUser {
  id: string;
  githubId?: string;
  username?: string;
  name?: string;
  email?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  title?: string;
  joined?: string;
  avatar?: string;
  githubUrl?: string;
  lastLoginAt?: string;
}

export interface MentorUser {
  _id: string;
  name: string;
  organization: string;
  role: string;
  email: string;
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  mentor: MentorUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isMentorAuthenticated: boolean;
  userType: 'developer' | 'mentor' | null;
  loginWithGithub: () => void;
  loginMentor: (mentorData: MentorUser) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  user: 'auth_user',
  mentor: 'mentor_data',
  token: 'auth_token',
} as const;

function parseHashForAuth(hash: string): { accessToken: string | null; user: AuthUser | null } {
  if (!hash || hash[0] !== '#') return { accessToken: null, user: null };
  const query = new URLSearchParams(hash.slice(1));
  const accessToken = query.get('accessToken');
  const encodedUser = query.get('user');
  if (!encodedUser) return { accessToken, user: null };
  try {
    const json = atob(decodeURIComponent(encodedUser));
    console.log( JSON.parse(json))
    const parsed = JSON.parse(json) as AuthUser;
    return { accessToken, user: parsed };
  } catch {
    return { accessToken, user: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [mentor, setMentor] = React.useState<MentorUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1) Load persisted auth
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedMentor = localStorage.getItem(STORAGE_KEYS.mentor);
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);
    if (storedToken) setAccessToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    if (storedMentor) {
      try {
        setMentor(JSON.parse(storedMentor));
      } catch {}
    }

    // 2) Parse OAuth callback from hash
    const { accessToken: tokenFromHash, user: userFromHash } = parseHashForAuth(window.location.hash);
    if (tokenFromHash && userFromHash) {
      setAccessToken(tokenFromHash);
      setUser(userFromHash);
      localStorage.setItem(STORAGE_KEYS.token, tokenFromHash);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userFromHash));
      // Clean hash
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  const loginWithGithub = React.useCallback(() => {
    window.location.href = `${apiBase}/auth/github`;
  }, [apiBase]);

  const loginMentor = React.useCallback((mentorData: MentorUser) => {
    setMentor(mentorData);
    setUser(null); // Clear developer auth
    setAccessToken(null);
    localStorage.setItem(STORAGE_KEYS.mentor, JSON.stringify(mentorData));
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    
  }, []);

  const logout = React.useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setMentor(null);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.mentor);
  }, []);

  const isAuthenticated = Boolean(user && accessToken);
  const isMentorAuthenticated = Boolean(mentor);
  const userType = isAuthenticated ? 'developer' : isMentorAuthenticated ? 'mentor' : null;

  const value: AuthContextValue = {
    user,
    mentor,
    accessToken,
    isAuthenticated,
    isMentorAuthenticated,
    userType,
    loginMentor,
    loginWithGithub,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;


