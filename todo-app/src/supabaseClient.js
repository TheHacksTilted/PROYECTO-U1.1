import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' ? supabaseAnonKey : 'placeholder-key'

export const supabase = createClient(finalUrl, finalKey)
