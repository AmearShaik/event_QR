import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '../../../shared/types';
import { api } from '../services/api';

export interface StudentSession {
  eligible: boolean;
  status: string;
  message?: string;
  candidate: {
    id?: string;
    studentId: string;
    name: string;
    program: string;
    paymentStatus: string;
    registrationStatus?: string;
    eligibilityStatus?: boolean;
  };
  event?: {
    id: string;
    name: string;
    slug: string;
  };
  qrToken?: string;
  attendance?: {
    id: string;
    entryTime: string;
    status: string;
  } | null;
}

interface AuthContextType {
  role: 'ADMIN' | 'STUDENT' | null;
  adminUser: UserDto | null;
  studentSession: StudentSession | null;
  token: string | null;
  isLoading: boolean;
  loginAdmin: (token: string, user: UserDto) => void;
  loginStudent: (session: StudentSession) => void;
  updateStudentAttendance: (attendance: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  adminUser: null,
  studentSession: null,
  token: null,
  isLoading: true,
  loginAdmin: () => {},
  loginStudent: () => {},
  updateStudentAttendance: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'ADMIN' | 'STUDENT' | null>(null);
  const [adminUser, setAdminUser] = useState<UserDto | null>(null);
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      const storedStudentSession = localStorage.getItem('student_session');

      if (storedToken) {
        try {
          const res = await api.me();
          setAdminUser(res.user);
          setToken(storedToken);
          setRole('ADMIN');
          setIsLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem('admin_token');
          setToken(null);
          setAdminUser(null);
        }
      }

      if (storedStudentSession) {
        try {
          const parsed = JSON.parse(storedStudentSession);
          if (parsed && parsed.candidate) {
            setStudentSession(parsed);
            setRole('STUDENT');
          }
        } catch (e) {
          localStorage.removeItem('student_session');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginAdmin = (newToken: string, newUser: UserDto) => {
    localStorage.removeItem('student_session');
    setStudentSession(null);
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setAdminUser(newUser);
    setRole('ADMIN');
  };

  const loginStudent = (session: StudentSession) => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdminUser(null);
    localStorage.setItem('student_session', JSON.stringify(session));
    setStudentSession(session);
    setRole('STUDENT');
  };

  const updateStudentAttendance = (attendance: any) => {
    if (studentSession) {
      const updated = { ...studentSession, attendance };
      localStorage.setItem('student_session', JSON.stringify(updated));
      setStudentSession(updated);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('student_session');
    setToken(null);
    setAdminUser(null);
    setStudentSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        adminUser,
        studentSession,
        token,
        isLoading,
        loginAdmin,
        loginStudent,
        updateStudentAttendance,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
