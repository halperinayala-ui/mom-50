import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GreetingType = 'text' | 'image' | 'video' | 'audio';

export interface Greeting {
  id: string;
  sender: string;
  type: GreetingType;
  content: string;
  media_url?: string;
  created_at: string;
  scheduled_for?: string | null;
  is_private: boolean;
  uploaded_by?: string;
  liked_by_mom?: boolean;
  is_approved?: boolean;
  read_by?: string[];
  is_journal_entry?: boolean;
}

export interface Comment {
  id: string;
  greeting_id: string;
  author: string;
  content: string;
  created_at: string;
}
