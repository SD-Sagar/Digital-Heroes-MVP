import { supabase } from './config/supabase.js';

async function promote() {
  const { data: users, error: fetchError } = await supabase.from('profiles').select('*').limit(1);
  if (fetchError || !users || users.length === 0) {
    console.log('No users found to promote.');
    return;
  }
  
  const user = users[0];
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Failed to promote:', updateError.message);
  } else {
    console.log(`Successfully promoted ${user.email} to admin!`);
  }
}
promote();
