import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.SUPABASE_URL || 'https://mrbiwdvlbimpiicyvodg.supabase.co';
const supabaseKey: string | undefined = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey || '');

export default supabase;
