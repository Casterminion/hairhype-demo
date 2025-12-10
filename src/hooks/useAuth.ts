import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_TOKEN_KEY = 'admin_session_token';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  session: { token: string; expires_at: string } | null;
  user: AdminUser | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<{ token: string; expires_at: string } | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('verify_admin_session', {
        p_token: token,
      });

      if (error || !data) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        setSession(null);
        setUser(null);
      } else {
        setSession({ token, expires_at: data.expires_at });
        setUser({
          id: data.user_id,
          email: data.email,
          full_name: data.full_name,
        });
      }
    } catch (err) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { session, user, loading };
}

export async function login(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.rpc('admin_login', {
    p_email: email,
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.token) {
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    window.location.href = '/admin/calendar';
  }
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);

  if (token) {
    try {
      await supabase.rpc('admin_logout', { p_token: token });
    } catch (err) {
      // Ignore errors on logout
    }
  }

  localStorage.removeItem(SESSION_TOKEN_KEY);
  window.location.href = '/admin/login';
}
