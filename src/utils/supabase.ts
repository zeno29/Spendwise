import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uycynlzxarznrgdovpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3lubHp4YXJ6bnJnZG92cHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzM0MzIsImV4cCI6MjA5NDg0OTQzMn0.adDv9M8AYDyEzB3c80pWIHg7kpKry9m0Tq7WThYMdpc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
