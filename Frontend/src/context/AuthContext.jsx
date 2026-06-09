import { createContext, useContext, useState } from 'react';
import { dummyUser } from '../data/dummyData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to dummyUser so the app is explorable without a backend
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call:
      // const res = await fetch('/login', { method: 'POST', body: JSON.stringify(credentials), headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
      await new Promise(r => setTimeout(r, 800)); // Simulate network delay

      // Determine role from credentials and set appropriate dummy user
      const roleMap = {
        admin: { ...dummyUser, name: 'Dr. Anjali Gupta', email: credentials.email || 'admin@smcs.edu', role: 'admin' },
        faculty: { ...dummyUser, name: 'Prof. Vikram Singh', email: credentials.email || 'faculty@smcs.edu', role: 'faculty' },
        student: { ...dummyUser, name: 'Rahul Sharma', role: 'student', contactNumber: credentials.contactNumber || 9876543210 },
      };
      setUser(roleMap[credentials.role] || roleMap.student);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // TODO: Replace with real API call:
    // await fetch('/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
