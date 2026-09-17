import { supabase } from './config/supabase.js';

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success, tables exist.');
  }
}
check();
