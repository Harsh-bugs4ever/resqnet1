import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { profilesApi } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ session });
      await get().fetchProfile();
    }
    set({ loading: false });

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session });
      if (session) {
        await get().fetchProfile();
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  fetchProfile: async () => {
    try {
      const profile = await profilesApi.getMe();
      set({ profile, user: profile });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  },

  signIn: async (email, password) => {
    set({ error: null, loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }
    set({ session: data.session, loading: false });
    await get().fetchProfile();
    return { data };
  },

  signUp: async (email, password, fullName, role = 'rescue_team') => {
    set({ error: null, loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }
    set({ loading: false });
    return { data };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },

  clearError: () => set({ error: null }),
}));
